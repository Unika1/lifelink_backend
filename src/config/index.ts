import dotenv from "dotenv";

dotenv.config();

// Application level constants with fallbacks
export const PORT: number =
  process.env.PORT ? parseInt(process.env.PORT) : 5000;

export const MONGODB_URI: string =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/lifelink";

export const JWT_SECRET: string =
  process.env.JWT_SECRET || "lifelink_secret";

export const CLIENT_URL: string =
  process.env.CLIENT_URL || "http://localhost:3000";
