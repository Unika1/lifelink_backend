import { HospitalRepository } from "../repositories/hospital.repository";
import { HttpError } from "../errors/http-error";
import {
  CreateHospitalDTO,
  UpdateHospitalDTO,
  UpdateBloodInventoryDTO,
  CreateBloodInventoryDTO,
  DeleteBloodInventoryDTO,
  SearchHospitalDTO,
} from "../dtos/hospital.dto";
import { UserRepository } from "../repositories/user.repository";
import bcryptjs from "bcryptjs";

const hospitalRepository = new HospitalRepository();
const userRepository = new UserRepository();

/**
 * Hospital Service - Business Logic Layer
 * Handles all hospital-related operations
 */
export class HospitalService {
  /**
   * Create a new hospital
   */
  async createHospital(data: CreateHospitalDTO) {
    // Check if hospital email already exists
    const existingHospital = await hospitalRepository.getHospitalByEmail(
      data.email
    );
    if (existingHospital) {
      throw new HttpError(403, "Hospital with this email already exists");
    }

    // Check if email already exists in users
    const existingUser = await userRepository.getUserByEmail(data.email);
    if (existingUser) {
      throw new HttpError(403, "Email already in use");
    }

    // Create User account for hospital staff
    const hashedPassword = await bcryptjs.hash(data.password, 10);
    const newUser = await userRepository.createUser({
      email: data.email,
      password: hashedPassword,
      firstName: data.name, // Use hospital name as first name
      lastName: "Hospital", // Default last name for hospital users
      role: "hospital", // Hospital staff has 'hospital' role
    });

    // Initialize empty blood inventory for all blood types
    const initialInventory = [
      "A+",
      "A-",
      "B+",
      "B-",
      "AB+",
      "AB-",
      "O+",
      "O-",
    ].map((bloodType) => ({
      bloodType,
      unitsAvailable: 0,
      lastUpdated: new Date(),
    }));

    const hospitalData = {
      name: data.name,
      email: data.email,
      phoneNumber: data.phoneNumber,
      address: data.address,
      location: data.location,
      licenseNumber: data.licenseNumber,
      imageUrl: data.imageUrl,
      userId: newUser._id.toString(),
      bloodInventory: initialInventory as any,
    };

    try {
      const newHospital = await hospitalRepository.createHospital(hospitalData as any);
      return newHospital;
    } catch (error) {
      await userRepository.deleteUser(newUser._id.toString());
      throw error;
    }
  }

  /**
   * Get all hospitals
   */
  async getAllHospitals() {
    const hospitals = await hospitalRepository.getAllHospitals();
    return hospitals;
  }

  /**
   * Get hospital by ID
   */
  async getHospitalById(id: string) {
    const hospital = await hospitalRepository.getHospitalById(id);
    if (!hospital) {
      throw new HttpError(404, "Hospital not found");
    }
    return hospital;
  }

  /**
   * Search hospitals by criteria
   */
  async searchHospitals(criteria: SearchHospitalDTO) {
    const hospitals = await hospitalRepository.searchHospitals(criteria);
    return hospitals;
  }

  /**
   * Update hospital information
   */
  async updateHospital(id: string, updateData: UpdateHospitalDTO) {
    const hospital = await hospitalRepository.getHospitalById(id);
    if (!hospital) {
      throw new HttpError(404, "Hospital not found");
    }

    // Check email uniqueness if email is being updated
    if (updateData.email && hospital.email !== updateData.email) {
      const emailExists = await hospitalRepository.getHospitalByEmail(
        updateData.email
      );
      if (emailExists) {
        throw new HttpError(403, "Email already in use by another hospital");
      }
    }

    const updatedHospital = await hospitalRepository.updateHospital(
      id,
      updateData
    );
    return updatedHospital;
  }

  /**
   * Delete hospital
   */
  async deleteHospital(id: string) {
    const hospital = await hospitalRepository.getHospitalById(id);
    if (!hospital) {
      throw new HttpError(404, "Hospital not found");
    }

    const deleted = await hospitalRepository.deleteHospital(id);
    return deleted;
  }

  /**
   * Update blood inventory for specific blood type
   */
  async updateBloodInventory(
    hospitalId: string,
    inventoryData: UpdateBloodInventoryDTO
  ) {
    const hospital = await hospitalRepository.getHospitalById(hospitalId);
    if (!hospital) {
      throw new HttpError(404, "Hospital not found");
    }

    const updatedHospital = await hospitalRepository.updateBloodInventory(
      hospitalId,
      inventoryData.bloodType,
      inventoryData.unitsAvailable
    );

    if (!updatedHospital) {
      throw new HttpError(404, "Blood type not found in inventory");
    }

    return updatedHospital;
  }

  /**
   * Add a new blood type to inventory
   */
  async addBloodInventory(
    hospitalId: string,
    inventoryData: CreateBloodInventoryDTO
  ) {
    const hospital = await hospitalRepository.getHospitalById(hospitalId);
    if (!hospital) {
      throw new HttpError(404, "Hospital not found");
    }

    const updatedHospital = await hospitalRepository.addBloodInventory(
      hospitalId,
      inventoryData.bloodType,
      inventoryData.unitsAvailable
    );

    if (!updatedHospital) {
      throw new HttpError(409, "Blood type already exists in inventory");
    }

    return updatedHospital;
  }

  /**
   * Remove a blood type from inventory
   */
  async deleteBloodInventory(
    hospitalId: string,
    inventoryData: DeleteBloodInventoryDTO
  ) {
    const hospital = await hospitalRepository.getHospitalById(hospitalId);
    if (!hospital) {
      throw new HttpError(404, "Hospital not found");
    }

    const updatedHospital = await hospitalRepository.deleteBloodInventory(
      hospitalId,
      inventoryData.bloodType
    );

    if (!updatedHospital) {
      throw new HttpError(404, "Blood type not found in inventory");
    }

    return updatedHospital;
  }

  /**
   * Get blood inventory for a hospital
   */
  async getBloodInventory(hospitalId: string) {
    const hospital = await hospitalRepository.getHospitalById(hospitalId);
    if (!hospital) {
      throw new HttpError(404, "Hospital not found");
    }

    return hospital.bloodInventory || [];
  }

  /**
   * Get all donors (role=donor)
   */
  async getAllDonors() {
    return await userRepository.getUsersByRole("donor");
  }
}
