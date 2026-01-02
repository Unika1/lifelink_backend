import { Request, Response } from "express";
import z from "zod";
import { AuthService } from "../services/auth.services.js";
import { RegisterDTO, LoginDTO } from "../dtos/auth.dto.js";

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const parsed = RegisterDTO.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) });
      }

      const user = await authService.register(parsed.data);
      return res.status(201).json({ success: true, message: "User Created", data: user });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({ success: false, message: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const parsed = LoginDTO.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) });
      }

      const result = await authService.login(parsed.data);
      return res.status(200).json({ success: true, message: "Login successful", token: result.token, data: result.user });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({ success: false, message: error.message });
    }
  }
}
