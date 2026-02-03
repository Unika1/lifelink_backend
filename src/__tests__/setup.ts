import mongoose from 'mongoose';
import { connectDatabase } from '../database/mongodb.js';
 
beforeAll(async () => {
    await connectDatabase();
});
 
afterAll(async () => {
    await mongoose.connection.close();
});


 