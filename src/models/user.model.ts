import mongoose, { Document, Schema } from "mongoose";
import { UserType } from "../types/user.types.js";


const UserSchema:Schema = new Schema <UserType> (
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    imageUrl: { type: String, default: "" },
    role: {
            type: String,
            enum: ['donor', 'hospital', 'admin'],
            default:'donor',
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