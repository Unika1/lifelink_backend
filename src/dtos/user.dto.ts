import z from "zod";
import { UserSchema } from "../types/user.types.js";

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
 * Update User DTO
 */
export const UpdateUserDTO = UserSchema.partial(); // all optional fields
export type UpdateUserDTO = z.infer<typeof UpdateUserDTO>;
