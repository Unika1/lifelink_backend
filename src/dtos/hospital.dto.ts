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
  bloodType: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]),
  unitsAvailable: z.number().min(0),
});

export type UpdateBloodInventoryDTO = z.infer<typeof UpdateBloodInventoryDTO>;

/**
 * Search Hospital DTO
 * For filtering hospitals by location, blood type availability
 */
export const SearchHospitalDTO = z.object({
  city: z.string().optional(),
  state: z.string().optional(),
  bloodType: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]).optional(),
  isActive: z.boolean().optional(),
});

export type SearchHospitalDTO = z.infer<typeof SearchHospitalDTO>;
