import { BloodRequestModel, IBloodRequest } from "../models/blood-request.model.js";
import { SearchBloodRequestDTO } from "../dtos/blood-request.dto.js";
import mongoose from "mongoose";

export interface IBloodRequestRepository {
  createRequest(data: Partial<IBloodRequest>): Promise<IBloodRequest>;
  getRequestById(id: string): Promise<IBloodRequest | null>;
  getAllRequests(criteria?: SearchBloodRequestDTO): Promise<IBloodRequest[]>;
  updateRequest(id: string, data: Partial<IBloodRequest>): Promise<IBloodRequest | null>;
  deleteRequest(id: string): Promise<boolean>;
}

export class BloodRequestRepository implements IBloodRequestRepository {
  async createRequest(data: Partial<IBloodRequest>): Promise<IBloodRequest> {
    const request = new BloodRequestModel(data);
    return await request.save();
  }

  async getRequestById(id: string): Promise<IBloodRequest | null> {
    console.log("[BloodRequestRepository] Getting request by ID:", id);
    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("[BloodRequestRepository] Invalid ObjectId format");
      return null;
    }
    const result = await BloodRequestModel.findById(id);
    console.log("[BloodRequestRepository] Query result:", result ? "Found" : "Not found");
    return result;
  }

  async getAllRequests(criteria?: SearchBloodRequestDTO): Promise<IBloodRequest[]> {
    const query: any = {};

    if (criteria?.hospitalId) {
      query.hospitalId = criteria.hospitalId;
    }

    if (criteria?.hospitalName) {
      query.hospitalName = criteria.hospitalName;
    }

    if (criteria?.requestedBy) {
      query.requestedBy = criteria.requestedBy;
    }

    if (criteria?.status) {
      query.status = criteria.status;
    }

    return await BloodRequestModel.find(query).sort({ createdAt: -1 });
  }

  async updateRequest(
    id: string,
    data: Partial<IBloodRequest>
  ): Promise<IBloodRequest | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await BloodRequestModel.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteRequest(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false;
    }
    const result = await BloodRequestModel.findByIdAndDelete(id);
    return result ? true : false;
  }
}
