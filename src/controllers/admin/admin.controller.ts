import { Request, Response, NextFunction } from "express";
import z from "zod";
import { AdminUserService } from "../../services/admin/admin.service.js";
import { AdminCreateUserDTO, AdminUpdateUserDTO } from "../../dtos/admin.dto.js";

let adminUserService = new AdminUserService();

export class AdminController {
  /**
   * POST /api/admin/users - Create user with image upload
   */
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = AdminCreateUserDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      if (req.file) {
        parsedData.data.imageUrl = `/uploads/${req.file.filename}`;
      }

      const userData: AdminCreateUserDTO = parsedData.data;
      const newUser = await adminUserService.createUser(userData);

      return res.status(201).json({
        success: true,
        message: "User created successfully",
        data: newUser,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  /**
   * GET /api/admin/users - Get all users
   */
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await adminUserService.getAllUsers();

      return res.status(200).json({
        success: true,
        data: users,
        message: "Users retrieved successfully",
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  /**
   * GET /api/admin/users/:id - Get user by id
   */
  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id;
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required",
        });
      }

      const user = await adminUserService.getUserById(userId);

      return res.status(200).json({
        success: true,
        data: user,
        message: "User retrieved successfully",
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  /**
   * PUT /api/admin/users/:id - Update user with optional image upload
   */
  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id;
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required",
        });
      }

      const parsedData = AdminUpdateUserDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      if (req.file) {
        parsedData.data.imageUrl = `/uploads/${req.file.filename}`;
      }

      const updateData: AdminUpdateUserDTO = parsedData.data;
      const updatedUser = await adminUserService.updateUser(userId, updateData);

      return res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: updatedUser,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  /**
   * DELETE /api/admin/users/:id - Delete user
   */
  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id;
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required",
        });
      }

      const deleted = await adminUserService.deleteUser(userId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
