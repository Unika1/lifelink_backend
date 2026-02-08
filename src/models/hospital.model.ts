import mongoose, { Document, Schema } from "mongoose";
import { HospitalType, BloodInventory } from "../types/hospital.types.js";

/**
 * Blood Inventory Sub-Schema
 */
const BloodInventorySchema = new Schema({
  bloodType: {
    type: String,
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    required: true,
  },
  unitsAvailable: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

/**
 * Hospital Schema
 */
const HospitalSchema: Schema = new Schema<HospitalType>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, default: "Nepal" },
    },
    location: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    bloodInventory: [BloodInventorySchema],
    licenseNumber: { type: String },
    imageUrl: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    userId: { type: String }, // Reference to user managing this hospital
  },
  { timestamps: true }
);

/**
 * Hospital Interface
 */
export interface IHospital extends HospitalType, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const HospitalModel = mongoose.model<IHospital>("Hospital", HospitalSchema);
