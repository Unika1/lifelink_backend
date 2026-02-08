import z from "zod";

/**
 * Donor Eligibility Questionnaire Schema
 * Captures health and eligibility information from donors
 */
export const EligibilityQuestionnaireSchema = z.object({
  userId: z.string(),
  
  // Basic Information
  age: z.number().min(18).max(100),
  weight: z.number().min(40), // in kg
  gender: z.enum(["male", "female", "other"]),
  
  // Donation History
  lastDonationDate: z.date().optional(),
  totalDonationsCount: z.number().default(0),
  
  // Health Conditions
  hasBloodPressure: z.boolean().default(false),
  hasDiabetes: z.boolean().default(false),
  hasHeartDisease: z.boolean().default(false),
  hasCancer: z.boolean().default(false),
  hasHepatitis: z.boolean().default(false),
  hasHIV: z.boolean().default(false),
  hasTuberculosis: z.boolean().default(false),
  
  // Recent Activities
  recentTravel: z.boolean().default(false),
  travelCountries: z.array(z.string()).optional(),
  
  // Medications & Infections
  takingMedications: z.boolean().default(false),
  medications: z.array(z.string()).optional(),
  activeInfection: z.boolean().default(false),
  infectionDetails: z.string().optional(),
  
  // Gender-Specific
  isPregnant: z.boolean().optional(),
  isBreastfeeding: z.boolean().optional(),
  
  // Lifestyle
  hasRecentTattoo: z.boolean().default(false),
  tattooDate: z.date().optional(),
  hasRecentPiercing: z.boolean().default(false),
  piercingDate: z.date().optional(),
  
  // Transfusion History
  hadBloodTransfusion: z.boolean().default(false),
  transfusionDate: z.date().optional(),
  
  // Additional Info
  additionalNotes: z.string().optional(),
  submittedAt: z.date().optional(),
});

export type EligibilityQuestionnaireType = z.infer<typeof EligibilityQuestionnaireSchema>;

/**
 * Eligibility Result Schema
 * Result of eligibility assessment
 */
export const EligibilityResultSchema = z.object({
  eligible: z.boolean(),
  score: z.number().min(0).max(100), // Eligibility percentage
  reasons: z.array(z.string()),
  nextEligibleDate: z.date().optional(),
  message: z.string(),
  checkedAt: z.date(),
});

export type EligibilityResultType = z.infer<typeof EligibilityResultSchema>;
