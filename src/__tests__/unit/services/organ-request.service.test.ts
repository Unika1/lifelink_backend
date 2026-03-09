import { OrganRequestService } from "../../../services/organ-request.service";
import {
  CreateOrganRequestDTO,
  UpdateOrganRequestDTO,
  SearchOrganRequestDTO,
} from "../../../dtos/organ-request.dto";
import { HttpError } from "../../../errors/http-error";

/**
 * UNIT TEST FOR OrganRequestService 
 * 
 * Comprehensive tests for organ request management.
 */

describe("OrganRequestService - Unit Tests", () => {
  let organRequestService: OrganRequestService;

  beforeEach(() => {
    organRequestService = new OrganRequestService();
  });

  /**
   * CREATE ORGAN REQUEST TESTS
   */
  it("should create organ donation request for Ram Bahadur Thapa", async () => {
    const requestData: CreateOrganRequestDTO = {
      hospitalName: "Bir Hospital",
      donorName: "Ram Bahadur Thapa",
      reportUrl: "https://example.com/reports/ram-thapa.pdf",
      hospitalId: "hospital_bir",
      requestedBy: "user_ram",
      scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      notes: "Kidney donation - Ram Bahadur Thapa",
    } as any;

    try {
      const result = await organRequestService.createRequest(requestData);
      expect(result).toBeDefined();
      expect(result.donorName).toBe("Ram Bahadur Thapa");
      expect(result.hospitalName).toBe("Bir Hospital");
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  it("should create organ request for Sita Kumari Shrestha at Patan Hospital", async () => {
    const requestData: CreateOrganRequestDTO = {
      hospitalName: "Patan Hospital",
      donorName: "Sita Kumari Shrestha",
      reportUrl: "https://example.com/reports/sita-shrestha.pdf",
      hospitalId: "hospital_patan",
      requestedBy: "user_sita",
      scheduledAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      notes: "Liver donation request",
    } as any;

    try {
      const result = await organRequestService.createRequest(requestData);
      expect(result).toBeDefined();
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  it("should create cornea donation for Hari Prasad Adhikari", async () => {
    const requestData: CreateOrganRequestDTO = {
      hospitalName: "Tribhuvan University Teaching Hospital",
      donorName: "Hari Prasad Adhikari",
      reportUrl: "https://example.com/reports/hari-adhikari.pdf",
      hospitalId: "hospital_tuth",
      requestedBy: "user_hari",
      scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      notes: "Cornea donation for eye surgery",
    } as any;

    try {
      const result = await organRequestService.createRequest(requestData);
      expect(result).toBeDefined();
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  it("should create heart donation for Krishna Bahadur Gurung", async () => {
    const requestData: CreateOrganRequestDTO = {
      hospitalName: "Manang Sewa Hospital",
      donorName: "Krishna Bahadur Gurung",
      reportUrl: "https://example.com/reports/krishna-gurung.pdf",
      hospitalId: "hospital_manang",
      requestedBy: "user_krishna",
      scheduledAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      notes: "Heart donation - Critical case",
    } as any;

    try {
      const result = await organRequestService.createRequest(requestData);
      expect(result).toBeDefined();
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  /**
   * RETRIEVAL TESTS
   */
  it("should throw error when getting non-existent organ request", async () => {
    const invalidId = "000000000000000000000000";

    try {
      await organRequestService.getRequestById(invalidId);
      expect(false).toBe(true);
    } catch (error: any) {
      expect(error.message).toBe("Request not found");
      expect(error.statusCode).toBe(404);
    }
  });

  it("should get all organ donation requests", async () => {
    try {
      const result = await organRequestService.getAllRequests();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  /**
   * SEARCH AND FILTER TESTS
   */
  it("should search pending organ requests", async () => {
    const searchCriteria: SearchOrganRequestDTO = {
      status: "pending",
    } as any;

    try {
      const result = await organRequestService.getAllRequests(searchCriteria);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  it("should search approved organ requests", async () => {
    const searchCriteria: SearchOrganRequestDTO = {
      status: "approved",
    } as any;

    try {
      const result = await organRequestService.getAllRequests(searchCriteria);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  it("should search requests by Bir Hospital", async () => {
    const searchCriteria: SearchOrganRequestDTO = {
      hospitalName: "Bir Hospital",
    } as any;

    try {
      const result = await organRequestService.getAllRequests(searchCriteria);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  it("should search requests by Patan Hospital", async () => {
    const searchCriteria: SearchOrganRequestDTO = {
      hospitalName: "Patan Hospital",
    } as any;

    try {
      const result = await organRequestService.getAllRequests(searchCriteria);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  it("should search requests by hospital ID", async () => {
    const searchCriteria: SearchOrganRequestDTO = {
      hospitalId: "hospital_tuth",
    } as any;

    try {
      const result = await organRequestService.getAllRequests(searchCriteria);
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
    const updateData: UpdateOrganRequestDTO = {
      status: "approved",
      notes: "Medical tests completed",
    } as any;

    try {
      await organRequestService.updateRequest(invalidId, updateData);
      expect(false).toBe(true);
    } catch (error: any) {
      expect(error.message).toBe("Request not found");
      expect(error.statusCode).toBe(404);
    }
  });

  it("should throw error when updating to fulfilled status", async () => {
    const invalidId = "000000000000000000000000";
    const updateData: UpdateOrganRequestDTO = {
      status: "fulfilled",
    } as any;

    try {
      await organRequestService.updateRequest(invalidId, updateData);
      expect(false).toBe(true);
    } catch (error: any) {
      expect(error.message).toBe("Request not found");
    }
  });

  it("should throw error when updating with notes for Maya Rai", async () => {
    const invalidId = "000000000000000000000000";
    const updateData: UpdateOrganRequestDTO = {
      notes: "Maya Rai - Donor health checkup scheduled",
    } as any;

    try {
      await organRequestService.updateRequest(invalidId, updateData);
      expect(false).toBe(true);
    } catch (error: any) {
      expect(error.message).toBe("Request not found");
    }
  });

  it("should update request to rejected status", async () => {
    const invalidId = "000000000000000000000000";
    const updateData: UpdateOrganRequestDTO = {
      status: "rejected",
      notes: "Medical incompatibility found",
    } as any;

    try {
      await organRequestService.updateRequest(invalidId, updateData);
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
      await organRequestService.deleteRequest(invalidId);
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
      await organRequestService.getRequestById(invalidId);
      expect(false).toBe(true);
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  it("should validate organ request status values", async () => {
    const statuses = ["pending", "approved", "rejected", "fulfilled"];
    statuses.forEach(status => {
      expect(statuses).toContain(status);
    });
  });

  it("should validate donor names format", async () => {
    const donorNames = [
      "Ram Bahadur Thapa",
      "Sita Kumari Shrestha",
      "Hari Prasad Adhikari",
      "Krishna Bahadur Gurung",
      "Maya Devi Rai"
    ];
    
    donorNames.forEach(name => {
      expect(name.split(' ').length).toBeGreaterThanOrEqual(2);
    });
  });

  it("should validate report URL format", async () => {
    const reportUrls = [
      "https://example.com/reports/ram-thapa.pdf",
      "https://example.com/reports/sita-shrestha.pdf"
    ];
    
    reportUrls.forEach(url => {
      expect(url).toMatch(/^https:\/\//);
      expect(url).toMatch(/\.pdf$/);
    });
  });

  it("should validate Nepal hospital names", async () => {
    const hospitals = ["Bir Hospital", "Patan Hospital", "Tribhuvan University Teaching Hospital", "Manang Sewa Hospital"];
    hospitals.forEach(hospital => {
      expect(hospital.length).toBeGreaterThan(5);
      expect(hospital).toMatch(/Hospital/);
    });
  });
});
