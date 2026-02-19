import z from "zod";

export const OrganRequestSchema = z.object({
  hospitalId: z.string().min(1).optional(),
  hospitalName: z.string().min(1),
  donorName: z.string().min(2),
  status: z.enum(["pending", "approved", "rejected", "fulfilled"]).default("pending"),
  scheduledAt: z.coerce.date().optional(),
  requestedBy: z.string().optional(),
  reportUrl: z.string().optional(),
  notes: z.string().optional(),
});

export type OrganRequestType = z.infer<typeof OrganRequestSchema>;
