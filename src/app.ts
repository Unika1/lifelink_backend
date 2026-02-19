import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import path from "path";
import cors from "cors";

import { connectDatabase } from "./database/mongodb.js";
import { PORT } from "./config/index.js";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin/admin.routes.js";
import hospitalRoutes from "./routes/hospital.route.js";
import eligibilityRoutes from "./routes/eligibility.route.js";
import bloodRequestRoutes from "./routes/blood-request.route.js";
import organRequestRoutes from "./routes/organ-request.route.js";

const app: Application = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Resolve uploads path consistently across test/runtime environments
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/eligibility", eligibilityRoutes);
app.use("/api/requests", bloodRequestRoutes);
app.use("/api/organ-requests", organRequestRoutes);

app.get("/", (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "Welcome to the LifeLink API",
  });
});
export default app;