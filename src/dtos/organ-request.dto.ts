import z from "zod";
import { OrganRequestSchema } from "../types/organ-request.types";

const startOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const validateNoPastScheduleDate = (
  data: Partial<z.infer<typeof OrganRequestSchema>>,
  ctx: z.RefinementCtx
) => {
  const todayStart = startOfToday();

  if (data.scheduledAt && data.scheduledAt < todayStart) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Scheduled date cannot be in the past",
      path: ["scheduledAt"],
    });
  }
};

export const CreateOrganRequestDTO = OrganRequestSchema.pick({
  hospitalId: true,
  hospitalName: true,
  donorName: true,
  status: true,
  scheduledAt: true,
  requestedBy: true,
  reportUrl: true,
  notes: true,
}).superRefine(validateNoPastScheduleDate);

export type CreateOrganRequestDTO = z.infer<typeof CreateOrganRequestDTO>;

export const UpdateOrganRequestDTO = OrganRequestSchema.partial().superRefine(
  validateNoPastScheduleDate
);
export type UpdateOrganRequestDTO = z.infer<typeof UpdateOrganRequestDTO>;

export const SearchOrganRequestDTO = z.object({
  hospitalId: z.string().optional(),
  hospitalName: z.string().optional(),
  requestedBy: z.string().optional(),
  status: z.enum(["pending", "approved", "rejected", "fulfilled"]).optional(),
});

export type SearchOrganRequestDTO = z.infer<typeof SearchOrganRequestDTO>;
