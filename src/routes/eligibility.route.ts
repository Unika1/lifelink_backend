import { Router } from "express";
import { EligibilityController } from "../controllers/eligibility.controller";
import { authorizedMiddleware, hospitalOrAdminMiddleware } from "../middlewares/auth.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware";

const router = Router();
const eligibilityController = new EligibilityController();

/**
 * All eligibility routes require authentication
 * Only authenticated donors can submit questionnaires and check eligibility
 */

/**
 * POST /api/eligibility/submit
 * Submit donor eligibility questionnaire
 * Body: age, weight, gender, health conditions, etc.
 * Response: questionnaire data with submission timestamp
 */
router.post(
  "/submit",
  authorizedMiddleware,
  eligibilityController.submitQuestionnaire
);

/**
 * GET /api/eligibility/check
 * Check if donor is eligible to donate
 * Response: { eligible, score, reasons, message, checkedAt }
 */
router.get(
  "/check",
  authorizedMiddleware,
  eligibilityController.checkEligibility
);

/**
 * GET /api/eligibility/questionnaire
 * Get current user's latest eligibility questionnaire
 * Response: questionnaire data
 */
router.get(
  "/questionnaire",
  authorizedMiddleware,
  eligibilityController.getUserQuestionnaire
);

/**
 * Admin Routes
 */

// GET /api/eligibility/admin/questionnaires - Get all questionnaires
router.get(
  "/admin/questionnaires",
  authorizedMiddleware,
  adminMiddleware,
  eligibilityController.getAllQuestionnaires
);

// GET /api/eligibility/admin/questionnaires/:userId - Get latest questionnaire for a user
router.get(
  "/admin/questionnaires/:userId",
  authorizedMiddleware,
  adminMiddleware,
  eligibilityController.getLatestQuestionnaireForUser
);

// GET /api/eligibility/hospital/questionnaires/:userId - Hospital: get latest questionnaire for a user
router.get(
  "/hospital/questionnaires/:userId",
  authorizedMiddleware,
  hospitalOrAdminMiddleware,
  eligibilityController.getLatestQuestionnaireForUser
);

export default router;
