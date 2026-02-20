import mongoose from "mongoose";
import { MONGODB_URI } from "../config/index";

export const connectDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed", error);
    process.exit(1);
  }
};
