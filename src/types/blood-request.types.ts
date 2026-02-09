import z from "zod";

export const BloodRequestSchema = z.object({
  hospitalId: z.string().min(1).optional(),
  hospitalName: z.string().min(1),
  patientName: z.string().min(2),
  bloodType: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]),
  unitsRequested: z.number().min(1),
  status: z.enum(["pending", "approved", "rejected", "fulfilled"]).default("pending"),
  requestedBy: z.string().optional(),
  contactPhone: z.string().optional(),
  neededBy: z.date().optional(),
  scheduledAt: z.date().optional(),
  notes: z.string().optional(),
});

export type BloodRequestType = z.infer<typeof BloodRequestSchema>;
