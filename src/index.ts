import express, { Application } from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { PORT } from "./config/index.js";
import { connectDatabase } from "./database/mongodb.js";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();

const app: Application = express();

app.use(bodyParser.json());
app.use("/api/auth", authRoutes);

async function start() {
  await connectDatabase();
  app.listen(PORT, () => console.log(`Server: http://localhost:${PORT}`));
}

start().catch((error) => console.log(error));
