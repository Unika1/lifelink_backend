import { EligibilityRepository } from "../repositories/eligibility.repository.js";
import { SubmitEligibilityDTO } from "../dtos/eligibility.dto.js";
import { HttpError } from "../errors/http-error.js";
import { IEligibilityQuestionnaire } from "../models/eligibility.model.js";

const eligibilityRepository = new EligibilityRepository();

/**
 * Eligibility Service - Business Logic Layer
 * Contains rules engine for donor eligibility assessment
 */
export class EligibilityService {
  /**
   * Submit eligibility questionnaire
   */
  async submitQuestionnaire(userId: string, data: SubmitEligibilityDTO) {
    const questionnaireData = {
      ...data,
      userId,
      submittedAt: new Date(),
    };

    const questionnaire = await eligibilityRepository.submitQuestionnaire(
      questionnaireData as any
    );
    return questionnaire;
  }

  /**
   * Check eligibility for a user
   * Returns eligibility status with reasons
   */
  async checkEligibility(
    userId: string
  ): Promise<{
    eligible: boolean;
    score: number;
    reasons: string[];
    nextEligibleDate?: Date;
    message: string;
    checkedAt: Date;
  }> {
    // Get latest questionnaire for user
    const questionnaire = await eligibilityRepository.getLatestQuestionnaire(userId);

    if (!questionnaire) {
      throw new HttpError(404, "Eligibility questionnaire not found for user");
    }

    // Run eligibility checks
    const result = this.assessEligibility(questionnaire);
    return result;
  }

  /**
   * Get user questionnaire
   */
  async getUserQuestionnaire(userId: string) {
    const questionnaire = await eligibilityRepository.getLatestQuestionnaire(userId);
    if (!questionnaire) {
      throw new HttpError(404, "No questionnaire found for this user");
    }
    return questionnaire;
  }

  /**
   * Core eligibility assessment logic
   * Contains all eligibility rules
   */
  private assessEligibility(questionnaire: IEligibilityQuestionnaire) {
    const reasons: string[] = [];
    let score = 100; // Start with full score
    const today = new Date();

    // Rule 1: Age Check (18-65)
    if (questionnaire.age < 18 || questionnaire.age > 65) {
      reasons.push(`Age must be between 18-65 years (current: ${questionnaire.age})`);
      score -= 20;
    }

    // Rule 2: Weight Check (≥50kg)
    if (questionnaire.weight < 50) {
      reasons.push(`Weight must be at least 50kg (current: ${questionnaire.weight}kg)`);
      score -= 20;
    }

    // Rule 3: Last Donation (>56 days = 8 weeks)
    if (questionnaire.lastDonationDate) {
      const daysSinceDonation = Math.floor(
        (today.getTime() - questionnaire.lastDonationDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceDonation < 56) {
        const daysRemaining = 56 - daysSinceDonation;
        const nextEligibleDate = new Date(questionnaire.lastDonationDate);
        nextEligibleDate.setDate(nextEligibleDate.getDate() + 56);

        reasons.push(
          `Must wait ${daysRemaining} more days before donating again (last donation: ${daysSinceDonation} days ago)`
        );
        score -= 25;

        return {
          eligible: false,
          score: Math.max(0, score),
          reasons,
          nextEligibleDate,
          message: `Not eligible to donate. Please wait ${daysRemaining} more days.`,
          checkedAt: today,
        };
      }
    }

    // Rule 4: Serious Health Conditions
    if (questionnaire.hasHIV || questionnaire.hasHepatitis) {
      reasons.push("HIV or Hepatitis positive - cannot donate");
      score -= 30;
    }

    if (questionnaire.hasCancer) {
      reasons.push("Active cancer diagnosis - cannot donate");
      score -= 30;
    }

    // Rule 5: Infectious Disease
    if (questionnaire.activeInfection) {
      reasons.push(
        `Active infection detected: ${questionnaire.infectionDetails || "Unspecified"}. Must wait until recovered.`
      );
      score -= 25;
    }

    // Rule 6: Tattoo/Piercing (12 months wait)
    if (questionnaire.hasRecentTattoo && questionnaire.tattooDate) {
      const daysSinceTattoo = Math.floor(
        (today.getTime() - questionnaire.tattooDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceTattoo < 365) {
        const daysRemaining = 365 - daysSinceTattoo;
        reasons.push(`Recent tattoo - must wait ${daysRemaining} more days (minimum 12 months)`);
        score -= 15;
      }
    }

    if (questionnaire.hasRecentPiercing && questionnaire.piercingDate) {
      const daysSincePiercing = Math.floor(
        (today.getTime() - questionnaire.piercingDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSincePiercing < 365) {
        const daysRemaining = 365 - daysSincePiercing;
        reasons.push(`Recent piercing - must wait ${daysRemaining} more days (minimum 12 months)`);
        score -= 15;
      }
    }

    // Rule 7: Gender-Specific (Pregnancy, Breastfeeding)
    if (questionnaire.isPregnant) {
      reasons.push("Currently pregnant - cannot donate");
      score -= 30;
    }

    if (questionnaire.isBreastfeeding) {
      reasons.push("Currently breastfeeding - cannot donate");
      score -= 20;
    }

    // Rule 8: Blood Transfusion History (12 months wait)
    if (questionnaire.hadBloodTransfusion && questionnaire.transfusionDate) {
      const daysSinceTransfusion = Math.floor(
        (today.getTime() - questionnaire.transfusionDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceTransfusion < 365) {
        const daysRemaining = 365 - daysSinceTransfusion;
        reasons.push(
          `Recent blood transfusion - must wait ${daysRemaining} more days (minimum 12 months)`
        );
        score -= 20;
      }
    }

    // Rule 9: Recent Travel (some countries have restrictions)
    if (questionnaire.recentTravel) {
      const restrictedCountries = ["Africa", "South America"]; // Example
      const hasRestrictedTravel = questionnaire.travelCountries?.some((country) =>
        restrictedCountries.some((restricted) => country.includes(restricted))
      );

      if (hasRestrictedTravel) {
        reasons.push("Recent travel to risk areas - 28 day waiting period required");
        score -= 15;
      }
    }

    // Rule 10: Medical Conditions (Minor)
    if (questionnaire.hasBloodPressure) {
      reasons.push("High blood pressure - requires doctor's clearance");
      score -= 10;
    }

    if (questionnaire.hasDiabetes) {
      reasons.push("Diabetes - must be well-controlled, requires documentation");
      score -= 10;
    }

    // Final Assessment
    const eligible = score >= 70 && reasons.length === 0;

    return {
      eligible,
      score: Math.max(0, score),
      reasons,
      message: eligible
        ? "✅ You are eligible to donate blood today!"
        : `❌ You are not eligible to donate at this time. ${reasons.length > 0 ? "Please address the following: " + reasons[0] : ""}`,
      checkedAt: today,
    };
  }
}
