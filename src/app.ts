import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import path from "path";
import cors from "cors";

import { connectDatabase } from "./database/mongodb";
import { PORT } from "./config/index";
import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/admin/admin.routes";
import hospitalRoutes from "./routes/hospital.route";
import eligibilityRoutes from "./routes/eligibility.route";
import bloodRequestRoutes from "./routes/blood-request.route";
import organRequestRoutes from "./routes/organ-request.route";

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