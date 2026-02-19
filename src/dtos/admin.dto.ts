import z from "zod";
import { UserSchema } from "../types/user.types.js";

/**
 * Create User by Admin DTO - For admin to create users
 */
export const AdminCreateUserDTO = z
  .object({
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm your password"),
    role: z.enum(["donor", "hospital", "admin"]).default("donor"),
    phoneNumber: z.string().optional(),
    bloodGroup: z.enum(["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"]).optional(),
    imageUrl: z.string().optional(),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  );

export type AdminCreateUserDTO = z.infer<typeof AdminCreateUserDTO>;

/**
 * Update User by Admin DTO - For admin to update users
 */
export const AdminUpdateUserDTO = z
  .object({
    firstName: z.string().min(2, "First name is required").optional(),
    lastName: z.string().min(2, "Last name is required").optional(),
    email: z.string().email("Please enter a valid email").optional(),
    role: z.enum(["donor", "hospital", "admin"]).optional(),
    imageUrl: z.string().optional(),
  })
  .strict();

export type AdminUpdateUserDTO = z.infer<typeof AdminUpdateUserDTO>;
