import mongoose, { Document, Schema } from "mongoose";
import { OrganRequestType } from "../types/organ-request.types.js";

const OrganRequestSchema: Schema = new Schema<OrganRequestType>(
  {
    hospitalId: { type: String },
    hospitalName: { type: String, required: true },
    donorName: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "fulfilled"],
      default: "pending",
    },
    scheduledAt: { type: Date },
    requestedBy: { type: String },
    reportUrl: { type: String, required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

export interface IOrganRequest extends OrganRequestType, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const OrganRequestModel = mongoose.model<IOrganRequest>(
  "OrganRequest",
  OrganRequestSchema
);
