import { HttpError } from "../errors/http-error.js";
import {
  CreateOrganRequestDTO,
  UpdateOrganRequestDTO,
  SearchOrganRequestDTO,
} from "../dtos/organ-request.dto.js";
import { OrganRequestRepository } from "../repositories/organ-request.repository.js";

const organRequestRepository = new OrganRequestRepository();

export class OrganRequestService {
  async createRequest(data: CreateOrganRequestDTO) {
    const request = await organRequestRepository.createRequest(data as any);
    return request;
  }

  async getAllRequests(criteria?: SearchOrganRequestDTO) {
    return await organRequestRepository.getAllRequests(criteria);
  }

  async getRequestById(id: string) {
    const request = await organRequestRepository.getRequestById(id);
    if (!request) {
      throw new HttpError(404, "Request not found");
    }
    return request;
  }

  async updateRequest(id: string, data: UpdateOrganRequestDTO) {
    const updated = await organRequestRepository.updateRequest(id, data as any);
    if (!updated) {
      throw new HttpError(404, "Request not found");
    }
    return updated;
  }

  async deleteRequest(id: string) {
    const deleted = await organRequestRepository.deleteRequest(id);
    if (!deleted) {
      throw new HttpError(404, "Request not found");
    }
    return deleted;
  }
}
