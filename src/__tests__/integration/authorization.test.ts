import request from 'supertest';
import bcryptjs from 'bcryptjs';
import { UserModel } from '../../models/user.model.js';
import { HospitalModel } from '../../models/hospital.model.js';
import app from '../../app.js';

describe(
    'Authorization & Role-Based Access Tests', // Test Suite/Group name
    () => { // Test Suite function
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
            'Token Validation', // Test Case name
            () => { // Test Case function
                test(
                    'should reject requests without token to protected routes', // Test name
                    async () => { // Test function
                        const response = await request(app)
                            .put('/api/auth/update-profile')
                            .send({
                                firstName: 'Test'
                            })
                        
                        // Validate response structure
                        expect(response.status).toBe(401);
                        expect(response.body).toHaveProperty('message');
                    }
                )

                test(
                    'should reject requests with invalid token', // Test name
                    async () => { // Test function
                        const response = await request(app)
                            .put('/api/auth/update-profile')
                            .set('Authorization', 'Bearer invalid-token-12345')
                            .send({
                                firstName: 'Test'
                            })
                        
                        // Validate response structure
                        expect(response.status).toBe(401);
                        expect(response.body).toHaveProperty('message');
                    }
                )

                test(
                    'should reject requests with expired token', // Test name
                    async () => { // Test function
                        const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQ1Njc4OTAiLCJleHAiOjE1MTYyMzkwMjJ9.4Adcj0vPnz8H8QCFJ5TqvvnYqLkpgKe_xB4vBqGxVCk';
                        
                        const response = await request(app)
                            .put('/api/auth/update-profile')
                            .set('Authorization', `Bearer ${expiredToken}`)
                            .send({
                                firstName: 'Test'
                            })
                        
                        // Validate response structure
                        expect(response.status).toBe(401);
                        expect(response.body).toHaveProperty('message');
                    }
                )

                test(
                    'should accept requests with valid admin token', // Test name
                    async () => { // Test function
                        const response = await request(app)
                            .put('/api/auth/update-profile')
                            .set('Authorization', `Bearer ${adminToken}`)
                            .send({
                                firstName: 'UpdatedAdmin',
                                role: 'admin'
                            })
                        
                        // Validate response structure
                        expect(response.status).toBe(200);
                        expect(response.body).toHaveProperty('data');
                    }
                )

                test(
                    'should accept requests with valid donor token', // Test name
                    async () => { // Test function
                        const response = await request(app)
                            .put('/api/auth/update-profile')
                            .set('Authorization', `Bearer ${donorToken}`)
                            .send({
                                firstName: 'UpdatedDonor',
                                role: 'donor'
                            })
                        
                        // Validate response structure
                        expect(response.status).toBe(200);
                        expect(response.body).toHaveProperty('data');
                    }
                )

                test(
                    'should accept requests with valid hospital token', // Test name
                    async () => { // Test function
                        const response = await request(app)
                            .put('/api/auth/update-profile')
                            .set('Authorization', `Bearer ${hospitalToken}`)
                            .send({
                                firstName: 'UpdatedHospital',
                                role: 'hospital'
                            })
                        
                        // Validate response structure
                        expect(response.status).toBe(200);
                        expect(response.body).toHaveProperty('data');
                    }
                )
            }
        )

        describe(
            'Admin-Only Route Protection', // Test Case name
            () => { // Test Case function
                test(
                    'should allow admin to access admin routes', // Test name
                    async () => { // Test function
                        const response = await request(app)
                            .get('/api/admin/users')
                            .set('Authorization', `Bearer ${adminToken}`)
                        
                        // Validate response structure
                        expect(response.status).toBe(200);
                        expect(response.body).toHaveProperty('data');
                    }
                )

                test(
                    'should deny donor access to admin routes', // Test name
                    async () => { // Test function
                        const response = await request(app)
                            .get('/api/admin/users')
                            .set('Authorization', `Bearer ${donorToken}`)
                        
                        // Validate response structure
                        expect(response.status).toBe(403);
                        expect(response.body).toHaveProperty('message');
                    }
                )

                test(
                    'should deny hospital access to admin routes', // Test name
                    async () => { // Test function
                        const response = await request(app)
                            .get('/api/admin/users')
                            .set('Authorization', `Bearer ${hospitalToken}`)
                        
                        // Validate response structure
                        expect(response.status).toBe(403);
                        expect(response.body).toHaveProperty('message');
                    }
                )

                test(
                    'should deny unauthenticated access to admin routes', // Test name
                    async () => { // Test function
                        const response = await request(app)
                            .get('/api/admin/users')
                        
                        // Validate response structure
                        expect(response.status).toBe(401);
                        expect(response.body).toHaveProperty('message');
                    }
                )
            }
        )

        describe(
            'Public vs Protected Route Access', // Test Case name
            () => { // Test Case function
                test(
                    'should allow unauthenticated access to public routes', // Test name
                    async () => { // Test function
                        const response = await request(app)
                            .get('/api/hospitals')
                        
                        // Validate response structure
                        expect(response.status).toBe(200);
                        expect(response.body).toHaveProperty('data');
                    }
                )

                test(
                    'should allow authenticated users to access public routes', // Test name
                    async () => { // Test function
                        const response = await request(app)
                            .get('/api/hospitals')
                            .set('Authorization', `Bearer ${donorToken}`)
                        
                        // Validate response structure
                        expect(response.status).toBe(200);
                        expect(response.body).toHaveProperty('data');
                    }
                )

                test(
                    'should deny unauthenticated access to protected update routes', // Test name
                    async () => { // Test function
                        const response = await request(app)
                            .put('/api/auth/update-profile')
                            .send({
                                firstName: 'Test'
                            })
                        
                        // Validate response structure
                        expect(response.status).toBe(401);
                        expect(response.body).toHaveProperty('message');
                    }
                )
            }
        )

        describe(
            'Role-Based Resource Creation', // Test Case name
            () => { // Test Case function
                test(
                    'should allow admin to create hospitals', // Test name
                    async () => { // Test function
                        const response = await request(app)
                            .post('/api/hospitals')
                            .set('Authorization', `Bearer ${adminToken}`)
                            .send({
                                name: 'Test Hospital Auth',
                                email: 'hospital-auth@test.com',
                                phoneNumber: '1234567890',
                                address: {
                                    street: '123 Test St',
                                    city: 'Test City',
                                    state: 'Test State',
                                    zipCode: '12345',
                                    country: 'Nepal'
                                }
                            })
                        
                        // Validate response structure
                        expect(response.status).toBe(201);
                        expect(response.body).toHaveProperty('message');
                        expect(response.body).toHaveProperty('data');
                    }
                )

                test(
                    'should deny donor from creating hospitals', // Test name
                    async () => { // Test function
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
                        
                        // Validate response structure
                        expect(response.status).toBe(403);
                        expect(response.body).toHaveProperty('message');
                    }
                )

                test(
                    'should allow admin to create users', // Test name
                    async () => { // Test function
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
                        
                        // Validate response structure
                        expect(response.status).toBe(201);
                        expect(response.body).toHaveProperty('message');
                        expect(response.body).toHaveProperty('data');
                    }
                )

                test(
                    'should deny donor from creating users', // Test name
                    async () => { // Test function
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
                        
                        // Validate response structure
                        expect(response.status).toBe(403);
                        expect(response.body).toHaveProperty('message');
                    }
                )
            }
        )
    }
)
