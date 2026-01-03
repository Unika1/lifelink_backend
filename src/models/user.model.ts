import mongoose, { Document, Schema } from "mongoose";
import { UserType } from "../types/user.types.js";


const UserSchema:Schema = new Schema <UserType> (
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
            type: String,
            enum: ['user', 'admin'],
            default:'user',
    }
  },
  { timestamps: true }
);

export interface IUser extends UserType, Document { // combine UserType and Document
    _id: mongoose.Types.ObjectId; // mongo related attribute/ custom attributes
    createdAt: Date;
    updatedAt: Date;
}
export const UserModel = mongoose.model<IUser>('User', UserSchema);