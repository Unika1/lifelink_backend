import { UserRepository } from "../repositories/user.repository";
import bcryptjs from "bcryptjs";
import { HttpError } from "../errors/http-error";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import {
  JWT_SECRET,
  RESET_PASSWORD_APP_LINK,
  RESET_PASSWORD_URL,
} from "../config/index";
import { LoginDTO, RegisterDTO, UpdateUserDTO } from "../dtos/user.dto";
import { sendEmail } from "../config/email";

let userRepository = new UserRepository();

export class UserService {
  async registerUser(data: RegisterDTO) {
    const checkEmail = await userRepository.getUserByEmail(data.email);
    if (checkEmail) {
      throw new HttpError(403, "Email already in use");
    }

    const hashedPassword = await bcryptjs.hash(data.password, 10);
    const { confirmPassword, ...userData } = data;
    userData.password = hashedPassword;

    const newUser = await userRepository.createUser(userData);
    return newUser;
  }

  async loginUser(data: LoginDTO) {
    const existingUser = await userRepository.getUserByEmail(data.email);
    if (!existingUser) {
      throw new HttpError(404, "User not found");
    }

    const isPasswordValid = await bcryptjs.compare(data.password, existingUser.password);
    if (!isPasswordValid) {
      throw new HttpError(401, "Invalid credentials");
    }

    const payload = {
      id: existingUser._id,
      email: existingUser.email,
      role: existingUser.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
    return { token, existingUser };
  }

  async getUserById(userId: string) {
    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    return user;
  }

  async updateUser(userId: string, data: UpdateUserDTO) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new HttpError(400, "Invalid user ID");
    }

    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    if (data.email && user.email !== data.email) {
      const emailExists = await userRepository.getUserByEmail(data.email);
      if (emailExists) {
        throw new HttpError(403, "Email already in use");
      }
    }

    const updatedUser = await userRepository.updateUser(userId, data);
    return updatedUser;
  }

  async sendResetPasswordEmail(email?: string) {
    if (!email) {
      throw new HttpError(400, "Email is required");
    }
    const user = await userRepository.getUserByEmail(email);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
    const baseResetUrl = RESET_PASSWORD_URL.replace(/\/+$/, "");
    const resetLink = `${baseResetUrl}?token=${encodeURIComponent(token)}`;
    const appLinkBase = RESET_PASSWORD_APP_LINK.replace(/\/+$/, "");
    const appResetLink = `${appLinkBase}?token=${encodeURIComponent(token)}`;

    const html = `
      <p>Open in app: <a href="${appResetLink}">Reset Password in LifeLink app</a></p>
      <p>Open in browser: <a href="${resetLink}">Reset Password on Web</a></p>
      <p>If the link does not open your app or website, copy this token and paste it in the reset screen:</p>
      <p><b>${token}</b></p>
    `;

    await sendEmail(user.email, "Password Reset Request", html);
    return user;
  }

  async resetPassword(token?: string, newPassword?: string) {
    try {
      if (!token || !newPassword) {
        throw new HttpError(400, "Token and new password are required");
      }

      const decoded: any = jwt.verify(token, JWT_SECRET);
      const userId = decoded.id;

      const user = await userRepository.getUserById(userId);
      if (!user) {
        throw new HttpError(404, "User not found");
      }

      const hashedPassword = await bcryptjs.hash(newPassword, 10);
      await userRepository.updateUser(userId, { password: hashedPassword });

      return user;
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        throw new HttpError(400, "Reset token has expired");
      }
      if (error.name === "JsonWebTokenError") {
        throw new HttpError(400, "Invalid reset token");
      }
      throw error;
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    const isCurrentPasswordValid = await bcryptjs.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new HttpError(401, "Current password is incorrect");
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    await userRepository.updateUser(userId, { password: hashedPassword });
  }
}