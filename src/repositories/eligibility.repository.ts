import {
  EligibilityQuestionnaireModel,
  IEligibilityQuestionnaire,
} from "../models/eligibility.model.js";

export interface IEligibilityRepository {
  submitQuestionnaire(data: Partial<IEligibilityQuestionnaire>): Promise<IEligibilityQuestionnaire>;
  getQuestionnaireByUserId(userId: string): Promise<IEligibilityQuestionnaire | null>;
  getLatestQuestionnaire(userId: string): Promise<IEligibilityQuestionnaire | null>;
  updateQuestionnaire(
    id: string,
    data: Partial<IEligibilityQuestionnaire>
  ): Promise<IEligibilityQuestionnaire | null>;
  getAllQuestionnaires(): Promise<IEligibilityQuestionnaire[]>;
}

/**
 * Eligibility Repository - Data Access Layer
 * Handles questionnaire storage and retrieval
 */
export class EligibilityRepository implements IEligibilityRepository {
  /**
   * Submit new eligibility questionnaire
   */
  async submitQuestionnaire(
    data: Partial<IEligibilityQuestionnaire>
  ): Promise<IEligibilityQuestionnaire> {
    const questionnaire = new EligibilityQuestionnaireModel(data);
    return await questionnaire.save();
  }

  /**
   * Get questionnaire by user ID
   */
  async getQuestionnaireByUserId(userId: string): Promise<IEligibilityQuestionnaire | null> {
    return await EligibilityQuestionnaireModel.findOne({ userId });
  }

  /**
   * Get latest questionnaire for a user
   */
  async getLatestQuestionnaire(userId: string): Promise<IEligibilityQuestionnaire | null> {
    return await EligibilityQuestionnaireModel.findOne({ userId }).sort({
      createdAt: -1,
    });
  }

  /**
   * Update questionnaire
   */
  async updateQuestionnaire(
    id: string,
    data: Partial<IEligibilityQuestionnaire>
  ): Promise<IEligibilityQuestionnaire | null> {
    return await EligibilityQuestionnaireModel.findByIdAndUpdate(id, data, {
      new: true,
    });
  }

  /**
   * Get all questionnaires
   */
  async getAllQuestionnaires(): Promise<IEligibilityQuestionnaire[]> {
    return await EligibilityQuestionnaireModel.find();
  }
}
