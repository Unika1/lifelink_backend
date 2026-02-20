import request from 'supertest';
import { UserModel } from '../../models/user.model';
import { EligibilityQuestionnaireModel } from '../../models/eligibility.model';

jest.mock('../../middlewares/upload.middleware', () => ({
    uploads: {
        single: () => (req: unknown, res: unknown, next: () => void) => next(),
        array: () => (req: unknown, res: unknown, next: () => void) => next(),
        fields: () => (req: unknown, res: unknown, next: () => void) => next(),
    }
}));

import app from '../../app';

describe('Eligibility Integration Tests', () => {
    const donorUser = {
        email: 'eligibility-donor@test.com',
        password: 'Donor@1234',
        confirmPassword: 'Donor@1234',
        username: 'eligibilitydonor',
        firstName: 'Eligibility',
        lastName: 'Donor',
        role: 'donor',
    };

    let donorToken: string;
    let donorId: string;

    beforeAll(async () => {
        await UserModel.deleteMany({ email: donorUser.email });

        await request(app)
            .post('/api/auth/register')
            .send(donorUser);

        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                email: donorUser.email,
                password: donorUser.password,
            });

        donorToken = loginResponse.body.token;
        donorId = loginResponse.body.data._id;
    });

    afterAll(async () => {
        if (donorId) {
            await EligibilityQuestionnaireModel.deleteMany({ userId: donorId });
        }
        await UserModel.deleteMany({ email: donorUser.email });
    });

    test('should reject unrealistic weight in questionnaire submission', async () => {
        const response = await request(app)
            .post('/api/eligibility/submit')
            .set('Authorization', `Bearer ${donorToken}`)
            .send({
                age: 25,
                weight: 10000000,
                gender: 'male',
            });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message');
    });

    test('should mark user as not eligible when legacy questionnaire has unrealistic weight', async () => {
        const submitResponse = await request(app)
            .post('/api/eligibility/submit')
            .set('Authorization', `Bearer ${donorToken}`)
            .send({
                age: 25,
                weight: 70,
                gender: 'male',
            });

        expect(submitResponse.status).toBe(201);

        await EligibilityQuestionnaireModel.updateOne(
            { _id: submitResponse.body.data._id },
            { $set: { weight: 10000000 } },
            { runValidators: false }
        );

        const checkResponse = await request(app)
            .get('/api/eligibility/check')
            .set('Authorization', `Bearer ${donorToken}`);

        expect(checkResponse.status).toBe(200);
        expect(checkResponse.body).toHaveProperty('data');
        expect(checkResponse.body.data).toHaveProperty('eligible', false);
        expect(Array.isArray(checkResponse.body.data.reasons)).toBe(true);
        expect(
            checkResponse.body.data.reasons.some((reason: string) =>
                reason.includes('Weight appears unrealistic')
            )
        ).toBe(true);
    });
});
