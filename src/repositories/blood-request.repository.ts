import { BloodRequestModel, IBloodRequest } from "../models/blood-request.model.js";
import { SearchBloodRequestDTO } from "../dtos/blood-request.dto.js";

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
    return await BloodRequestModel.findById(id);
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
    return await BloodRequestModel.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteRequest(id: string): Promise<boolean> {
    const result = await BloodRequestModel.findByIdAndDelete(id);
    return result ? true : false;
  }
}
