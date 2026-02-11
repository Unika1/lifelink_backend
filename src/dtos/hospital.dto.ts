import z from "zod";
import { HospitalSchema, BloodInventorySchema } from "../types/hospital.types.js";

/**
 * Create Hospital DTO
 * Used when creating a new hospital
 */
export const CreateHospitalDTO = HospitalSchema.pick({
  name: true,
  email: true,
  phoneNumber: true,
  address: true,
  location: true,
  licenseNumber: true,
  imageUrl: true,
  userId: true,
}).extend({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type CreateHospitalDTO = z.infer<typeof CreateHospitalDTO>;

/**
 * Update Hospital DTO
 * All fields optional for partial updates
 */
export const UpdateHospitalDTO = HospitalSchema.partial();

export type UpdateHospitalDTO = z.infer<typeof UpdateHospitalDTO>;

/**
 * Update Blood Inventory DTO
 * For updating specific blood type units
 */
export const UpdateBloodInventoryDTO = z.object({
  bloodType: z.string().min(1),
  unitsAvailable: z.number().min(0),
});

export type UpdateBloodInventoryDTO = z.infer<typeof UpdateBloodInventoryDTO>;

/**
 * Create Blood Inventory DTO
 * For adding a new blood type entry
 */
export const CreateBloodInventoryDTO = z.object({
  bloodType: z.string().min(1),
  unitsAvailable: z.number().min(0).default(0),
});

export type CreateBloodInventoryDTO = z.infer<typeof CreateBloodInventoryDTO>;

/**
 * Delete Blood Inventory DTO
 * For removing a blood type entry
 */
export const DeleteBloodInventoryDTO = z.object({
  bloodType: z.string().min(1),
});

export type DeleteBloodInventoryDTO = z.infer<typeof DeleteBloodInventoryDTO>;

/**
 * Search Hospital DTO
 * For filtering hospitals by location, blood type availability
 */
export const SearchHospitalDTO = z.object({
  city: z.string().optional(),
  state: z.string().optional(),
  bloodType: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type SearchHospitalDTO = z.infer<typeof SearchHospitalDTO>;
