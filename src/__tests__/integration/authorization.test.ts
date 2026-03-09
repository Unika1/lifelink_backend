import request from 'supertest';
import bcryptjs from 'bcryptjs';
import { UserModel } from '../../models/user.model';
import { HospitalModel } from '../../models/hospital.model';

jest.mock('../../middlewares/upload.middleware', () => ({
    uploads: {
        single: () => (req: unknown, res: unknown, next: () => void) => next(),
        array: () => (req: unknown, res: unknown, next: () => void) => next(),
        fields: () => (req: unknown, res: unknown, next: () => void) => next(),
    }
}));

import app from '../../app';

describe(
    'Authorization & Role-Based Access Tests',
    () => {
        const adminUser = {
            'email': 'admin@auth-test.com',
            'password': 'Admin@1234',
            'username': 'adminuser',
            'firstName': 'Admin',
            'lastName': 'User',
            'role': 'admin'
        }

        const donorUser = {
            'email': 'donor@auth-test.com',
            'password': 'Donor@1234',
            'username': 'donoruser',
            'firstName': 'Donor',
            'lastName': 'User',
            'role': 'donor'
        }

        const hospitalUser = {
            'email': 'hospital@auth-test.com',
            'password': 'Hospital@1234',
            'username': 'hospitaluser',
            'firstName': 'Hospital',
            'lastName': 'User',
            'role': 'hospital'
        }

        let adminToken: string;
        let donorToken: string;
        let hospitalToken: string;

        beforeAll(async () => {
            // Clean up existing test data
            await UserModel.deleteMany({ 
                email: { 
                    $in: [
                        adminUser.email,
                        donorUser.email,
                        hospitalUser.email,
                        'hospital-auth@test.com',
                        'admin-created@test.com',
                        'donor-created@test.com'
                    ] 
                } 
            });

            await HospitalModel.deleteMany({
                email: { $in: ['hospital-auth@test.com', 'unauthorized@test.com'] }
            });

            // Create admin, donor, and hospital users directly with hashed passwords, then login
            const adminHashedPassword = await bcryptjs.hash(adminUser.password, 10);
            const donorHashedPassword = await bcryptjs.hash(donorUser.password, 10);
            const hospitalHashedPassword = await bcryptjs.hash(hospitalUser.password, 10);

            await UserModel.create({
                ...adminUser,
                password: adminHashedPassword,
                role: 'admin'
            });

            // Ensure role is set to admin even if defaults apply
            await UserModel.updateOne({ email: adminUser.email }, { role: 'admin' });

            await UserModel.create({
                ...donorUser,
                password: donorHashedPassword,
                role: 'donor'
            });

            await UserModel.create({
                ...hospitalUser,
                password: hospitalHashedPassword,
                role: 'hospital'
            });

            const adminLoginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: adminUser.email,
                    password: adminUser.password
                });

            adminToken = adminLoginResponse.body.token;

            const donorLoginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: donorUser.email,
                    password: donorUser.password
                });

            donorToken = donorLoginResponse.body.token;

            const hospitalLoginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: hospitalUser.email,
                    password: hospitalUser.password
                });

            hospitalToken = hospitalLoginResponse.body.token;
        });

        afterAll(async () => {
            // Clean up test data
            await UserModel.deleteMany({ 
                email: { 
                    $in: [
                        adminUser.email,
                        donorUser.email,
                        hospitalUser.email,
                        'hospital-auth@test.com',
                        'admin-created@test.com',
                        'donor-created@test.com'
                    ] 
                } 
            });

            await HospitalModel.deleteMany({
                email: { $in: ['hospital-auth@test.com', 'unauthorized@test.com'] }
            });
        });

        describe(
            'Token Validation',
            () => {
                test(
                    'should reject requests without token to protected routes',
                    async () => {
                        const response = await request(app)
                            .put('/api/auth/update-profile')
                            .send({
                                firstName: 'Test'
                            })
                        expect(response.status).toBe(401);
                        expect(response.body).toHaveProperty('message');
                    }
                )

                test(
                    'should reject requests with invalid token',
                    async () => {
                        const response = await request(app)
                            .put('/api/auth/update-profile')
                            .set('Authorization', 'Bearer invalid-token-12345')
                            .send({
                                firstName: 'Test'
                            })
                        expect(response.status).toBe(401);
                        expect(response.body).toHaveProperty('message');
                    }
                )

                test(
                    'should reject requests with expired token',
                    async () => {
                        const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQ1Njc4OTAiLCJleHAiOjE1MTYyMzkwMjJ9.4Adcj0vPnz8H8QCFJ5TqvvnYqLkpgKe_xB4vBqGxVCk';
                        
                        const response = await request(app)
                            .put('/api/auth/update-profile')
                            .set('Authorization', `Bearer ${expiredToken}`)
                            .send({
                                firstName: 'Test'
                            })
                        expect(response.status).toBe(401);
                        expect(response.body).toHaveProperty('message');
                    }
                )

                test(
                    'should accept requests with valid admin token',
                    async () => {
                        const response = await request(app)
                            .put('/api/auth/update-profile')
                            .set('Authorization', `Bearer ${adminToken}`)
                            .send({
                                firstName: 'UpdatedAdmin',
                                role: 'admin'
                            })
                        expect(response.status).toBe(200);
                        expect(response.body).toHaveProperty('data');
                    }
                )

                test(
                    'should accept requests with valid donor token',
                    async () => {
                        const response = await request(app)
                            .put('/api/auth/update-profile')
                            .set('Authorization', `Bearer ${donorToken}`)
                            .send({
                                firstName: 'UpdatedDonor',
                                role: 'donor'
                            })
                        expect(response.status).toBe(200);
                        expect(response.body).toHaveProperty('data');
                    }
                )

                test(
                    'should accept requests with valid hospital token',
                    async () => {
                        const response = await request(app)
                            .put('/api/auth/update-profile')
                            .set('Authorization', `Bearer ${hospitalToken}`)
                            .send({
                                firstName: 'UpdatedHospital',
                                role: 'hospital'
                            })
                        expect(response.status).toBe(200);
                        expect(response.body).toHaveProperty('data');
                    }
                )
            }
        )

        describe(
            'Admin-Only Route Protection',
            () => {
                test(
                    'should allow admin to access admin routes',
                    async () => {
                        const response = await request(app)
                            .get('/api/admin/users')
                            .set('Authorization', `Bearer ${adminToken}`)
                        expect(response.status).toBe(200);
                        expect(response.body).toHaveProperty('data');
                    }
                )

                test(
                    'should deny donor access to admin routes',
                    async () => {
                        const response = await request(app)
                            .get('/api/admin/users')
                            .set('Authorization', `Bearer ${donorToken}`)
                        expect(response.status).toBe(403);
                        expect(response.body).toHaveProperty('message');
                    }
                )

                test(
                    'should deny hospital access to admin routes',
                    async () => {
                        const response = await request(app)
                            .get('/api/admin/users')
                            .set('Authorization', `Bearer ${hospitalToken}`)
                        expect(response.status).toBe(403);
                        expect(response.body).toHaveProperty('message');
                    }
                )

                test(
                    'should deny unauthenticated access to admin routes',
                    async () => {
                        const response = await request(app)
                            .get('/api/admin/users')
                        expect(response.status).toBe(401);
                        expect(response.body).toHaveProperty('message');
                    }
                )
            }
        )

        describe(
            'Public vs Protected Route Access',
            () => {
                test(
                    'should allow unauthenticated access to public routes',
                    async () => {
                        const response = await request(app)
                            .get('/api/hospitals')
                        expect(response.status).toBe(200);
                        expect(response.body).toHaveProperty('data');
                    }
                )

                test(
                    'should allow authenticated users to access public routes',
                    async () => {
                        const response = await request(app)
                            .get('/api/hospitals')
                            .set('Authorization', `Bearer ${donorToken}`)
                        expect(response.status).toBe(200);
                        expect(response.body).toHaveProperty('data');
                    }
                )

                test(
                    'should deny unauthenticated access to protected update routes',
                    async () => {
                        const response = await request(app)
                            .put('/api/auth/update-profile')
                            .send({
                                firstName: 'Test'
                            })
                        expect(response.status).toBe(401);
                        expect(response.body).toHaveProperty('message');
                    }
                )
            }
        )

        describe(
            'Role-Based Resource Creation',
            () => {
                test(
                    'should allow admin to create hospitals',
                    async () => {
                        const response = await request(app)
                            .post('/api/hospitals')
                            .set('Authorization', `Bearer ${adminToken}`)
                            .send({
                                name: 'Test Hospital Auth',
                                email: 'hospital-auth@test.com',
                                username: 'hospitalauthtest',
                                password: 'Hospital@1234',
                                confirmPassword: 'Hospital@1234',
                                phoneNumber: '1234567890',
                                address: {
                                    street: '123 Test St',
                                    city: 'Test City',
                                    state: 'Test State',
                                    zipCode: '12345',
                                    country: 'Nepal'
                                }
                            })
                        expect(response.status).toBe(201);
                        expect(response.body).toHaveProperty('message');
                        expect(response.body).toHaveProperty('data');
                    }
                )

                test(
                    'should deny donor from creating hospitals',
                    async () => {
                        const response = await request(app)
                            .post('/api/hospitals')
                            .set('Authorization', `Bearer ${donorToken}`)
                            .send({
                                name: 'Unauthorized Hospital',
                                email: 'unauthorized@test.com',
                                phoneNumber: '1234567890',
                                address: {
                                    street: '123 Test St',
                                    city: 'Test City',
                                    state: 'Test State',
                                    zipCode: '12345',
                                    country: 'Nepal'
                                }
                            })
                        expect(response.status).toBe(403);
                        expect(response.body).toHaveProperty('message');
                    }
                )

                test(
                    'should allow admin to create users',
                    async () => {
                        const response = await request(app)
                            .post('/api/admin/users')
                            .set('Authorization', `Bearer ${adminToken}`)
                            .send({
                                email: 'admin-created@test.com',
                                password: 'Test@1234',
                                confirmPassword: 'Test@1234',
                                username: 'admincreated',
                                firstName: 'Admin',
                                lastName: 'Created',
                                role: 'donor'
                            })
                        expect(response.status).toBe(201);
                        expect(response.body).toHaveProperty('message');
                        expect(response.body).toHaveProperty('data');
                    }
                )

                test(
                    'should deny donor from creating users',
                    async () => {
                        const response = await request(app)
                            .post('/api/admin/users')
                            .set('Authorization', `Bearer ${donorToken}`)
                            .send({
                                email: 'donor-created@test.com',
                                password: 'Test@1234',
                                username: 'donorcreated',
                                firstName: 'Donor',
                                lastName: 'Created',
                                role: 'donor'
                            })
                        expect(response.status).toBe(403);
                        expect(response.body).toHaveProperty('message');
                    }
                )
            }
        )
    }
)

