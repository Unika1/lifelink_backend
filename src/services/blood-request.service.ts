import { HttpError } from "../errors/http-error.js";
import {
  CreateBloodRequestDTO,
  UpdateBloodRequestDTO,
  SearchBloodRequestDTO,
} from "../dtos/blood-request.dto.js";
import { BloodRequestRepository } from "../repositories/blood-request.repository.js";

const bloodRequestRepository = new BloodRequestRepository();

export class BloodRequestService {
  async createRequest(data: CreateBloodRequestDTO) {
    const request = await bloodRequestRepository.createRequest(data as any);
    return request;
  }

  async getAllRequests(criteria?: SearchBloodRequestDTO) {
    return await bloodRequestRepository.getAllRequests(criteria);
  }

  async getRequestById(id: string) {
    console.log("[BloodRequestService] Getting request by ID:", id);
    const request = await bloodRequestRepository.getRequestById(id);
    console.log("[BloodRequestService] Found request:", request ? "Yes" : "No");
    if (!request) {
      throw new HttpError(404, "Request not found");
    }
    return request;
  }

  async updateRequest(id: string, data: UpdateBloodRequestDTO) {
    const updated = await bloodRequestRepository.updateRequest(id, data as any);
    if (!updated) {
      throw new HttpError(404, "Request not found");
    }
    return updated;
  }

  async deleteRequest(id: string) {
    const deleted = await bloodRequestRepository.deleteRequest(id);
    if (!deleted) {
      throw new HttpError(404, "Request not found");
    }
    return deleted;
  }
}
