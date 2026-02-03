import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { authorizedMiddleware } from "../middlewares/auth.middleware.js";
import { uploads } from "../middlewares/upload.middleware.js";

const router = Router();
const controller = new AuthController();

// Public routes
router.post("/register", controller.register.bind(controller));
router.post("/login", controller.login.bind(controller));

// Protected routes
router.put(
  "/update-profile",
  authorizedMiddleware,
  uploads.single("image"),
  controller.updateProfile.bind(controller)
);

// PUT /api/auth/:id - Update user by id with optional image upload
router.put(
  "/:id",
  authorizedMiddleware,
  uploads.single("image"),
  controller.updateUserById.bind(controller)
);

export default router;
