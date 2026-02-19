import { Request, Response } from "express";
import mongoose from "mongoose";
import z from "zod";
import { UserService } from "../services/user.services.js";
import {
  ChangePasswordDTO,
  LoginDTO,
  RegisterDTO,
  UpdateUserDTO,
} from "../dtos/user.dto.js";

const userService = new UserService();

export class AuthController {
  async register(req: Request, res: Response) {
    console.log("REGISTER HIT");
    console.log("BODY:", req.body);
    try {
      const parsedData = RegisterDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      const userData = parsedData.data;
      const newUser = await userService.registerUser(userData);

      return res.status(201).json({
        success: true,
        message: "User Created",
        data: newUser,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const parsedData = LoginDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      const loginData = parsedData.data;
      const { token, existingUser } = await userService.loginUser(loginData);

      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: existingUser,
        token,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) {
        return res.status(400).json({ success: false, message: "User Id not found" });
      }

      const parsedData = UpdateUserDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      const dataToUpdate: any = { ...parsedData.data };

      if (req.file) {
        dataToUpdate.imageUrl = `/uploads/${req.file.filename}`;
      }

      const updatedUser = await userService.updateUser(userId, dataToUpdate);

      return res.status(200).json({
        success: true,
        message: "User profile updated successfully",
        data: updatedUser,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async updateUserById(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      if (!userId) {
        return res.status(400).json({ success: false, message: "User ID is required" });
      }

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ success: false, message: "Invalid user ID" });
      }

      const parsedData = UpdateUserDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      const dataToUpdate: any = { ...parsedData.data };

      if (req.file) {
        dataToUpdate.imageUrl = `/uploads/${req.file.filename}`;
      }

      const updatedUser = await userService.updateUser(userId, dataToUpdate);

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

  async sendResetPasswordEmail(req: Request, res: Response) {
    try {
      const { email } = req.body;
      
      await userService.sendResetPasswordEmail(email);
      
      return res.status(200).json({
        success: true,
        message: "If the email is registered, a reset link has been sent.",
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const token = req.params.token;
      const { newPassword } = req.body;

      await userService.resetPassword(token, newPassword);

      return res.status(200).json({
        success: true,
        message: "Password has been reset successfully.",
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async changePassword(req: Request, res: Response) {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) {
        return res.status(400).json({ success: false, message: "User Id not found" });
      }

      const parsedData = ChangePasswordDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      const { currentPassword, newPassword } = parsedData.data;
      await userService.changePassword(userId, currentPassword, newPassword);

      return res.status(200).json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
