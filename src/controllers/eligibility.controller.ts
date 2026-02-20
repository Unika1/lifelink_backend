import { Request, Response } from "express";
import z from "zod";
import { EligibilityService } from "../services/eligibility.service";
import { SubmitEligibilityDTO } from "../dtos/eligibility.dto";

const eligibilityService = new EligibilityService();

/**
 * Eligibility Controller - API Handler Layer
 * Handles donor eligibility questionnaire and checks
 */
export class EligibilityController {
  /**
   * POST /api/eligibility/submit
   * Submit donor eligibility questionnaire
   */
  async submitQuestionnaire(req: Request, res: Response) {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID not found. Please login first.",
        });
      }

      const parsedData = SubmitEligibilityDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      const questionnaire = await eligibilityService.submitQuestionnaire(
        userId,
        parsedData.data
      );

      return res.status(201).json({
        success: true,
        message: "Eligibility questionnaire submitted successfully",
        data: questionnaire,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  /**
   * GET /api/eligibility/check
   * Check if user is eligible to donate
   */
  async checkEligibility(req: Request, res: Response) {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID not found. Please login first.",
        });
      }

      const result = await eligibilityService.checkEligibility(userId);

      return res.status(200).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  /**
   * GET /api/eligibility/questionnaire
   * Get current user's latest questionnaire
   */
  async getUserQuestionnaire(req: Request, res: Response) {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID not found. Please login first.",
        });
      }

      const questionnaire = await eligibilityService.getUserQuestionnaire(userId);

      return res.status(200).json({
        success: true,
        message: "Questionnaire retrieved successfully",
        data: questionnaire,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  /**
   * GET /api/eligibility/admin/questionnaires
   * Admin: list all questionnaires
   */
  async getAllQuestionnaires(req: Request, res: Response) {
    try {
      const questionnaires = await eligibilityService.getAllQuestionnaires();

      return res.status(200).json({
        success: true,
        message: "Questionnaires retrieved successfully",
        data: questionnaires,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  /**
   * GET /api/eligibility/admin/questionnaires/:userId
   * Admin: get latest questionnaire for a user
   */
  async getLatestQuestionnaireForUser(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required",
        });
      }

      const questionnaire = await eligibilityService.getLatestQuestionnaireForUser(userId);

      return res.status(200).json({
        success: true,
        message: "Questionnaire retrieved successfully",
        data: questionnaire,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
