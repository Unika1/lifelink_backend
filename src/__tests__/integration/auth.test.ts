import request from 'supertest';
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
    'Authentication Integration Tests',  // Test Suite/Group name
    () => { // Test Suite function
        const testUser = {
            'email': 'test@example.com',
            'password': 'Test@1234',
            'confirmPassword': 'Test@1234',
            'username': 'testuser',
            'firstName': 'Test',
            'lastName': 'User',
            'role': 'donor'
        }

        let authToken: string;
        let userId: string;

        beforeAll(async () => {
            // Ensure the test user does not exist before tests
            await UserModel.deleteMany({ email: testUser.email });
        });

        afterAll(async () => {
            // Clean up the test user after tests
            await UserModel.deleteMany({ email: testUser.email });
        });

        describe(
            'POST /api/auth/register', // Test Case name
            () => { // Test Case function
                test(
                    'should register a new user successfully', // Test name
                    async () => { // Test function
                        const response = await request(app)
                            .post('/api/auth/register')
                            .send(testUser)
                        
                        // Validate response structure
                        expect(response.status).toBe(201);
                        expect(response.body).toHaveProperty('message', 'User Created');
                        expect(response.body).toHaveProperty('data');
                        expect(response.body.data).toHaveProperty('email', testUser.email);

                        // Store userId for later tests
                        userId = response.body.data._id;
                    }
                )

                test(
                    'should fail to register a user with existing email', // Test name
                    async () => { // Test function
                        const response = await request(app)
                            .post('/api/auth/register')
                            .send(testUser) // same user details
                        
                        // Validate response structure
                        expect(response.status).toBe(403);
                        expect(response.body).toHaveProperty('message');
                    }
                )

                test(
                    'should fail to register without required fields', // Test name
                    async () => { // Test function
                        const response = await request(app)
                            .post('/api/auth/register')
                            .send({
                                email: 'incomplete@example.com'
                                // Missing required fields
                            })
                        
                        // Validate response structure
                        expect(response.status).toBe(400);
                        expect(response.body).toHaveProperty('message');
                    }
                )

                test(
                    'should fail to register with invalid email format', // Test name
                    async () => { // Test function
                        const response = await request(app)
                            .post('/api/auth/register')
                            .send({
                                ...testUser,
                                email: 'invalid-email'
                            })
                        
                        // Validate response structure
                        expect(response.status).toBe(400);
                        expect(response.body).toHaveProperty('message');
                    }
                )
            }
        )

        describe(
            'POST /api/auth/login', // Test Case name
            () => { // Test Case function
                test(
                    'should login successfully with correct credentials', // Test name
                    async () => { // Test function
                        const response = await request(app)
                            .post('/api/auth/login')
                            .send({
                                email: testUser.email,
                                password: testUser.password
                            })
                        
                        // Validate response structure
                        expect(response.status).toBe(200);
                        expect(response.body).toHaveProperty('message', 'Login successful');
                        expect(response.body).toHaveProperty('data');
                        expect(response.body).toHaveProperty('token');

                        // Store token for protected route tests
                        authToken = response.body.token;
                    }
                )

                test(
                    'should fail to login with incorrect password', // Test name
                    async () => { // Test function
                        const response = await request(app)
                            .post('/api/auth/login')
                            .send({
                                email: testUser.email,
                                password: 'WrongPassword123!'
                            })
                        
                        // Validate response structure
                        expect(response.status).toBe(401);
                        expect(response.body).toHaveProperty('message');
                    }
                )

                test(
                    'should fail to login with non-existent email', // Test name
                    async () => { // Test function
                        const response = await request(app)
                            .post('/api/auth/login')
                            .send({
                                email: 'nonexistent@example.com',
                                password: testUser.password
                            })
                        
                        // Validate response structure
                        expect(response.status).toBe(404);
                        expect(response.body).toHaveProperty('message');
                    }
                )

                test(
                    'should fail to login without credentials', // Test name
                    async () => { // Test function
                        const response = await request(app)
                            .post('/api/auth/login')
                            .send({})
                        
                        // Validate response structure
                        expect(response.status).toBe(400);
                        expect(response.body).toHaveProperty('message');
                    }
                )
            }
        )

        describe(
            'POST /api/auth/request-password-reset', // Test Case name
            () => { // Test Case function
                test(
                    'should send password reset email successfully', // Test name
                    async () => { // Test function
                        const response = await request(app)
                            .post('/api/auth/request-password-reset')
                            .send({
                                email: testUser.email
                            })
                        
                        // Validate response structure
                        expect(response.status).toBe(200);
                        expect(response.body).toHaveProperty('message');
                    }
                )

                test(
                    'should fail with non-existent email', // Test name
                    async () => { // Test function
                        const response = await request(app)
                            .post('/api/auth/request-password-reset')
                            .send({
                                email: 'nonexistent@example.com'
                            })
                        
                        // Validate response structure
                        expect(response.status).toBe(404);
                        expect(response.body).toHaveProperty('message');
                    }
                )

                test(
                    'should fail without email', // Test name
                    async () => { // Test function
                        const response = await request(app)
                            .post('/api/auth/request-password-reset')
                            .send({})
                        
                        // Validate response structure
                        expect(response.status).toBe(400);
                        expect(response.body).toHaveProperty('message');
                    }
                )
            }
        )

        describe(
            'PUT /api/auth/update-profile', // Test Case name
            () => { // Test Case function
                test(
                    'should update profile successfully with valid token', // Test name
                    async () => { // Test function
                        const response = await request(app)
                            .put('/api/auth/update-profile')
                            .set('Authorization', `Bearer ${authToken}`)
                            .send({
                                firstName: 'UpdatedFirst',
                                lastName: 'UpdatedLast'
                            })
                        
                        // Validate response structure
                        expect(response.status).toBe(200);
                        expect(response.body).toHaveProperty('message');
                        expect(response.body).toHaveProperty('data');
                        expect(response.body.data).toHaveProperty('firstName', 'UpdatedFirst');
                        expect(response.body.data).toHaveProperty('lastName', 'UpdatedLast');
                    }
                )

                test(
                    'should fail to update profile without token', // Test name
                    async () => { // Test function
                        const response = await request(app)
                            .put('/api/auth/update-profile')
                            .send({
                                firstName: 'UpdatedFirst'
                            })
                        
                        // Validate response structure
                        expect(response.status).toBe(401);
                        expect(response.body).toHaveProperty('message');
                    }
                )

                test(
                    'should fail to update profile with invalid token', // Test name
                    async () => { // Test function
                        const response = await request(app)
                            .put('/api/auth/update-profile')
                            .set('Authorization', 'Bearer invalid-token-here')
                            .send({
                                firstName: 'UpdatedFirst'
                            })
                        
                        // Validate response structure
                        expect(response.status).toBe(401);
                        expect(response.body).toHaveProperty('message');
                    }
                )
            }
        )
    }
)