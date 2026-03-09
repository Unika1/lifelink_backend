import request from 'supertest';
import bcryptjs from 'bcryptjs';
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
    'Admin User Management Integration Tests',
    () => {
        const adminUser = {
            'email': 'admin@user-test.com',
            'password': 'Admin@1234',
            'username': 'adminuser',
            'firstName': 'Admin',
            'lastName': 'User',
            'role': 'admin'
        }

        const donorUser = {
            'email': 'donor@user-test.com',
            'password': 'Donor@1234',
            'username': 'donoruser',
            'firstName': 'Donor',
            'lastName': 'User',
            'role': 'donor'
        }

        const newUser = {
            'email': 'newuser@test.com',
            'password': 'NewUser@1234',
            'confirmPassword': 'NewUser@1234',
            'username': 'newuser',
            'firstName': 'New',
            'lastName': 'User',
            'role': 'donor'
        }

        let adminToken: string;
        let donorToken: string;
        let createdUserId: string;

        beforeAll(async () => {
            // Clean up existing test data
            await UserModel.deleteMany({ 
                email: { 
                    $in: [adminUser.email, donorUser.email, newUser.email] 
                } 
            });

            // Create admin and donor users directly with hashed passwords, then login
            const adminHashedPassword = await bcryptjs.hash(adminUser.password, 10);
            const donorHashedPassword = await bcryptjs.hash(donorUser.password, 10);

            await UserModel.create({
                ...adminUser,
                password: adminHashedPassword,
                role: 'admin'
            });

            await UserModel.create({
                ...donorUser,
                password: donorHashedPassword,
                role: 'donor'
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
        });

        afterAll(async () => {
            // Clean up test data
            await UserModel.deleteMany({ 
                email: { 
                    $in: [adminUser.email, donorUser.email, newUser.email] 
                } 
            });
        });

        describe(
            'POST /api/admin/users',
            () => {
                test(
                    'should create a new user successfully by admin',
                    async () => {
                        const response = await request(app)
                            .post('/api/admin/users')
                            .set('Authorization', `Bearer ${adminToken}`)
                            .send(newUser)
                        expect(response.status).toBe(201);
                        expect(response.body).toHaveProperty('message', 'User created successfully');
                        expect(response.body).toHaveProperty('data');
                        expect(response.body.data).toHaveProperty('email', newUser.email);

                        // Store userId for later tests
                        createdUserId = response.body.data._id;
                    }
                )

                test(
                    'should fail to create user without admin token',
                    async () => {
                        const response = await request(app)
                            .post('/api/admin/users')
                            .send({
                                ...newUser,
                                email: 'unauthorized@test.com'
                            })
                        expect(response.status).toBe(401);
                        expect(response.body).toHaveProperty('message');
                    }
                )

                test(
                    'should fail to create user with donor token',
                    async () => {
                        const response = await request(app)
                            .post('/api/admin/users')
                            .set('Authorization', `Bearer ${donorToken}`)
                            .send({
                                ...newUser,
                                email: 'forbidden@test.com'
                            })
                        expect(response.status).toBe(403);
                        expect(response.body).toHaveProperty('message');
                    }
                )

                test(
                    'should fail to create user with missing required fields',
                    async () => {
                        const response = await request(app)
                            .post('/api/admin/users')
                            .set('Authorization', `Bearer ${adminToken}`)
                            .send({
                                email: 'incomplete@test.com'
                                // Missing required fields
                            })
                        expect(response.status).toBe(400);
                        expect(response.body).toHaveProperty('message');
                    }
                )

                test(
                    'should fail to create user with duplicate email',
                    async () => {
                        const response = await request(app)
                            .post('/api/admin/users')
                            .set('Authorization', `Bearer ${adminToken}`)
                            .send(newUser) // Same email as already created
                        expect(response.status).toBe(403);
                        expect(response.body).toHaveProperty('message');
                    }
                )
            }
        )

        describe(
            'GET /api/admin/users',
            () => {
                test(
                    'should get all users successfully with admin token',
                    async () => {
                        const response = await request(app)
                            .get('/api/admin/users')
                            .set('Authorization', `Bearer ${adminToken}`)
                        expect(response.status).toBe(200);
                        expect(response.body).toHaveProperty('data');
                        expect(Array.isArray(response.body.data)).toBe(true);
                        expect(response.body.data.length).toBeGreaterThan(0);
                    }
                )

                test(
                    'should fail to get all users without token',
                    async () => {
                        const response = await request(app)
                            .get('/api/admin/users')
                        expect(response.status).toBe(401);
                        expect(response.body).toHaveProperty('message');
                    }
                )

                test(
                    'should fail to get all users with donor token',
                    async () => {
                        const response = await request(app)
                            .get('/api/admin/users')
                            .set('Authorization', `Bearer ${donorToken}`)
                        expect(response.status).toBe(403);
                        expect(response.body).toHaveProperty('message');
                    }
                )
            }
        )

        describe(
            'GET /api/admin/users/:id',
            () => {
                test(
                    'should get user by ID successfully with admin token',
                    async () => {
                        const response = await request(app)
                            .get(`/api/admin/users/${createdUserId}`)
                            .set('Authorization', `Bearer ${adminToken}`)
                        expect(response.status).toBe(200);
                        expect(response.body).toHaveProperty('data');
                        expect(response.body.data).toHaveProperty('_id', createdUserId);
                        expect(response.body.data).toHaveProperty('email', newUser.email);
                    }
                )

                test(
                    'should fail to get user by ID without token',
                    async () => {
                        const response = await request(app)
                            .get(`/api/admin/users/${createdUserId}`)
                        expect(response.status).toBe(401);
                        expect(response.body).toHaveProperty('message');
                    }
                )

                test(
                    'should fail to get user by ID with donor token',
                    async () => {
                        const response = await request(app)
                            .get(`/api/admin/users/${createdUserId}`)
                            .set('Authorization', `Bearer ${donorToken}`)
                        expect(response.status).toBe(403);
                        expect(response.body).toHaveProperty('message');
                    }
                )

                test(
                    'should fail to get user with invalid ID',
                    async () => {
                        const response = await request(app)
                            .get('/api/admin/users/invalid-id-123')
                            .set('Authorization', `Bearer ${adminToken}`)
                        expect(response.status).toBe(500);
                        expect(response.body).toHaveProperty('message');
                    }
                )

                test(
                    'should fail to get non-existent user',
                    async () => {
                        const response = await request(app)
                            .get('/api/admin/users/507f1f77bcf86cd799439011') // Valid but non-existent MongoDB ID
                            .set('Authorization', `Bearer ${adminToken}`)
                        expect(response.status).toBe(404);
                        expect(response.body).toHaveProperty('message');
                    }
                )
            }
        )

        describe(
            'PUT /api/admin/users/:id',
            () => {
                test(
                    'should update user successfully with admin token',
                    async () => {
                        const response = await request(app)
                            .put(`/api/admin/users/${createdUserId}`)
                            .set('Authorization', `Bearer ${adminToken}`)
                            .send({
                                firstName: 'UpdatedFirst',
                                lastName: 'UpdatedLast'
                            })
                        expect(response.status).toBe(200);
                        expect(response.body).toHaveProperty('message');
                        expect(response.body).toHaveProperty('data');
                        expect(response.body.data).toHaveProperty('firstName', 'UpdatedFirst');
                        expect(response.body.data).toHaveProperty('lastName', 'UpdatedLast');
                    }
                )

                test(
                    'should fail to update user without token',
                    async () => {
                        const response = await request(app)
                            .put(`/api/admin/users/${createdUserId}`)
                            .send({
                                firstName: 'Unauthorized'
                            })
                        expect(response.status).toBe(401);
                        expect(response.body).toHaveProperty('message');
                    }
                )

                test(
                    'should fail to update user with donor token',
                    async () => {
                        const response = await request(app)
                            .put(`/api/admin/users/${createdUserId}`)
                            .set('Authorization', `Bearer ${donorToken}`)
                            .send({
                                firstName: 'Forbidden'
                            })
                        expect(response.status).toBe(403);
                        expect(response.body).toHaveProperty('message');
                    }
                )

                test(
                    'should fail to update non-existent user',
                    async () => {
                        const response = await request(app)
                            .put('/api/admin/users/507f1f77bcf86cd799439011') // Valid but non-existent MongoDB ID
                            .set('Authorization', `Bearer ${adminToken}`)
                            .send({
                                firstName: 'NonExistent'
                            })
                        expect(response.status).toBe(404);
                        expect(response.body).toHaveProperty('message');
                    }
                )
            }
        )

        describe(
            'DELETE /api/admin/users/:id',
            () => {
                test(
                    'should fail to delete user without token',
                    async () => {
                        const response = await request(app)
                            .delete(`/api/admin/users/${createdUserId}`)
                        expect(response.status).toBe(401);
                        expect(response.body).toHaveProperty('message');
                    }
                )

                test(
                    'should fail to delete user with donor token',
                    async () => {
                        const response = await request(app)
                            .delete(`/api/admin/users/${createdUserId}`)
                            .set('Authorization', `Bearer ${donorToken}`)
                        expect(response.status).toBe(403);
                        expect(response.body).toHaveProperty('message');
                    }
                )

                test(
                    'should delete user successfully with admin token',
                    async () => {
                        const response = await request(app)
                            .delete(`/api/admin/users/${createdUserId}`)
                            .set('Authorization', `Bearer ${adminToken}`)
                        expect(response.status).toBe(200);
                        expect(response.body).toHaveProperty('message');
                    }
                )

                test(
                    'should fail to delete non-existent user',
                    async () => {
                        const response = await request(app)
                            .delete('/api/admin/users/507f1f77bcf86cd799439011') // Valid but non-existent MongoDB ID
                            .set('Authorization', `Bearer ${adminToken}`)
                        expect(response.status).toBe(404);
                        expect(response.body).toHaveProperty('message');
                    }
                )
            }
        )
    }
)

