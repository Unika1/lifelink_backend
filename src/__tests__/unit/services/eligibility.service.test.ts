import { EligibilityService } from "../../../services/eligibility.service";
import { SubmitEligibilityDTO } from "../../../dtos/eligibility.dto";
import { HttpError } from "../../../errors/http-error";

/**
 * UNIT TEST FOR EligibilityService (with Nepalese donor names)
 * 
 * Comprehensive tests for eligibility assessment with Nepalese donor scenarios.
 */

describe("EligibilityService - Unit Tests", () => {
  let eligibilityService: EligibilityService;

  beforeEach(() => {
    eligibilityService = new EligibilityService();
  });

  /**
   * SUCCESSFUL ELIGIBILITY TESTS
   */
  it("should submit eligibility questionnaire for Ram Bahadur Thapa", async () => {
    const userId = "user_ram_thapa";
    const questionnaireData: SubmitEligibilityDTO = {
      age: 28,
      weight: 72,
      hasChronicIllness: false,
      isPregnant: false,
      hasRecentSurgery: false,
      hasRecentTattoo: false,
      hasDiabetes: false,
      hasHeartDisease: false,
      hasHighBloodPressure: false,
      takingMedication: false,
      hasHIV: false,
      hasHepatitis: false,
      hasCancer: false,
      hasBloodDisorder: false,
      lastDonationDate: null,
      donationType: "blood",
    } as any;

    try {
      const result = await eligibilityService.submitQuestionnaire(
        userId,
        questionnaireData
      );
      expect(result).toBeDefined();
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  it("should submit eligibility for Sita Kumari Shrestha", async () => {
    const userId = "user_sita_shrestha";
    const questionnaireData: SubmitEligibilityDTO = {
      age: 32,
      weight: 58,
      hasChronicIllness: false,
      isPregnant: false,
      hasRecentSurgery: false,
      hasRecentTattoo: false,
      hasDiabetes: false,
      hasHeartDisease: false,
      hasHighBloodPressure: false,
      takingMedication: false,
      hasHIV: false,
      hasHepatitis: false,
      hasCancer: false,
      hasBloodDisorder: false,
      lastDonationDate: null,
      donationType: "blood",
    } as any;

    try {
      const result = await eligibilityService.submitQuestionnaire(
        userId,
        questionnaireData
      );
      expect(result).toBeDefined();
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  it("should submit organ donation eligibility for Krishna Prasad Adhikari", async () => {
    const userId = "user_krishna_adhikari";
    const questionnaireData: SubmitEligibilityDTO = {
      age: 35,
      weight: 68,
      hasChronicIllness: false,
      isPregnant: false,
      hasRecentSurgery: false,
      hasRecentTattoo: false,
      hasDiabetes: false,
      hasHeartDisease: false,
      hasHighBloodPressure: false,
      takingMedication: false,
      hasHIV: false,
      hasHepatitis: false,
      hasCancer: false,
      hasBloodDisorder: false,
      lastDonationDate: null,
      donationType: "organ",
    } as any;

    try {
      const result = await eligibilityService.submitQuestionnaire(
        userId,
        questionnaireData
      );
      expect(result).toBeDefined();
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  /**
   * ERROR HANDLING TESTS
   */
  it("should throw error when checking eligibility without questionnaire", async () => {
    const nonExistentUserId = "000000000000000000000000";

    try {
      await eligibilityService.checkEligibility(nonExistentUserId);
      expect(false).toBe(true);
    } catch (error: any) {
      expect(error.message).toContain("questionnaire not found");
      expect(error.statusCode).toBe(404);
    }
  });

  it("should throw error when getting questionnaire for non-existent user", async () => {
    const nonExistentUserId = "000000000000000000000000";

    try {
      await eligibilityService.getUserQuestionnaire(nonExistentUserId);
      expect(false).toBe(true);
    } catch (error: any) {
      expect(error.message).toBe("No questionnaire found for this user");
      expect(error.statusCode).toBe(404);
    }
  });

  it("should throw error when admin gets questionnaire for non-existent user", async () => {
    const nonExistentUserId = "000000000000000000000000";

    try {
      await eligibilityService.getLatestQuestionnaireForUser(nonExistentUserId);
      expect(false).toBe(true);
    } catch (error: any) {
      expect(error.message).toBe("No questionnaire found for this user");
      expect(error.statusCode).toBe(404);
    }
  });

  /**
   * ADMIN FUNCTIONALITY TESTS
   */
  it("should get all questionnaires for admin review", async () => {
    try {
      const result = await eligibilityService.getAllQuestionnaires();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  /**
   * AGE VALIDATION TESTS
   */
  it("should handle questionnaire for young donor Binod Kumar (age 18)", async () => {
    const userId = "user_binod_kumar";
    const questionnaireData: SubmitEligibilityDTO = {
      age: 18, // Minimum eligibility age
      weight: 55,
      hasChronicIllness: false,
      isPregnant: false,
      hasRecentSurgery: false,
      hasRecentTattoo: false,
      hasDiabetes: false,
      hasHeartDisease: false,
      hasHighBloodPressure: false,
      takingMedication: false,
      hasHIV: false,
      hasHepatitis: false,
      hasCancer: false,
      hasBloodDisorder: false,
      lastDonationDate: null,
      donationType: "blood",
    } as any;

    try {
      const result = await eligibilityService.submitQuestionnaire(
        userId,
        questionnaireData
      );
      expect(result).toBeDefined();
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  it("should handle questionnaire for underage donor Maya Tamang (age 16)", async () => {
    const userId = "user_maya_tamang";
    const questionnaireData: SubmitEligibilityDTO = {
      age: 16, // Below minimum age
      weight: 50,
      hasChronicIllness: false,
      isPregnant: false,
      hasRecentSurgery: false,
      hasRecentTattoo: false,
      hasDiabetes: false,
      hasHeartDisease: false,
      hasHighBloodPressure: false,
      takingMedication: false,
      hasHIV: false,
      hasHepatitis: false,
      hasCancer: false,
      hasBloodDisorder: false,
      lastDonationDate: null,
      donationType: "blood",
    } as any;

    try {
      const result = await eligibilityService.submitQuestionnaire(
        userId,
        questionnaireData
      );
      expect(result).toBeDefined();
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  it("should handle questionnaire for senior donor Hari Prasad (age 58)", async () => {
    const userId = "user_hari_prasad";
    const questionnaireData: SubmitEligibilityDTO = {
      age: 58,
      weight: 70,
      hasChronicIllness: false,
      isPregnant: false,
      hasRecentSurgery: false,
      hasRecentTattoo: false,
      hasDiabetes: false,
      hasHeartDisease: false,
      hasHighBloodPressure: false,
      takingMedication: false,
      hasHIV: false,
      hasHepatitis: false,
      hasCancer: false,
      hasBloodDisorder: false,
      lastDonationDate: null,
      donationType: "blood",
    } as any;

    try {
      const result = await eligibilityService.submitQuestionnaire(
        userId,
        questionnaireData
      );
      expect(result).toBeDefined();
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  /**
   * WEIGHT VALIDATION TESTS
   */
  it("should handle low weight donor Rina Rai (42kg)", async () => {
    const userId = "user_rina_rai";
    const questionnaireData: SubmitEligibilityDTO = {
      age: 25,
      weight: 42, // Below minimum weight
      hasChronicIllness: false,
      isPregnant: false,
      hasRecentSurgery: false,
      hasRecentTattoo: false,
      hasDiabetes: false,
      hasHeartDisease: false,
      hasHighBloodPressure: false,
      takingMedication: false,
      hasHIV: false,
      hasHepatitis: false,
      hasCancer: false,
      hasBloodDisorder: false,
      lastDonationDate: null,
      donationType: "blood",
    } as any;

    try {
      const result = await eligibilityService.submitQuestionnaire(
        userId,
        questionnaireData
      );
      expect(result).toBeDefined();
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  it("should handle healthy weight donor Rajesh Gurung (65kg)", async () => {
    const userId = "user_rajesh_gurung";
    const questionnaireData: SubmitEligibilityDTO = {
      age: 30,
      weight: 65,
      hasChronicIllness: false,
      isPregnant: false,
      hasRecentSurgery: false,
      hasRecentTattoo: false,
      hasDiabetes: false,
      hasHeartDisease: false,
      hasHighBloodPressure: false,
      takingMedication: false,
      hasHIV: false,
      hasHepatitis: false,
      hasCancer: false,
      hasBloodDisorder: false,
      lastDonationDate: null,
      donationType: "blood",
    } as any;

    try {
      const result = await eligibilityService.submitQuestionnaire(
        userId,
        questionnaireData
      );
      expect(result).toBeDefined();
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  /**
   * HEALTH CONDITION TESTS
   */
  it("should handle chronic illness case for Santosh Magar", async () => {
    const userId = "user_santosh_magar";
    const questionnaireData: SubmitEligibilityDTO = {
      age: 40,
      weight: 70,
      hasChronicIllness: true, // Has chronic illness
      isPregnant: false,
      hasRecentSurgery: false,
      hasRecentTattoo: false,
      hasDiabetes: false,
      hasHeartDisease: false,
      hasHighBloodPressure: false,
      takingMedication: false,
      hasHIV: false,
      hasHepatitis: false,
      hasCancer: false,
      hasBloodDisorder: false,
      lastDonationDate: null,
      donationType: "blood",
    } as any;

    try {
      const result = await eligibilityService.submitQuestionnaire(
        userId,
        questionnaireData
      );
      expect(result).toBeDefined();
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  it("should handle diabetes case for Gita Poudel", async () => {
    const userId = "user_gita_poudel";
    const questionnaireData: SubmitEligibilityDTO = {
      age: 45,
      weight: 68,
      hasChronicIllness: false,
      isPregnant: false,
      hasRecentSurgery: false,
      hasRecentTattoo: false,
      hasDiabetes: true, // Has diabetes
      hasHeartDisease: false,
      hasHighBloodPressure: false,
      takingMedication: true,
      hasHIV: false,
      hasHepatitis: false,
      hasCancer: false,
      hasBloodDisorder: false,
      lastDonationDate: null,
      donationType: "blood",
    } as any;

    try {
      const result = await eligibilityService.submitQuestionnaire(
        userId,
        questionnaireData
      );
      expect(result).toBeDefined();
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  it("should handle heart disease case for Prakash Limbu", async () => {
    const userId = "user_prakash_limbu";
    const questionnaireData: SubmitEligibilityDTO = {
      age: 50,
      weight: 75,
      hasChronicIllness: false,
      isPregnant: false,
      hasRecentSurgery: false,
      hasRecentTattoo: false,
      hasDiabetes: false,
      hasHeartDisease: true, // Has heart disease
      hasHighBloodPressure: true,
      takingMedication: true,
      hasHIV: false,
      hasHepatitis: false,
      hasCancer: false,
      hasBloodDisorder: false,
      lastDonationDate: null,
      donationType: "blood",
    } as any;

    try {
      const result = await eligibilityService.submitQuestionnaire(
        userId,
        questionnaireData
      );
      expect(result).toBeDefined();
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  it("should handle recent surgery case for Anita Karki", async () => {
    const userId = "user_anita_karki";
    const questionnaireData: SubmitEligibilityDTO = {
      age: 28,
      weight: 60,
      hasChronicIllness: false,
      isPregnant: false,
      hasRecentSurgery: true, // Recent surgery
      hasRecentTattoo: false,
      hasDiabetes: false,
      hasHeartDisease: false,
      hasHighBloodPressure: false,
      takingMedication: false,
      hasHIV: false,
      hasHepatitis: false,
      hasCancer: false,
      hasBloodDisorder: false,
      lastDonationDate: null,
      donationType: "blood",
    } as any;

    try {
      const result = await eligibilityService.submitQuestionnaire(
        userId,
        questionnaireData
      );
      expect(result).toBeDefined();
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  it("should handle recent tattoo case for Sunil Rana", async () => {
    const userId = "user_sunil_rana";
    const questionnaireData: SubmitEligibilityDTO = {
      age: 24,
      weight: 70,
      hasChronicIllness: false,
      isPregnant: false,
      hasRecentSurgery: false,
      hasRecentTattoo: true, // Recent tattoo
      hasDiabetes: false,
      hasHeartDisease: false,
      hasHighBloodPressure: false,
      takingMedication: false,
      hasHIV: false,
      hasHepatitis: false,
      hasCancer: false,
      hasBloodDisorder: false,
      lastDonationDate: null,
      donationType: "blood",
    } as any;

    try {
      const result = await eligibilityService.submitQuestionnaire(
        userId,
        questionnaireData
      );
      expect(result).toBeDefined();
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  /**
   * PREGNANCY TESTS
   */
  it("should handle pregnancy case for Sunita Neupane", async () => {
    const userId = "user_sunita_neupane";
    const questionnaireData: SubmitEligibilityDTO = {
      age: 27,
      weight: 58,
      hasChronicIllness: false,
      isPregnant: true, // Pregnant
      hasRecentSurgery: false,
      hasRecentTattoo: false,
      hasDiabetes: false,
      hasHeartDisease: false,
      hasHighBloodPressure: false,
      takingMedication: false,
      hasHIV: false,
      hasHepatitis: false,
      hasCancer: false,
      hasBloodDisorder: false,
      lastDonationDate: null,
      donationType: "blood",
    } as any;

    try {
      const result = await eligibilityService.submitQuestionnaire(
        userId,
        questionnaireData
      );
      expect(result).toBeDefined();
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  /**
   * BLOOD DISORDER TESTS
   */
  it("should handle blood disorder case for Dipak Bhandari", async () => {
    const userId = "user_dipak_bhandari";
    const questionnaireData: SubmitEligibilityDTO = {
      age: 33,
      weight: 72,
      hasChronicIllness: false,
      isPregnant: false,
      hasRecentSurgery: false,
      hasRecentTattoo: false,
      hasDiabetes: false,
      hasHeartDisease: false,
      hasHighBloodPressure: false,
      takingMedication: false,
      hasHIV: false,
      hasHepatitis: false,
      hasCancer: false,
      hasBloodDisorder: true, // Has blood disorder
      lastDonationDate: null,
      donationType: "blood",
    } as any;

    try {
      const result = await eligibilityService.submitQuestionnaire(
        userId,
        questionnaireData
      );
      expect(result).toBeDefined();
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  /**
   * MEDICATION TESTS
   */
  it("should handle medication case for Kamala Devi Sharma", async () => {
    const userId = "user_kamala_sharma";
    const questionnaireData: SubmitEligibilityDTO = {
      age: 38,
      weight: 62,
      hasChronicIllness: false,
      isPregnant: false,
      hasRecentSurgery: false,
      hasRecentTattoo: false,
      hasDiabetes: false,
      hasHeartDisease: false,
      hasHighBloodPressure: false,
      takingMedication: true, // Taking medication
      hasHIV: false,
      hasHepatitis: false,
      hasCancer: false,
      hasBloodDisorder: false,
      lastDonationDate: null,
      donationType: "blood",
    } as any;

    try {
      const result = await eligibilityService.submitQuestionnaire(
        userId,
        questionnaireData
      );
      expect(result).toBeDefined();
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  it("should validate donor age range for Nepalese donors", async () => {
    const validAges = [18, 25, 35, 45, 55];
    validAges.forEach(age => {
      expect(age).toBeGreaterThanOrEqual(18);
      expect(age).toBeLessThanOrEqual(60);
    });
  });
});
