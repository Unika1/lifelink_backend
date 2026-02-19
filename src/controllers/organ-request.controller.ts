import { Request, Response } from "express";
import z from "zod";
import {
  CreateOrganRequestDTO,
  UpdateOrganRequestDTO,
  SearchOrganRequestDTO,
} from "../dtos/organ-request.dto.js";
import { OrganRequestService } from "../services/organ-request.service.js";

const organRequestService = new OrganRequestService();

export class OrganRequestController {
  async createRequest(req: Request, res: Response) {
    try {
      const parsedData = CreateOrganRequestDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Health report file is required",
        });
      }

      const requesterId = req.user?._id?.toString();
      const payload: CreateOrganRequestDTO = {
        ...parsedData.data,
        requestedBy: parsedData.data.requestedBy ?? requesterId,
        reportUrl: `/uploads/${req.file.filename}`,
      };

      const request = await organRequestService.createRequest(payload);
      return res.status(201).json({
        success: true,
        message: "Organ donation request created successfully",
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
      const parsedQuery = SearchOrganRequestDTO.safeParse(req.query);
      const criteria = parsedQuery.success ? parsedQuery.data : undefined;

      const requests = await organRequestService.getAllRequests(criteria);
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
      if (!requestId) {
        return res.status(400).json({
          success: false,
          message: "Request ID is required",
        });
      }

      const request = await organRequestService.getRequestById(requestId);
      return res.status(200).json({
        success: true,
        message: "Request retrieved successfully",
        data: request,
      });
    } catch (error: any) {
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

      const parsedData = UpdateOrganRequestDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      const dataToUpdate: UpdateOrganRequestDTO = { ...parsedData.data };
      if (req.file) {
        dataToUpdate.reportUrl = `/uploads/${req.file.filename}`;
      }

      const updated = await organRequestService.updateRequest(
        requestId,
        dataToUpdate
      );
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

      await organRequestService.deleteRequest(requestId);
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
