import mongoose, { Document, Schema } from "mongoose";
import { BloodRequestType } from "../types/blood-request.types.js";

const BloodRequestSchema: Schema = new Schema<BloodRequestType>(
  {
    hospitalId: { type: String },
    hospitalName: { type: String, required: true },
    patientName: { type: String, required: true },
    bloodType: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      required: true,
    },
    unitsRequested: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "fulfilled"],
      default: "pending",
    },
    requestedBy: { type: String },
    contactPhone: { type: String },
    neededBy: { type: Date },
    scheduledAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

export interface IBloodRequest extends BloodRequestType, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const BloodRequestModel = mongoose.model<IBloodRequest>(
  "BloodRequest",
  BloodRequestSchema
);
