import mongoose, { Document, Schema } from "mongoose";
import { EligibilityQuestionnaireType } from "../types/eligibility.types.js";

/**
 * Eligibility Questionnaire Schema
 */
const EligibilityQuestionnaireSchema: Schema = new Schema<EligibilityQuestionnaireType>(
  {
    userId: { type: String, required: true },
    
    // Basic Information
    age: { type: Number, required: true, min: 18, max: 100 },
    weight: { type: Number, required: true, min: 40 },
    gender: { 
      type: String, 
      enum: ["male", "female", "other"], 
      required: true 
    },
    
    // Donation History
    lastDonationDate: { type: Date },
    totalDonationsCount: { type: Number, default: 0 },
    
    // Health Conditions
    hasBloodPressure: { type: Boolean, default: false },
    hasDiabetes: { type: Boolean, default: false },
    hasHeartDisease: { type: Boolean, default: false },
    hasCancer: { type: Boolean, default: false },
    hasHepatitis: { type: Boolean, default: false },
    hasHIV: { type: Boolean, default: false },
    hasTuberculosis: { type: Boolean, default: false },
    
    // Recent Activities
    recentTravel: { type: Boolean, default: false },
    travelCountries: [{ type: String }],
    
    // Medications & Infections
    takingMedications: { type: Boolean, default: false },
    medications: [{ type: String }],
    activeInfection: { type: Boolean, default: false },
    infectionDetails: { type: String },
    
    // Gender-Specific
    isPregnant: { type: Boolean },
    isBreastfeeding: { type: Boolean },
    
    // Lifestyle
    hasRecentTattoo: { type: Boolean, default: false },
    tattooDate: { type: Date },
    hasRecentPiercing: { type: Boolean, default: false },
    piercingDate: { type: Date },
    
    // Transfusion History
    hadBloodTransfusion: { type: Boolean, default: false },
    transfusionDate: { type: Date },
    
    // Additional Info
    additionalNotes: { type: String },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

/**
 * Eligibility Questionnaire Interface
 */
export interface IEligibilityQuestionnaire extends EligibilityQuestionnaireType, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const EligibilityQuestionnaireModel = mongoose.model<IEligibilityQuestionnaire>(
  "EligibilityQuestionnaire",
  EligibilityQuestionnaireSchema
);
