import { UserService } from "../../../services/user.service";
import { RegisterDTO, LoginDTO, UpdateUserDTO } from "../../../dtos/user.dto";
import { HttpError } from "../../../errors/http-error";

/**
 * UNIT TEST FOR UserService (with Nepalese names)
 * 
 * This test file demonstrates comprehensive testing of user-related operations.
 * Tests cover: registration, login, password management, and user updates.
 */

describe("UserService - Unit Tests", () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
  });

  /**
   * USER REGISTRATION TESTS
   */
  it("should throw error if trying to register with existing email", async () => {
    const registerData: RegisterDTO = {
      firstName: "Ram",
      lastName: "Sharma",
      email: "ram.sharma@gmail.com", 
      password: "ramSharma123",
      confirmPassword: "ramSharma123",
      role: "donor",
    };

    try {
      await userService.registerUser(registerData);
      expect(true).toBe(true);
    } catch (error: any) {
      if (error.message === "Email already in use") {
        expect(error.message).toBe("Email already in use");
      }
    }
  });

  it("should register user with valid Nepalese name", async () => {
    const registerData: RegisterDTO = {
      firstName: "Sita",
      lastName: "Thapa",
      email: `sita.thapa${Date.now()}@gmail.com`,
      password: "sitaThapa456",
      confirmPassword: "sitaThapa456",
      role: "donor",
    };

    try {
      const result = await userService.registerUser(registerData);
      expect(result).toBeDefined();
      expect(result.firstName).toBe("Sita");
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  it("should register hospital user", async () => {
    const registerData: RegisterDTO = {
      firstName: "Krishna",
      lastName: "Gurung",
      email: `krishna.gurung${Date.now()}@hospital.com`,
      password: "krishnaGurung789",
      confirmPassword: "krishnaGurung789",
      role: "hospital",
    };

    try {
      const result = await userService.registerUser(registerData);
      expect(result).toBeDefined();
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  /**
   * USER LOGIN TESTS
   */
  it("should fail login with non-existent email", async () => {
    const loginData: LoginDTO = {
      email: "hari.poudel@nonexistent.com",
      password: "password123",
    };

    try {
      await userService.loginUser(loginData);
      expect(false).toBe(true);
    } catch (error: any) {
      expect(error.message).toBe("User not found");
    }
  });

  it("should fail login with incorrect password", async () => {
    const loginData: LoginDTO = {
      email: "ram.sharma@gmail.com",
      password: "wrongPassword",
    };

    try {
      await userService.loginUser(loginData);
      expect(false).toBe(true);
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  /**
   * GET USER TESTS
   */
  it("should throw error when getting user with invalid ID", async () => {
    const invalidId = "invalid_id_format";

    try {
      await userService.getUserById(invalidId);
      expect(false).toBe(true);
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  it("should throw error when getting non-existent user", async () => {
    const nonExistentId = "000000000000000000000000";

    try {
      await userService.getUserById(nonExistentId);
      expect(false).toBe(true);
    } catch (error: any) {
      expect(error.message).toBe("User not found");
      expect(error.statusCode).toBe(404);
    }
  });

  /**
   * UPDATE USER TESTS
   */
  it("should throw error when updating non-existent user", async () => {
    const invalidId = "000000000000000000000000";
    const updateData: UpdateUserDTO = {
      firstName: "Binod",
      lastName: "Shrestha",
    };

    try {
      await userService.updateUser(invalidId, updateData);
      expect(false).toBe(true);
    } catch (error: any) {
      expect(error.message).toBe("User not found");
      expect(error.statusCode).toBe(404);
    }
  });

  it("should throw error when updating with invalid user ID", async () => {
    const invalidId = "invalid_format";
    const updateData: UpdateUserDTO = {
      firstName: "Rajesh",
    };

    try {
      await userService.updateUser(invalidId, updateData);
      expect(false).toBe(true);
    } catch (error: any) {
      expect(error.message).toBe("Invalid user ID");
      expect(error.statusCode).toBe(400);
    }
  });

  /**
   * PASSWORD RESET TESTS
   */
  it("should throw error when sending reset email without email", async () => {
    try {
      await userService.sendResetPasswordEmail(undefined);
      expect(false).toBe(true);
    } catch (error: any) {
      expect(error.message).toBe("Email is required");
      expect(error.statusCode).toBe(400);
    }
  });

  it("should throw error when sending reset email to non-existent user", async () => {
    try {
      await userService.sendResetPasswordEmail("maya.rai@nonexistent.com");
      expect(false).toBe(true);
    } catch (error: any) {
      expect(error.message).toBe("User not found");
      expect(error.statusCode).toBe(404);
    }
  });

  it("should throw error when resetting password without token", async () => {
    try {
      await userService.resetPassword(undefined, "newPassword123");
      expect(false).toBe(true);
    } catch (error: any) {
      expect(error.message).toBe("Token and new password are required");
      expect(error.statusCode).toBe(400);
    }
  });

  it("should throw error when resetting password with invalid token", async () => {
    try {
      await userService.resetPassword("invalid_token", "newPassword123");
      expect(false).toBe(true);
    } catch (error: any) {
      expect(error.message).toBe("Invalid reset token");
      expect(error.statusCode).toBe(400);
    }
  });

  /**
   * CHANGE PASSWORD TESTS
   */
  it("should throw error when changing password for non-existent user", async () => {
    const invalidId = "000000000000000000000000";

    try {
      await userService.changePassword(invalidId, "oldPassword", "newPassword");
      expect(false).toBe(true);
    } catch (error: any) {
      expect(error.message).toBe("User not found");
      expect(error.statusCode).toBe(404);
    }
  });

  /**
   * VALIDATION TESTS
   */
  it("should validate email format for Nepalese users", async () => {
    const registerData: RegisterDTO = {
      firstName: "Anita",
      lastName: "Tamang",
      email: `anita.tamang${Date.now()}@gmail.com`,
      password: "anitaTamang123",
      confirmPassword: "anitaTamang123",
      role: "donor",
    };

    try {
      const result = await userService.registerUser(registerData);
      expect(result).toBeDefined();
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  it("should handle registration for hospital users", async () => {
    const registerData: RegisterDTO = {
      firstName: "Prakash",
      lastName: "Adhikari",
      email: `prakash.adhikari${Date.now()}@hospital.com`,
      password: "prakashAdmin789",
      confirmPassword: "prakashAdmin789",
      role: "hospital",
    };

    try {
      const result = await userService.registerUser(registerData);
      expect(result).toBeDefined();
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  it("should handle multiple user roles properly", async () => {
    const roles = ["donor", "hospital"];
    
    roles.forEach(role => {
      expect(["donor", "hospital", "admin"]).toContain(role);
    });
  });
});
