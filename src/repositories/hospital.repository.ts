import { HospitalModel, IHospital } from "../models/hospital.model.js";
import { SearchHospitalDTO } from "../dtos/hospital.dto.js";

export interface IHospitalRepository {
  createHospital(data: Partial<IHospital>): Promise<IHospital>;
  getHospitalById(id: string): Promise<IHospital | null>;
  getHospitalByEmail(email: string): Promise<IHospital | null>;
  getAllHospitals(): Promise<IHospital[]>;
  searchHospitals(criteria: SearchHospitalDTO): Promise<IHospital[]>;
  updateHospital(id: string, data: Partial<IHospital>): Promise<IHospital | null>;
  deleteHospital(id: string): Promise<boolean>;
  updateBloodInventory(
    hospitalId: string,
    bloodType: string,
    units: number
  ): Promise<IHospital | null>;
}

/**
 * Hospital Repository - Data Access Layer
 * Handles all database operations for hospitals
 */
export class HospitalRepository implements IHospitalRepository {
  /**
   * Create a new hospital
   */
  async createHospital(data: Partial<IHospital>): Promise<IHospital> {
    const hospital = new HospitalModel(data);
    return await hospital.save();
  }

  /**
   * Get hospital by ID
   */
  async getHospitalById(id: string): Promise<IHospital | null> {
    return await HospitalModel.findById(id);
  }

  /**
   * Get hospital by email
   */
  async getHospitalByEmail(email: string): Promise<IHospital | null> {
    return await HospitalModel.findOne({ email });
  }

  /**
   * Get all hospitals
   */
  async getAllHospitals(): Promise<IHospital[]> {
    return await HospitalModel.find();
  }

  /**
   * Search hospitals by criteria
   * Filter by city, state, blood type availability
   */
  async searchHospitals(criteria: SearchHospitalDTO): Promise<IHospital[]> {
    const query: any = {};

    if (criteria.city) {
      query["address.city"] = { $regex: criteria.city, $options: "i" };
    }

    if (criteria.state) {
      query["address.state"] = { $regex: criteria.state, $options: "i" };
    }

    if (criteria.isActive !== undefined) {
      query.isActive = criteria.isActive;
    }

    // Filter by blood type availability
    if (criteria.bloodType) {
      query["bloodInventory"] = {
        $elemMatch: {
          bloodType: criteria.bloodType,
          unitsAvailable: { $gt: 0 },
        },
      };
    }

    return await HospitalModel.find(query);
  }

  /**
   * Update hospital information
   */
  async updateHospital(
    id: string,
    data: Partial<IHospital>
  ): Promise<IHospital | null> {
    return await HospitalModel.findByIdAndUpdate(id, data, { new: true });
  }

  /**
   * Delete hospital
   */
  async deleteHospital(id: string): Promise<boolean> {
    const result = await HospitalModel.findByIdAndDelete(id);
    return result ? true : false;
  }

  /**
   * Update blood inventory for specific blood type
   */
  async updateBloodInventory(
    hospitalId: string,
    bloodType: string,
    units: number
  ): Promise<IHospital | null> {
    const hospital = await HospitalModel.findById(hospitalId);
    if (!hospital) return null;

    // Find existing blood type in inventory
    const inventoryItem = hospital.bloodInventory?.find(
      (item) => item.bloodType === bloodType
    );

    if (inventoryItem) {
      // Update existing inventory
      inventoryItem.unitsAvailable = units;
      inventoryItem.lastUpdated = new Date();
    } else {
      // Add new blood type to inventory
      if (!hospital.bloodInventory) {
        hospital.bloodInventory = [];
      }
      hospital.bloodInventory.push({
        bloodType: bloodType as any,
        unitsAvailable: units,
        lastUpdated: new Date(),
      });
    }

    return await hospital.save();
  }
}
