import z from "zod";
import { UserSchema } from "../types/user.types";

/**
 * Register (Signup) DTO
 */
export const RegisterDTO = z
  .object({
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm your password"),
    role: z.enum(["donor", "hospital"]).default("donor"),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  );

export type RegisterDTO = z.infer<typeof RegisterDTO>;

/**
 * Login DTO
 */
export const LoginDTO = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type LoginDTO = z.infer<typeof LoginDTO>;

/**
 * Change Password DTO
 */
export const ChangePasswordDTO = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmNewPassword: z.string().min(6, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords do not match",
    path: ["confirmNewPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

export type ChangePasswordDTO = z.infer<typeof ChangePasswordDTO>;

/**
 * Update User DTO
 */
export const UpdateUserDTO = UserSchema.partial(); // all optional fields
export type UpdateUserDTO = z.infer<typeof UpdateUserDTO>;
