import mongoose from "mongoose";
import { OrganRequestModel, IOrganRequest } from "../models/organ-request.model";
import { SearchOrganRequestDTO } from "../dtos/organ-request.dto";

export interface IOrganRequestRepository {
  createRequest(data: Partial<IOrganRequest>): Promise<IOrganRequest>;
  getRequestById(id: string): Promise<IOrganRequest | null>;
  getAllRequests(criteria?: SearchOrganRequestDTO): Promise<IOrganRequest[]>;
  updateRequest(id: string, data: Partial<IOrganRequest>): Promise<IOrganRequest | null>;
  deleteRequest(id: string): Promise<boolean>;
}

export class OrganRequestRepository implements IOrganRequestRepository {
  async createRequest(data: Partial<IOrganRequest>): Promise<IOrganRequest> {
    const request = new OrganRequestModel(data);
    return await request.save();
  }

  async getRequestById(id: string): Promise<IOrganRequest | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await OrganRequestModel.findById(id);
  }

  async getAllRequests(criteria?: SearchOrganRequestDTO): Promise<IOrganRequest[]> {
    const query: any = {};

    if (criteria?.hospitalId && criteria?.hospitalName) {
      const escapedHospitalName = criteria.hospitalName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = [
        { hospitalId: criteria.hospitalId },
        { hospitalName: { $regex: `^${escapedHospitalName}$`, $options: "i" } },
      ];
    } else if (criteria?.hospitalId) {
      query.hospitalId = criteria.hospitalId;
    } else if (criteria?.hospitalName) {
      const escapedHospitalName = criteria.hospitalName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.hospitalName = { $regex: `^${escapedHospitalName}$`, $options: "i" };
    }

    if (criteria?.requestedBy) {
      query.requestedBy = criteria.requestedBy;
    }
    if (criteria?.status) {
      query.status = criteria.status;
    }

    return await OrganRequestModel.find(query).sort({ createdAt: -1 });
  }

  async updateRequest(
    id: string,
    data: Partial<IOrganRequest>
  ): Promise<IOrganRequest | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await OrganRequestModel.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteRequest(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false;
    }
    const result = await OrganRequestModel.findByIdAndDelete(id);
    return result ? true : false;
  }
}
