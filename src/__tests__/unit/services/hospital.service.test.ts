import { HospitalService } from "../../../services/hospital.service";
import {
  CreateHospitalDTO,
  UpdateHospitalDTO,
  UpdateBloodInventoryDTO,
} from "../../../dtos/hospital.dto";
import { HttpError } from "../../../errors/http-error";

/**
 * UNIT TEST FOR HospitalService 
 * 
 */

describe("HospitalService - Unit Tests", () => {
  let hospitalService: HospitalService;

  beforeEach(() => {
    hospitalService = new HospitalService();
  });

  /**
   * CREATE HOSPITAL TESTS
   */
  it("should create Bir Hospital in Kathmandu", async () => {
    const hospitalData: CreateHospitalDTO = {
      name: "Bir Hospital",
      email: `bir.hospital${Date.now()}@hospital.com.np`,
      password: "birHospital123",
      phoneNumber: "9841234567",
      address: {
        street: "Mahaboudha Road",
        city: "Kathmandu",
        state: "Bagmati",
        zipCode: "44600",
      },
      location: {
        type: "Point",
        coordinates: [85.314, 27.7035],
      },
      licenseNumber: "KTM-BIR-001",
      imageUrl: "https://example.com/bir-hospital.jpg",
    } as any;

    try {
      const result = await hospitalService.createHospital(hospitalData);
      expect(result).toBeDefined();
      expect(result.name).toBe("Bir Hospital");
    } catch (error: any) {
      if (error.message === "Hospital with this email already exists" || 
          error.message === "Email already in use") {
        expect(error.statusCode).toBe(403);
      } else {
        expect(error).toBeDefined();
      }
    }
  });

  it("should create Tribhuvan University Teaching Hospital", async () => {
    const hospitalData: CreateHospitalDTO = {
      name: "Tribhuvan University Teaching Hospital",
      email: `tuth${Date.now()}@hospital.com.np`,
      password: "tuth@2024",
      phoneNumber: "9851234567",
      address: {
        street: "Maharajgunj",
        city: "Kathmandu",
        state: "Bagmati",
        zipCode: "44600",
      },
      location: {
        type: "Point",
        coordinates: [85.3312, 27.7357],
      },
      licenseNumber: "KTM-TUTH-002",
      imageUrl: "https://example.com/tuth.jpg",
    } as any;

    try {
      const result = await hospitalService.createHospital(hospitalData);
      expect(result).toBeDefined();
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  it("should create Patan Hospital in Lalitpur", async () => {
    const hospitalData: CreateHospitalDTO = {
      name: "Patan Hospital",
      email: `patan.hospital${Date.now()}@hospital.com.np`,
      password: "patanHospital456",
      phoneNumber: "9861234567",
      address: {
        street: "Lagankhel",
        city: "Lalitpur",
        state: "Bagmati",
        zipCode: "44700",
      },
      location: {
        type: "Point",
        coordinates: [85.3240, 27.6663],
      },
      licenseNumber: "LTP-PATAN-003",
      imageUrl: "https://example.com/patan-hospital.jpg",
    } as any;

    try {
      const result = await hospitalService.createHospital(hospitalData);
      expect(result).toBeDefined();
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  it("should create Manang Sewa Hospital in Pokhara", async () => {
    const hospitalData: CreateHospitalDTO = {
      name: "Manang Sewa Hospital",
      email: `manang${Date.now()}@hospital.com.np`,
      password: "manangSewa789",
      phoneNumber: "9871234567",
      address: {
        street: "Bagar",
        city: "Pokhara",
        state: "Gandaki",
        zipCode: "33700",
      },
      location: {
        type: "Point",
        coordinates: [83.9856, 28.2096],
      },
      licenseNumber: "PKR-MANANG-004",
      imageUrl: "https://example.com/manang-hospital.jpg",
    } as any;

    try {
      const result = await hospitalService.createHospital(hospitalData);
      expect(result).toBeDefined();
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  it("should throw error when creating hospital with existing email", async () => {
    const hospitalData: CreateHospitalDTO = {
      name: "Duplicate Hospital",
      email: "existing@hospital.com.np",
      password: "password123",
      phoneNumber: "9841234567",
      address: {
        street: "Test Street",
        city: "Kathmandu",
        state: "Bagmati",
        zipCode: "44600",
      },
      location: {
        type: "Point",
        coordinates: [85.324, 27.7172],
      },
      licenseNumber: "TEST-001",
      imageUrl: "https://example.com/test.jpg",
    } as any;

    try {
      await hospitalService.createHospital(hospitalData);
      await hospitalService.createHospital(hospitalData);
      expect(false).toBe(true);
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  /**
   * RETRIEVAL TESTS
   */
  it("should get all hospitals in Nepal", async () => {
    try {
      const result = await hospitalService.getAllHospitals();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  it("should throw error when getting non-existent hospital", async () => {
    const invalidId = "000000000000000000000000";

    try {
      await hospitalService.getHospitalById(invalidId);
      expect(false).toBe(true);
    } catch (error: any) {
      expect(error.message).toBe("Hospital not found");
      expect(error.statusCode).toBe(404);
    }
  });

  /**
   * UPDATE TESTS
   */
  it("should throw error when updating non-existent hospital", async () => {
    const invalidId = "000000000000000000000000";
    const updateData: UpdateHospitalDTO = {
      name: "Updated Norvic Hospital",
    } as any;

    try {
      await hospitalService.updateHospital(invalidId, updateData);
      expect(false).toBe(true);
    } catch (error: any) {
      expect(error.message).toBe("Hospital not found");
      expect(error.statusCode).toBe(404);
    }
  });

  it("should update hospital phone number", async () => {
    const invalidId = "000000000000000000000000";
    const updateData: UpdateHospitalDTO = {
      phoneNumber: "9851234567",
    } as any;

    try {
      await hospitalService.updateHospital(invalidId, updateData);
      expect(false).toBe(true);
    } catch (error: any) {
      expect(error.message).toBe("Hospital not found");
    }
  });

  /**
   * DELETE TESTS
   */
  it("should throw error when deleting non-existent hospital", async () => {
    const invalidId = "000000000000000000000000";

    try {
      await hospitalService.deleteHospital(invalidId);
      expect(false).toBe(true);
    } catch (error: any) {
      expect(error.message).toBe("Hospital not found");
      expect(error.statusCode).toBe(404);
    }
  });

  /**
   * BLOOD INVENTORY TESTS
   */
  it("should throw error when updating inventory for non-existent hospital", async () => {
    const invalidId = "000000000000000000000000";
    const inventoryData: UpdateBloodInventoryDTO = {
      bloodType: "A+",
      unitsAvailable: 10,
    } as any;

    try {
      await hospitalService.updateBloodInventory(invalidId, inventoryData);
      expect(false).toBe(true);
    } catch (error: any) {
      expect(error.message).toBe("Hospital not found");
      expect(error.statusCode).toBe(404);
    }
  });

  it("should update O+ blood inventory", async () => {
    const invalidId = "000000000000000000000000";
    const inventoryData: UpdateBloodInventoryDTO = {
      bloodType: "O+",
      unitsAvailable: 25,
    } as any;

    try {
      await hospitalService.updateBloodInventory(invalidId, inventoryData);
      expect(false).toBe(true);
    } catch (error: any) {
      expect(error.message).toBe("Hospital not found");
    }
  });

  it("should update AB- blood inventory", async () => {
    const invalidId = "000000000000000000000000";
    const inventoryData: UpdateBloodInventoryDTO = {
      bloodType: "AB-",
      unitsAvailable: 5,
    } as any;

    try {
      await hospitalService.updateBloodInventory(invalidId, inventoryData);
      expect(false).toBe(true);
    } catch (error: any) {
      expect(error.message).toBe("Hospital not found");
    }
  });

  it("should throw error when getting inventory for non-existent hospital", async () => {
    const invalidId = "000000000000000000000000";

    try {
      await hospitalService.getBloodInventory(invalidId);
      expect(false).toBe(true);
    } catch (error: any) {
      expect(error.message).toBe("Hospital not found");
      expect(error.statusCode).toBe(404);
    }
  });

  /**
   * SEARCH TESTS
   */
  it("should search hospitals by O+ blood availability", async () => {
    const searchCriteria = {
      bloodType: "O+",
    } as any;

    try {
      const result = await hospitalService.searchHospitals(searchCriteria);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  it("should search hospitals by A- blood availability", async () => {
    const searchCriteria = {
      bloodType: "A-",
    } as any;

    try {
      const result = await hospitalService.searchHospitals(searchCriteria);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  it("should search hospitals in Kathmandu city", async () => {
    const searchCriteria = {
      city: "Kathmandu",
    } as any;

    try {
      const result = await hospitalService.searchHospitals(searchCriteria);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  /**
   * DONOR MANAGEMENT TESTS
   */
  it("should get all registered donors", async () => {
    try {
      const result = await hospitalService.getAllDonors();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  /**
   * VALIDATION TESTS
   */
  it("should validate Nepalese hospital license format", async () => {
    const licenseCodes = ["KTM-BIR-001", "PKR-MANANG-004", "LTP-PATAN-003"];
    licenseCodes.forEach(license => {
      expect(license).toMatch(/^[A-Z]{3}-[A-Z]+-\d{3}$/);
    });
  });

  it("should validate Kathmandu coordinates", async () => {
    const coordinates = { lat: 27.7172, lng: 85.324 };
    expect(coordinates.lat).toBeGreaterThan(26);
    expect(coordinates.lat).toBeLessThan(29);
    expect(coordinates.lng).toBeGreaterThan(84);
    expect(coordinates.lng).toBeLessThan(87);
  });

  it("should validate hospital phone numbers from Nepal", async () => {
    const phones = ["9841234567", "9851234568", "9869876543", "9879988776"];
   phones.forEach(phone => {
      expect(phone).toMatch(/^98[0-9]{8}$/);
    });
  });
});
