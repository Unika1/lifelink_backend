import { UserRepository } from "../../repositories/user.repository.js";
import bcryptjs from "bcryptjs";
import { HttpError } from "../../errors/http-error.js";
import { AdminCreateUserDTO, AdminUpdateUserDTO } from "../../dtos/admin.dto.js";

let userRepository = new UserRepository();

export class AdminUserService {
  async createUser(data: AdminCreateUserDTO) {
    // Check email uniqueness
    const emailCheck = await userRepository.getUserByEmail(data.email);
    if (emailCheck) {
      throw new HttpError(403, "Email already in use");
    }

    // Hash password and persist only User model fields
    const hashedPassword = await bcryptjs.hash(data.password, 10);
    const createPayload = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: hashedPassword,
      role: data.role,
      phoneNumber: data.phoneNumber,
      bloodGroup: data.bloodGroup,
      imageUrl: data.imageUrl,
    };

    const newUser = await userRepository.createUser(createPayload as any);
    return newUser;
  }

  async getAllUsers() {
    const users = await userRepository.getAllUsers();
    return users;
  }

  async getAllUsersWithPagination(page?: string, limit?: string, role?: string) {
    const currentPage = page ? parseInt(page) : 1;
    const currentLimit = limit ? parseInt(limit) : 10;

    // Validate pagination params
    if (currentPage < 1) {
      throw new HttpError(400, "Page must be greater than 0");
    }
    if (currentLimit < 1) {
      throw new HttpError(400, "Limit must be greater than 0");
    }

    const { users, totalUsers } = await userRepository.getAllUsersWithPagination(
      currentPage,
      currentLimit,
      role
    );
    
    const pagination = {
      page: currentPage,
      limit: currentLimit,
      total: totalUsers,
      totalPages: Math.ceil(totalUsers / currentLimit),
    };

    return { users, pagination };
  }

  async getUsersByRole(role: string) {
    return await userRepository.getUsersByRole(role);
  }

  async getUserById(id: string) {
    const user = await userRepository.getUserById(id);
    if (!user) {
      throw new HttpError(404, "User not found");
    }
    return user;
  }

  async updateUser(id: string, updateData: AdminUpdateUserDTO) {
    const user = await userRepository.getUserById(id);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    // Check email uniqueness if email is being updated
    if (updateData.email && user.email !== updateData.email) {
      const emailCheck = await userRepository.getUserByEmail(updateData.email);
      if (emailCheck) {
        throw new HttpError(403, "Email already in use");
      }
    }

    const updatedUser = await userRepository.updateUser(id, updateData);
    return updatedUser;
  }

  async deleteUser(id: string) {
    const user = await userRepository.getUserById(id);
    if (!user) {
      throw new HttpError(404, "User not found");
    }
    const deleted = await userRepository.deleteUser(id);
    return deleted;
  }
}
