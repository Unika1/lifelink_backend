import request from 'supertest';
import bcryptjs from 'bcryptjs';
import { HospitalModel } from '../../models/hospital.model';
import { UserModel } from '../../models/user.model';

jest.mock('../../middlewares/upload.middleware', () => ({
    uploads: {
        single: () => (req: unknown, res: unknown, next: () => void) => next(),
        array: () => (req: unknown, res: unknown, next: () => void) => next(),
        fields: () => (req: unknown, res: unknown, next: () => void) => next(),
    }
}));

import app from '../../app';

describe(
    'Hospital Integration Tests',
    () => {
        const adminUser = {
            'email': 'admin@hospital-test.com',
            'password': 'Admin@1234',
            'username': 'adminuser',
            'firstName': 'Admin',
            'lastName': 'User',
            'role': 'hospital'
        }

        const testHospital = {
            'name': 'Test Hospital',
            'email': 'hospital@test.com',
            'username': 'testhospital',
            'password': 'Hospital@1234',
            'confirmPassword': 'Hospital@1234',
            'phoneNumber': '1234567890',
            'address': {
                'street': '123 Test Street',
                'city': 'Test City',
                'state': 'Test State',
                'zipCode': '12345',
                'country': 'Nepal'
            }
        }

        let adminToken: string;
        let hospitalId: string;

        beforeAll(async () => {
            // Clean up existing test data
            await UserModel.deleteMany({ email: { $in: [adminUser.email, testHospital.email] } });
            await HospitalModel.deleteMany({ email: testHospital.email });

            // Create admin user directly with hashed password, then login
            const hashedPassword = await bcryptjs.hash(adminUser.password, 10);
            await UserModel.create({
                ...adminUser,
                password: hashedPassword,
                role: 'admin'
            });

            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: adminUser.email,
                    password: adminUser.password
                });

            adminToken = loginResponse.body.token;
        });

        afterAll(async () => {
            // Clean up test data
            await UserModel.deleteMany({ email: { $in: [adminUser.email, testHospital.email] } });
            await HospitalModel.deleteMany({ email: testHospital.email });
        });

        describe(
            'POST /api/hospitals',
            () => {
                test(
                    'should create a new hospital successfully by admin',
                    async () => {
                        const response = await request(app)
                            .post('/api/hospitals')
                            .set('Authorization', `Bearer ${adminToken}`)
                            .send(testHospital)
                        expect(response.status).toBe(201);
                        expect(response.body).toHaveProperty('message', 'Hospital created successfully');
                        expect(response.body).toHaveProperty('data');
                        expect(response.body.data).toHaveProperty('name', testHospital.name);
                        expect(response.body.data).toHaveProperty('email', testHospital.email);

                        // Store hospitalId for later tests
                        hospitalId = response.body.data._id;
                    }
                )

                test(
                    'should fail to create hospital without admin token',
                    async () => {
                        const response = await request(app)
                            .post('/api/hospitals')
                            .send({
                                ...testHospital,
                                email: 'another@hospital.com'
                            })
                        expect(response.status).toBe(401);
                        expect(response.body).toHaveProperty('message');
                    }
                )

                test(
                    'should fail to create hospital with missing required fields',
                    async () => {
                        const response = await request(app)
                            .post('/api/hospitals')
                            .set('Authorization', `Bearer ${adminToken}`)
                            .send({
                                name: 'Incomplete Hospital'
                                // Missing required fields
                            })
                        expect(response.status).toBe(400);
                        expect(response.body).toHaveProperty('message');
                    }
                )

                test(
                    'should fail to create hospital with duplicate email',
                    async () => {
                        const response = await request(app)
                            .post('/api/hospitals')
                            .set('Authorization', `Bearer ${adminToken}`)
                            .send(testHospital) // Same email
                        expect(response.status).toBe(403);
                        expect(response.body).toHaveProperty('message');
                    }
                )
            }
        )

        describe(
            'GET /api/hospitals',
            () => {
                test(
                    'should get all hospitals successfully',
                    async () => {
                        const response = await request(app)
                            .get('/api/hospitals')
                        expect(response.status).toBe(200);
                        expect(response.body).toHaveProperty('data');
                        expect(Array.isArray(response.body.data)).toBe(true);
                    }
                )

                test(
                    'should search hospitals by name',
                    async () => {
                        const response = await request(app)
                            .get('/api/hospitals?search=Test')
                        expect(response.status).toBe(200);
                        expect(response.body).toHaveProperty('data');
                        expect(Array.isArray(response.body.data)).toBe(true);
                    }
                )
            }
        )

        describe(
            'GET /api/hospitals/:id',
            () => {
                test(
                    'should get hospital by ID successfully',
                    async () => {
                        const response = await request(app)
                            .get(`/api/hospitals/${hospitalId}`)
                        expect(response.status).toBe(200);
                        expect(response.body).toHaveProperty('data');
                        expect(response.body.data).toHaveProperty('_id', hospitalId);
                        expect(response.body.data).toHaveProperty('name', testHospital.name);
                    }
                )

                test(
                    'should fail to get hospital with invalid ID',
                    async () => {
                        const response = await request(app)
                            .get('/api/hospitals/invalid-id-123')
                        expect(response.status).toBe(500);
                        expect(response.body).toHaveProperty('message');
                    }
                )

                test(
                    'should fail to get non-existent hospital',
                    async () => {
                        const response = await request(app)
                            .get('/api/hospitals/507f1f77bcf86cd799439011') // Valid but non-existent MongoDB ID
                        expect(response.status).toBe(404);
                        expect(response.body).toHaveProperty('message');
                    }
                )
            }
        )

        describe(
            'PUT /api/hospitals/:id',
            () => {
                test(
                    'should update hospital successfully with admin token',
                    async () => {
                        const response = await request(app)
                            .put(`/api/hospitals/${hospitalId}`)
                            .set('Authorization', `Bearer ${adminToken}`)
                            .send({
                                name: 'Updated Test Hospital',
                                phoneNumber: '9876543210'
                            })
                        expect(response.status).toBe(200);
                        expect(response.body).toHaveProperty('message');
                        expect(response.body).toHaveProperty('data');
                        expect(response.body.data).toHaveProperty('name', 'Updated Test Hospital');
                        expect(response.body.data).toHaveProperty('phoneNumber', '9876543210');
                    }
                )

                test(
                    'should fail to update hospital without token',
                    async () => {
                        const response = await request(app)
                            .put(`/api/hospitals/${hospitalId}`)
                            .send({
                                name: 'Unauthorized Update'
                            })
                        expect(response.status).toBe(401);
                        expect(response.body).toHaveProperty('message');
                    }
                )

                test(
                    'should fail to update non-existent hospital',
                    async () => {
                        const response = await request(app)
                            .put('/api/hospitals/507f1f77bcf86cd799439011') // Valid but non-existent MongoDB ID
                            .set('Authorization', `Bearer ${adminToken}`)
                            .send({
                                name: 'Non-existent Hospital'
                            })
                        expect(response.status).toBe(404);
                        expect(response.body).toHaveProperty('message');
                    }
                )
            }
        )

        describe(
            'DELETE /api/hospitals/:id',
            () => {
                test(
                    'should fail to delete hospital without admin token',
                    async () => {
                        const response = await request(app)
                            .delete(`/api/hospitals/${hospitalId}`)
                        expect(response.status).toBe(401);
                        expect(response.body).toHaveProperty('message');
                    }
                )

                test(
                    'should delete hospital successfully with admin token',
                    async () => {
                        const response = await request(app)
                            .delete(`/api/hospitals/${hospitalId}`)
                            .set('Authorization', `Bearer ${adminToken}`)
                        expect(response.status).toBe(200);
                        expect(response.body).toHaveProperty('message');
                    }
                )

                test(
                    'should fail to delete non-existent hospital',
                    async () => {
                        const response = await request(app)
                            .delete('/api/hospitals/507f1f77bcf86cd799439011') // Valid but non-existent MongoDB ID
                            .set('Authorization', `Bearer ${adminToken}`)
                        expect(response.status).toBe(404);
                        expect(response.body).toHaveProperty('message');
                    }
                )
            }
        )
    }
)

