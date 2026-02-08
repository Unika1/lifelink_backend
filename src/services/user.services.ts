import { UserRepository } from "../repositories/user.repository.js";
import bcryptjs from "bcryptjs";
import { HttpError } from "../errors/http-error.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET, CLIENT_URL } from "../config/index.js";
import { LoginDTO, RegisterDTO, UpdateUserDTO } from "../dtos/user.dto.js";
import { sendEmail } from "../config/email.js";

let userRepository = new UserRepository();

export class UserService {
  async registerUser(data: RegisterDTO) {
    // Business logic, check duplicate email, hash password
    const checkEmail = await userRepository.getUserByEmail(data.email);
    if (checkEmail) {
      throw new HttpError(403, "Email already in use");
    }

    // Hash/encrypt password, to not store plain text password - security risk
    const hashedPassword = await bcryptjs.hash(data.password, 10); // 10 - complexity
    
    // Remove confirmPassword and add hashed password
    const { confirmPassword, ...userData } = data;
    userData.password = hashedPassword; // Update the password with hashed one
    
    const newUser = await userRepository.createUser(userData);

    return newUser;
  }

  async loginUser(data: LoginDTO) {
    const existingUser = await userRepository.getUserByEmail(data.email);
    if (!existingUser) {
      throw new HttpError(404, "User not found");
    }

    const isPasswordValid = await bcryptjs.compare(data.password, existingUser.password); // Compare plain text with hashed
    if (!isPasswordValid) {
      throw new HttpError(401, "Invalid credentials");
    }

    // Generate JWT
    const payload = {
      id: existingUser._id,
      email: existingUser.email,
      role: existingUser.role,
    }; // What to include in token

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" }); // 30 days expiry

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
    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    // Check if email is being updated and if it's already in use
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

    // Generate JWT token with 1 hour expiry
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
    const resetLink = `${CLIENT_URL}/reset-password?token=${token}`;
    
    // Create HTML email
    const html = `<p>Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 1 hour.</p>`;
    
    await sendEmail(user.email, "Password Reset Request", html);
    return user;
  }

  async resetPassword(token?: string, newPassword?: string) {
    try {
      if (!token || !newPassword) {
        throw new HttpError(400, "Token and new password are required");
      }

      // Verify JWT token
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const userId = decoded.id;

      const user = await userRepository.getUserById(userId);
      if (!user) {
        throw new HttpError(404, "User not found");
      }

      // Hash new password
      const hashedPassword = await bcryptjs.hash(newPassword, 10);
      
      // Update password in DB
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
}
