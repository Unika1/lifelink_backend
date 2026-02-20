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
    'Hospital Integration Tests', // Test Suite/Group name
    () => { // Test Suite function
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
            'POST /api/hospitals', // Test Case name
            () => { // Test Case function
                test(
                    'should create a new hospital successfully by admin', // Test name
                    async () => { // Test function
                        const response = await request(app)
                            .post('/api/hospitals')
                            .set('Authorization', `Bearer ${adminToken}`)
                            .send(testHospital)
                        
                        // Validate response structure
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
                    'should fail to create hospital without admin token', // Test name
                    async () => { // Test function
                        const response = await request(app)
                            .post('/api/hospitals')
                            .send({
                                ...testHospital,
                                email: 'another@hospital.com'
                            })
                        
                        // Validate response structure
                        expect(response.status).toBe(401);
                        expect(response.body).toHaveProperty('message');
                    }
                )

                test(
                    'should fail to create hospital with missing required fields', // Test name
                    async () => { // Test function
                        const response = await request(app)
                            .post('/api/hospitals')
                            .set('Authorization', `Bearer ${adminToken}`)
                            .send({
                                name: 'Incomplete Hospital'
                                // Missing required fields
                            })
                        
                        // Validate response structure
                        expect(response.status).toBe(400);
                        expect(response.body).toHaveProperty('message');
                    }
                )

                test(
                    'should fail to create hospital with duplicate email', // Test name
                    async () => { // Test function
                        const response = await request(app)
                            .post('/api/hospitals')
                            .set('Authorization', `Bearer ${adminToken}`)
                            .send(testHospital) // Same email
                        
                        // Validate response structure
                        expect(response.status).toBe(403);
                        expect(response.body).toHaveProperty('message');
                    }
                )
            }
        )

        describe(
            'GET /api/hospitals', // Test Case name
            () => { // Test Case function
                test(
                    'should get all hospitals successfully', // Test name
                    async () => { // Test function
                        const response = await request(app)
                            .get('/api/hospitals')
                        
                        // Validate response structure
                        expect(response.status).toBe(200);
                        expect(response.body).toHaveProperty('data');
                        expect(Array.isArray(response.body.data)).toBe(true);
                    }
                )

                test(
                    'should search hospitals by name', // Test name
                    async () => { // Test function
                        const response = await request(app)
                            .get('/api/hospitals?search=Test')
                        
                        // Validate response structure
                        expect(response.status).toBe(200);
                        expect(response.body).toHaveProperty('data');
                        expect(Array.isArray(response.body.data)).toBe(true);
                    }
                )
            }
        )

        describe(
            'GET /api/hospitals/:id', // Test Case name
            () => { // Test Case function
                test(
                    'should get hospital by ID successfully', // Test name
                    async () => { // Test function
                        const response = await request(app)
                            .get(`/api/hospitals/${hospitalId}`)
                        
                        // Validate response structure
                        expect(response.status).toBe(200);
                        expect(response.body).toHaveProperty('data');
                        expect(response.body.data).toHaveProperty('_id', hospitalId);
                        expect(response.body.data).toHaveProperty('name', testHospital.name);
                    }
                )

                test(
                    'should fail to get hospital with invalid ID', // Test name
                    async () => { // Test function
                        const response = await request(app)
                            .get('/api/hospitals/invalid-id-123')
                        
                        // Validate response structure
                        expect(response.status).toBe(500);
                        expect(response.body).toHaveProperty('message');
                    }
                )

                test(
                    'should fail to get non-existent hospital', // Test name
                    async () => { // Test function
                        const response = await request(app)
                            .get('/api/hospitals/507f1f77bcf86cd799439011') // Valid but non-existent MongoDB ID
                        
                        // Validate response structure
                        expect(response.status).toBe(404);
                        expect(response.body).toHaveProperty('message');
                    }
                )
            }
        )

        describe(
            'PUT /api/hospitals/:id', // Test Case name
            () => { // Test Case function
                test(
                    'should update hospital successfully with admin token', // Test name
                    async () => { // Test function
                        const response = await request(app)
                            .put(`/api/hospitals/${hospitalId}`)
                            .set('Authorization', `Bearer ${adminToken}`)
                            .send({
                                name: 'Updated Test Hospital',
                                phoneNumber: '9876543210'
                            })
                        
                        // Validate response structure
                        expect(response.status).toBe(200);
                        expect(response.body).toHaveProperty('message');
                        expect(response.body).toHaveProperty('data');
                        expect(response.body.data).toHaveProperty('name', 'Updated Test Hospital');
                        expect(response.body.data).toHaveProperty('phoneNumber', '9876543210');
                    }
                )

                test(
                    'should fail to update hospital without token', // Test name
                    async () => { // Test function
                        const response = await request(app)
                            .put(`/api/hospitals/${hospitalId}`)
                            .send({
                                name: 'Unauthorized Update'
                            })
                        
                        // Validate response structure
                        expect(response.status).toBe(401);
                        expect(response.body).toHaveProperty('message');
                    }
                )

                test(
                    'should fail to update non-existent hospital', // Test name
                    async () => { // Test function
                        const response = await request(app)
                            .put('/api/hospitals/507f1f77bcf86cd799439011') // Valid but non-existent MongoDB ID
                            .set('Authorization', `Bearer ${adminToken}`)
                            .send({
                                name: 'Non-existent Hospital'
                            })
                        
                        // Validate response structure
                        expect(response.status).toBe(404);
                        expect(response.body).toHaveProperty('message');
                    }
                )
            }
        )

        describe(
            'DELETE /api/hospitals/:id', // Test Case name
            () => { // Test Case function
                test(
                    'should fail to delete hospital without admin token', // Test name
                    async () => { // Test function
                        const response = await request(app)
                            .delete(`/api/hospitals/${hospitalId}`)
                        
                        // Validate response structure
                        expect(response.status).toBe(401);
                        expect(response.body).toHaveProperty('message');
                    }
                )

                test(
                    'should delete hospital successfully with admin token', // Test name
                    async () => { // Test function
                        const response = await request(app)
                            .delete(`/api/hospitals/${hospitalId}`)
                            .set('Authorization', `Bearer ${adminToken}`)
                        
                        // Validate response structure
                        expect(response.status).toBe(200);
                        expect(response.body).toHaveProperty('message');
                    }
                )

                test(
                    'should fail to delete non-existent hospital', // Test name
                    async () => { // Test function
                        const response = await request(app)
                            .delete('/api/hospitals/507f1f77bcf86cd799439011') // Valid but non-existent MongoDB ID
                            .set('Authorization', `Bearer ${adminToken}`)
                        
                        // Validate response structure
                        expect(response.status).toBe(404);
                        expect(response.body).toHaveProperty('message');
                    }
                )
            }
        )
    }
)
