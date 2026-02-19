import z from "zod";
import { BloodRequestSchema } from "../types/blood-request.types.js";

const startOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const validateNoPastDate = (
  data: { neededBy?: Date; scheduledAt?: Date },
  ctx: z.RefinementCtx
) => {
  const todayStart = startOfToday();

  if (data.neededBy && data.neededBy < todayStart) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Needed date cannot be in the past",
      path: ["neededBy"],
    });
  }

  if (data.scheduledAt && data.scheduledAt < todayStart) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Scheduled date cannot be in the past",
      path: ["scheduledAt"],
    });
  }
};

export const CreateBloodRequestDTO = BloodRequestSchema.pick({
  hospitalId: true,
  hospitalName: true,
  patientName: true,
  bloodType: true,
  unitsRequested: true,
  status: true,
  requestedBy: true,
  contactPhone: true,
  neededBy: true,
  notes: true,
}).superRefine(validateNoPastDate);

export type CreateBloodRequestDTO = z.infer<typeof CreateBloodRequestDTO>;

export const UpdateBloodRequestDTO = BloodRequestSchema.partial().superRefine(
  validateNoPastDate
);

export type UpdateBloodRequestDTO = z.infer<typeof UpdateBloodRequestDTO>;

export const SearchBloodRequestDTO = z.object({
  hospitalId: z.string().optional(),
  hospitalName: z.string().optional(),
  requestedBy: z.string().optional(),
  status: z.enum(["pending", "approved", "rejected", "fulfilled"]).optional(),
});

export type SearchBloodRequestDTO = z.infer<typeof SearchBloodRequestDTO>;
