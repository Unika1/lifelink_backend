import { Request, Response } from "express";
import z from "zod";
import {
  CreateBloodRequestDTO,
  UpdateBloodRequestDTO,
  SearchBloodRequestDTO,
} from "../dtos/blood-request.dto";
import { BloodRequestService } from "../services/blood-request.service";

const bloodRequestService = new BloodRequestService();

const formatValidationMessage = (error: z.ZodError) => {
  const issue = error.issues[0];
  const field = issue?.path?.[0];

  switch (field) {
    case "hospitalName":
      return "Hospital is required";
    case "patientName":
      return "Patient name is required";
    case "bloodType":
      return "Blood type is required";
    case "unitsRequested":
      return "Units needed is required";
    default:
      return issue?.message || "Invalid request data";
  }
};

export class BloodRequestController {
  async createRequest(req: Request, res: Response) {
    try {
      const parsedData = CreateBloodRequestDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: formatValidationMessage(parsedData.error),
        });
      }

      const requesterId = req.user?._id?.toString();
      const payload = {
        ...parsedData.data,
        requestedBy: parsedData.data.requestedBy ?? requesterId,
      };

      const request = await bloodRequestService.createRequest(payload);
      return res.status(201).json({
        success: true,
        message: "Request created successfully",
        data: request,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getAllRequests(req: Request, res: Response) {
    try {
      const parsedQuery = SearchBloodRequestDTO.safeParse(req.query);
      const criteria = parsedQuery.success ? parsedQuery.data : undefined;

      const requests = await bloodRequestService.getAllRequests(criteria);
      return res.status(200).json({
        success: true,
        message: "Requests retrieved successfully",
        data: requests,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getRequestById(req: Request, res: Response) {
    try {
      const requestId = req.params.id;
      console.log("[getRequestById] Fetching request with ID:", requestId);
      if (!requestId) {
        return res.status(400).json({
          success: false,
          message: "Request ID is required",
        });
      }

      const request = await bloodRequestService.getRequestById(requestId);
      console.log("[getRequestById] Found request:", request);
      return res.status(200).json({
        success: true,
        message: "Request retrieved successfully",
        data: request,
      });
    } catch (error: any) {
      console.error("[getRequestById] Error:", error.message);
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async updateRequest(req: Request, res: Response) {
    try {
      const requestId = req.params.id;
      if (!requestId) {
        return res.status(400).json({
          success: false,
          message: "Request ID is required",
        });
      }

      const parsedData = UpdateBloodRequestDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: formatValidationMessage(parsedData.error),
        });
      }

      const updated = await bloodRequestService.updateRequest(requestId, parsedData.data);
      return res.status(200).json({
        success: true,
        message: "Request updated successfully",
        data: updated,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async deleteRequest(req: Request, res: Response) {
    try {
      const requestId = req.params.id;
      if (!requestId) {
        return res.status(400).json({
          success: false,
          message: "Request ID is required",
        });
      }

      await bloodRequestService.deleteRequest(requestId);
      return res.status(200).json({
        success: true,
        message: "Request deleted successfully",
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
