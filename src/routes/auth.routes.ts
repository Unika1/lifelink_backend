import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { authorizedMiddleware } from "../middlewares/auth.middleware.js";
import { uploads } from "../middlewares/upload.middleware.js";

const router = Router();
const controller = new AuthController();

// Public routes
router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/request-password-reset", controller.sendResetPasswordEmail);
router.post("/reset-password/:token", controller.resetPassword);

// Protected routes
router.put(
  "/change-password",
  authorizedMiddleware,
  controller.changePassword
);

router.put(
  "/update-profile",
  authorizedMiddleware,
  uploads.single("image"),
  controller.updateProfile
);

// PUT /api/auth/:id - Update user by id with optional image upload
router.put(
  "/user/:id",
  authorizedMiddleware,
  uploads.single("image"),
  controller.updateUserById
);

// Backward compatible route (validated in controller/service)
router.put(
  "/:id",
  authorizedMiddleware,
  uploads.single("image"),
  controller.updateUserById
);

export default router;
