import request from 'supertest';
import bcryptjs from 'bcryptjs';
import { UserModel } from '../../models/user.model';
import { BloodRequestModel } from '../../models/blood-request.model';

jest.mock('../../middlewares/upload.middleware', () => ({
    uploads: {
        single: () => (req: unknown, res: unknown, next: () => void) => next(),
        array: () => (req: unknown, res: unknown, next: () => void) => next(),
        fields: () => (req: unknown, res: unknown, next: () => void) => next(),
    }
}));

import app from '../../app';

describe('Blood Request Date Validation Integration Tests', () => {
    const adminUser = {
        email: 'admin@blood-date-test.com',
        password: 'Admin@1234',
        firstName: 'Admin',
        lastName: 'DateTest',
        role: 'admin',
    };

    let adminToken: string;
    let bloodRequestId: string;

    beforeAll(async () => {
        await UserModel.deleteMany({ email: adminUser.email });

        const hashedPassword = await bcryptjs.hash(adminUser.password, 10);
        await UserModel.create({
            ...adminUser,
            password: hashedPassword,
        });

        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                email: adminUser.email,
                password: adminUser.password,
            });

        adminToken = loginResponse.body.token;
    });

    afterAll(async () => {
        if (bloodRequestId) {
            await BloodRequestModel.deleteMany({ _id: bloodRequestId });
        }
        await UserModel.deleteMany({ email: adminUser.email });
    });

    test('should reject approving a blood request with past scheduled date', async () => {
        const createResponse = await request(app)
            .post('/api/requests')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                hospitalName: 'Date Test Hospital',
                patientName: 'Test Patient',
                bloodType: 'A+',
                unitsRequested: 2,
            });

        expect(createResponse.status).toBe(201);
        bloodRequestId = createResponse.body.data._id;

        const approveResponse = await request(app)
            .put(`/api/requests/${bloodRequestId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                status: 'approved',
                scheduledAt: '2025-01-01T10:00:00.000Z',
            });

        expect(approveResponse.status).toBe(400);
        expect(approveResponse.body).toHaveProperty('message');
    });
});
