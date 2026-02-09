import z from "zod";
import { BloodRequestSchema } from "../types/blood-request.types.js";

export const CreateBloodRequestDTO = BloodRequestSchema.pick({
  hospitalName: true,
  patientName: true,
  bloodType: true,
  unitsRequested: true,
  status: true,
  requestedBy: true,
  contactPhone: true,
  neededBy: true,
  notes: true,
});

export type CreateBloodRequestDTO = z.infer<typeof CreateBloodRequestDTO>;

export const UpdateBloodRequestDTO = BloodRequestSchema.partial();

export type UpdateBloodRequestDTO = z.infer<typeof UpdateBloodRequestDTO>;

export const SearchBloodRequestDTO = z.object({
  hospitalId: z.string().optional(),
  hospitalName: z.string().optional(),
  requestedBy: z.string().optional(),
  status: z.enum(["pending", "approved", "rejected", "fulfilled"]).optional(),
});

export type SearchBloodRequestDTO = z.infer<typeof SearchBloodRequestDTO>;
