import z from "zod";

/**
 * Blood Inventory Item Schema
 * Tracks available blood units by type
 */
export const BloodInventorySchema = z.object({
  bloodType: z.string().min(1),
  unitsAvailable: z.number().min(0).default(0),
  lastUpdated: z.date().optional(),
});

export type BloodInventory = z.infer<typeof BloodInventorySchema>;

/**
 * Hospital Schema
 * Complete hospital profile with location and inventory
 */
export const HospitalSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phoneNumber: z.string().min(10),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string().default("Nepal"),
  }),
  location: z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }).optional(),
  bloodInventory: z.array(BloodInventorySchema).optional(),
  licenseNumber: z.string().optional(),
  imageUrl: z.string().optional(),
  isActive: z.boolean().default(true),
  userId: z.string().optional(), // Link to user who manages this hospital
});

export type HospitalType = z.infer<typeof HospitalSchema>;
