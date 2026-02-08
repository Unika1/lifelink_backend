import z from "zod";
import { EligibilityQuestionnaireSchema, EligibilityResultSchema } from "../types/eligibility.types.js";

/**
 * Submit Eligibility Questionnaire DTO
 */
export const SubmitEligibilityDTO = EligibilityQuestionnaireSchema.pick({
  age: true,
  weight: true,
  gender: true,
  lastDonationDate: true,
  hasBloodPressure: true,
  hasDiabetes: true,
  hasHeartDisease: true,
  hasCancer: true,
  hasHepatitis: true,
  hasHIV: true,
  hasTuberculosis: true,
  recentTravel: true,
  travelCountries: true,
  takingMedications: true,
  medications: true,
  activeInfection: true,
  infectionDetails: true,
  isPregnant: true,
  isBreastfeeding: true,
  hasRecentTattoo: true,
  tattooDate: true,
  hasRecentPiercing: true,
  piercingDate: true,
  hadBloodTransfusion: true,
  transfusionDate: true,
  additionalNotes: true,
});

export type SubmitEligibilityDTO = z.infer<typeof SubmitEligibilityDTO>;

/**
 * Check Eligibility Query DTO
 */
export const CheckEligibilityDTO = z.object({
  userId: z.string().optional(),
});

export type CheckEligibilityDTO = z.infer<typeof CheckEligibilityDTO>;

/**
 * Eligibility Result DTO
 */
export const EligibilityCheckResultDTO = EligibilityResultSchema;

export type EligibilityCheckResultDTO = z.infer<typeof EligibilityCheckResultDTO>;
