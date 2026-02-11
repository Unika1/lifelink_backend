import z from "zod";

export const UserSchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.email(),
    password: z.string().min(6),
    imageUrl: z.string().optional(),
    phoneNumber: z.string().optional(),
    bloodGroup: z.enum(["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"]).optional(),
    role: z.enum(["donor", "hospital", "admin"]).default("donor"),
});

export type UserType = z.infer<typeof UserSchema>;