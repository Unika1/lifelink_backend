import { Request, Response } from "express";
import z from "zod";
import {
  CreateOrganRequestDTO,
  UpdateOrganRequestDTO,
  SearchOrganRequestDTO,
} from "../dtos/organ-request.dto";
import { OrganRequestService } from "../services/organ-request.service";

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
      const reportPath = `/uploads/${req.file.filename}`;
      console.log(`[OrganRequest] Creating request with file: ${req.file.originalname} -> ${reportPath}`);
      
      const payload: CreateOrganRequestDTO = {
        ...parsedData.data,
        requestedBy: parsedData.data.requestedBy ?? requesterId,
        reportUrl: reportPath,
      };

      console.log(`[OrganRequest] Payload before save:`, {
        hospitalName: payload.hospitalName,
        donorName: payload.donorName,
        reportUrl: payload.reportUrl,
      });

      const request = await organRequestService.createRequest(payload);
      
      console.log(`[OrganRequest] Created successfully with ID ${request._id}, reportUrl: ${request.reportUrl}`);
      
      return res.status(201).json({
        success: true,
        message: "Organ donation request created successfully",
        data: request,
      });
    } catch (error: any) {
      console.error(`[OrganRequest] Creation error:`, error);
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
        const reportPath = `/uploads/${req.file.filename}`;
        dataToUpdate.reportUrl = reportPath;
        console.log(`[OrganRequest] Updating request ${requestId} with file: ${req.file.originalname} -> ${reportPath}`);
      } else {
        console.log(`[OrganRequest] Updating request ${requestId} without file. Fields:`, Object.keys(dataToUpdate));
      }

      const updated = await organRequestService.updateRequest(
        requestId,
        dataToUpdate
      );
      
      console.log(`[OrganRequest] Updated successfully. New reportUrl: ${updated.reportUrl}`);
      
      return res.status(200).json({
        success: true,
        message: "Request updated successfully",
        data: updated,
      });
    } catch (error: any) {
      console.error(`[OrganRequest] Update error:`, error);
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
