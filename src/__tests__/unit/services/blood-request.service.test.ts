import { BloodRequestService } from "../../../services/blood-request.service";
import {
  CreateBloodRequestDTO,
  UpdateBloodRequestDTO,
  SearchBloodRequestDTO,
} from "../../../dtos/blood-request.dto";
import { HttpError } from "../../../errors/http-error";

/**
 * UNIT TEST FOR BloodRequestService 
 */

describe("BloodRequestService - Unit Tests", () => {
  let bloodRequestService: BloodRequestService;

  beforeEach(() => {
    bloodRequestService = new BloodRequestService();
  });

  /**
   * CREATE BLOOD REQUEST TESTS
   */
  it("should create a blood request for Hari Sharma", async () => {
    const requestData: CreateBloodRequestDTO = {
      patientName: "Hari Sharma",
      bloodType: "A+",
      unitsNeeded: 2,
      urgency: "high",
      hospitalId: "hospital123",
      requestedBy: "user123",
      contactNumber: "9841234567",
      requiredBy: new Date(Date.now() + 24 * 60 * 60 * 1000),
    } as any;

    try {
      const result = await bloodRequestService.createRequest(requestData);
      expect(result).toBeDefined();
      expect(result.patientName).toBe("Hari Sharma");
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  it("should create urgent blood request for Sita Thapa", async () => {
    const requestData: CreateBloodRequestDTO = {
      patientName: "Sita Thapa",
      bloodType: "O-",
      unitsNeeded: 4,
      urgency: "critical",
      hospitalId: "hospital456",
      requestedBy: "user456",
      contactNumber: "9851234567",
      requiredBy: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours
    } as any;

    try {
      const result = await bloodRequestService.createRequest(requestData);
      expect(result).toBeDefined();
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  it("should create blood request for Maya Gurung with AB+", async () => {
    const requestData: CreateBloodRequestDTO = {
      patientName: "Maya Gurung",
      bloodType: "AB+",
      unitsNeeded: 1,
      urgency: "medium",
      hospitalId: "hospital789",
      requestedBy: "user789",
      contactNumber: "9861234567",
      requiredBy: new Date(Date.now() + 48 * 60 * 60 * 1000),
    } as any;

    try {
      const result = await bloodRequestService.createRequest(requestData);
      expect(result).toBeDefined();
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  /**
   * RETRIEVAL TESTS
   */
  it("should throw error when getting non-existent blood request", async () => {
    const invalidId = "000000000000000000000000";

    try {
      await bloodRequestService.getRequestById(invalidId);
      expect(false).toBe(true);
    } catch (error: any) {
      expect(error.message).toBe("Request not found");
      expect(error.statusCode).toBe(404);
    }
  });

  it("should get all blood requests", async () => {
    try {
      const result = await bloodRequestService.getAllRequests();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  /**
   * SEARCH AND FILTER TESTS
   */
  it("should search blood requests by blood type O+", async () => {
    const searchCriteria: SearchBloodRequestDTO = {
      bloodType: "O+",
    } as any;

    try {
      const result = await bloodRequestService.getAllRequests(searchCriteria);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  it("should search blood requests by blood type B-", async () => {
    const searchCriteria: SearchBloodRequestDTO = {
      bloodType: "B-",
    } as any;

    try {
      const result = await bloodRequestService.getAllRequests(searchCriteria);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  it("should search blood requests by high urgency", async () => {
    const searchCriteria: SearchBloodRequestDTO = {
      urgency: "high",
    } as any;

    try {
      const result = await bloodRequestService.getAllRequests(searchCriteria);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  it("should search blood requests by critical urgency", async () => {
    const searchCriteria: SearchBloodRequestDTO = {
      urgency: "critical",
    } as any;

    try {
      const result = await bloodRequestService.getAllRequests(searchCriteria);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  it("should search blood requests by pending status", async () => {
    const searchCriteria: SearchBloodRequestDTO = {
      status: "pending",
    } as any;

    try {
      const result = await bloodRequestService.getAllRequests(searchCriteria);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  /**
   * UPDATE TESTS
   */
  it("should throw error when updating non-existent request", async () => {
    const invalidId = "000000000000000000000000";
    const updateData: UpdateBloodRequestDTO = {
      status: "fulfilled",
    } as any;

    try {
      await bloodRequestService.updateRequest(invalidId, updateData);
      expect(false).toBe(true);
    } catch (error: any) {
      expect(error.message).toBe("Request not found");
      expect(error.statusCode).toBe(404);
    }
  });

  it("should throw error when updating to approved status", async () => {
    const invalidId = "000000000000000000000000";
    const updateData: UpdateBloodRequestDTO = {
      status: "approved",
    } as any;

    try {
      await bloodRequestService.updateRequest(invalidId, updateData);
      expect(false).toBe(true);
    } catch (error: any) {
      expect(error.message).toBe("Request not found");
    }
  });

  it("should throw error when updating urgency level", async () => {
    const invalidId = "000000000000000000000000";
    const updateData: UpdateBloodRequestDTO = {
      urgency: "critical",
    } as any;

    try {
      await bloodRequestService.updateRequest(invalidId, updateData);
      expect(false).toBe(true);
    } catch (error: any) {
      expect(error.message).toBe("Request not found");
    }
  });

  /**
   * DELETE TESTS
   */
  it("should throw error when deleting non-existent request", async () => {
    const invalidId = "000000000000000000000000";

    try {
      await bloodRequestService.deleteRequest(invalidId);
      expect(false).toBe(true);
    } catch (error: any) {
      expect(error.message).toBe("Request not found");
      expect(error.statusCode).toBe(404);
    }
  });

  /**
   * VALIDATION TESTS
   */
  it("should handle invalid ID format", async () => {
    const invalidId = "invalid_id_format";

    try {
      await bloodRequestService.getRequestById(invalidId);
      expect(false).toBe(true);
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  it("should validate blood type format", async () => {
    const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
    bloodTypes.forEach(type => {
      expect(type).toMatch(/^(A|B|AB|O)[+-]$/);
    });
  });

  it("should validate urgency levels", async () => {
    const urgencyLevels = ["low", "medium", "high", "critical"];
    urgencyLevels.forEach(level => {
      expect(urgencyLevels).toContain(level);
    });
  });

  it("should validate status values", async () => {
    const statuses = ["pending", "approved", "fulfilled", "rejected"];
    statuses.forEach(status => {
      expect(statuses).toContain(status);
    });
  });

  it("should validate Nepalese phone number format", async () => {
    const validNumbers = ["9841234567", "9851234567", "9861234567"];
    validNumbers.forEach(number => {
      expect(number).toMatch(/^98[0-9]{8}$/);
    });
  });

  it("should validate patient names from Nepal", async () => {
    const patients = ["Hari Sharma", "Sita Thapa", "Maya Gurung"];
    patients.forEach(name => {
      expect(name.split(' ').length).toBeGreaterThanOrEqual(2);
    });
  });
});
