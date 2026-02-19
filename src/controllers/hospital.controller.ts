import { Request, Response } from "express";
import z from "zod";
import { HospitalService } from "../services/hospital.service.js";
import {
  CreateHospitalDTO,
  UpdateHospitalDTO,
  UpdateBloodInventoryDTO,
  CreateBloodInventoryDTO,
  DeleteBloodInventoryDTO,
  SearchHospitalDTO,
} from "../dtos/hospital.dto.js";

const hospitalService = new HospitalService();

/**
 * Hospital Controller - API Handler Layer
 * Handles HTTP requests for hospital operations
 */
export class HospitalController {
  /**
   * POST /api/hospitals
   * Create a new hospital
   */
  async createHospital(req: Request, res: Response) {
    try {
      const parsedData = CreateHospitalDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      // Add image URL if file was uploaded
      if (req.file) {
        parsedData.data.imageUrl = `/uploads/${req.file.filename}`;
      }

      const newHospital = await hospitalService.createHospital(parsedData.data);

      return res.status(201).json({
        success: true,
        message: "Hospital created successfully",
        data: newHospital,
      });
    } catch (error: any) {
      if (error?.name === "ValidationError") {
        return res.status(400).json({
          success: false,
          message: error.message || "Validation failed",
        });
      }

      if (error?.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "Email already in use",
        });
      }

      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  /**
   * GET /api/hospitals
   * Get all hospitals or search with criteria
   */
  async getAllHospitals(req: Request, res: Response) {
    try {
      // Check if search criteria provided
      const searchCriteria = SearchHospitalDTO.safeParse(req.query);

      let hospitals;
      if (searchCriteria.success && Object.keys(req.query).length > 0) {
        // Search with criteria
        hospitals = await hospitalService.searchHospitals(searchCriteria.data);
      } else {
        // Get all hospitals
        hospitals = await hospitalService.getAllHospitals();
      }

      return res.status(200).json({
        success: true,
        data: hospitals,
        message: "Hospitals retrieved successfully",
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  /**
   * GET /api/hospitals/:id
   * Get hospital by ID
   */
  async getHospitalById(req: Request, res: Response) {
    try {
      const hospitalId = req.params.id;
      if (!hospitalId) {
        return res.status(400).json({
          success: false,
          message: "Hospital ID is required",
        });
      }

      const hospital = await hospitalService.getHospitalById(hospitalId);

      return res.status(200).json({
        success: true,
        data: hospital,
        message: "Hospital retrieved successfully",
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  /**
   * PUT /api/hospitals/:id
   * Update hospital information
   */
  async updateHospital(req: Request, res: Response) {
    try {
      const hospitalId = req.params.id;
      if (!hospitalId) {
        return res.status(400).json({
          success: false,
          message: "Hospital ID is required",
        });
      }

      const parsedData = UpdateHospitalDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      // Add image URL if file was uploaded
      if (req.file) {
        parsedData.data.imageUrl = `/uploads/${req.file.filename}`;
      }

      const updatedHospital = await hospitalService.updateHospital(
        hospitalId,
        parsedData.data
      );

      return res.status(200).json({
        success: true,
        message: "Hospital updated successfully",
        data: updatedHospital,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  /**
   * DELETE /api/hospitals/:id
   * Delete hospital
   */
  async deleteHospital(req: Request, res: Response) {
    try {
      const hospitalId = req.params.id;
      if (!hospitalId) {
        return res.status(400).json({
          success: false,
          message: "Hospital ID is required",
        });
      }

      await hospitalService.deleteHospital(hospitalId);

      return res.status(200).json({
        success: true,
        message: "Hospital deleted successfully",
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  /**
   * POST /api/hospitals/:id/inventory
   * Add a new blood type to inventory
   */
  async addBloodInventory(req: Request, res: Response) {
    try {
      const hospitalId = req.params.id;
      if (!hospitalId) {
        return res.status(400).json({
          success: false,
          message: "Hospital ID is required",
        });
      }

      const parsedData = CreateBloodInventoryDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      const updatedHospital = await hospitalService.addBloodInventory(
        hospitalId,
        parsedData.data
      );

      return res.status(201).json({
        success: true,
        message: "Blood type added successfully",
        data: updatedHospital,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  /**
   * PUT /api/hospitals/:id/inventory
   * Update blood inventory for hospital
   */
  async updateBloodInventory(req: Request, res: Response) {
    try {
      const hospitalId = req.params.id;
      if (!hospitalId) {
        return res.status(400).json({
          success: false,
          message: "Hospital ID is required",
        });
      }

      const parsedData = UpdateBloodInventoryDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      const updatedHospital = await hospitalService.updateBloodInventory(
        hospitalId,
        parsedData.data
      );

      return res.status(200).json({
        success: true,
        message: "Blood inventory updated successfully",
        data: updatedHospital,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  /**
   * DELETE /api/hospitals/:id/inventory/:bloodType
   * Remove a blood type from inventory
   */
  async deleteBloodInventory(req: Request, res: Response) {
    try {
      const hospitalId = req.params.id;
      const bloodType = req.params.bloodType;

      if (!hospitalId || !bloodType) {
        return res.status(400).json({
          success: false,
          message: "Hospital ID and blood type are required",
        });
      }

      const parsedData = DeleteBloodInventoryDTO.safeParse({ bloodType });
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      const updatedHospital = await hospitalService.deleteBloodInventory(
        hospitalId,
        parsedData.data
      );

      return res.status(200).json({
        success: true,
        message: "Blood type removed successfully",
        data: updatedHospital,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  /**
   * GET /api/hospitals/:id/inventory
   * Get blood inventory for hospital
   */
  async getBloodInventory(req: Request, res: Response) {
    try {
      const hospitalId = req.params.id;
      if (!hospitalId) {
        return res.status(400).json({
          success: false,
          message: "Hospital ID is required",
        });
      }

      const inventory = await hospitalService.getBloodInventory(hospitalId);

      return res.status(200).json({
        success: true,
        data: inventory,
        message: "Blood inventory retrieved successfully",
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  /**
   * GET /api/hospitals/donors
   * Get all donors
   */
  async getAllDonors(req: Request, res: Response) {
    try {
      const donors = await hospitalService.getAllDonors();
      return res.status(200).json({
        success: true,
        data: donors,
        message: "Donors retrieved successfully",
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
