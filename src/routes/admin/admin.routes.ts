import { Router } from "express";
import { AdminController } from "../../controllers/admin/admin.controller";
import { authorizedMiddleware } from "../../middlewares/auth.middleware";
import { adminMiddleware } from "../../middlewares/admin.middleware";
import { uploads } from "../../middlewares/upload.middleware";

const router = Router();
const controller = new AdminController();

/**
 * All admin routes are protected by authorizedMiddleware and adminMiddleware
 */

// POST /api/admin/users - Create user with image upload
router.post(
  "/users",
  authorizedMiddleware,
  adminMiddleware,
  uploads.single("image"),
  controller.createUser
);

// GET /api/admin/users - Get all users
router.get(
  "/users",
  authorizedMiddleware,
  adminMiddleware,
  controller.getAllUsers
);

// GET /api/admin/users/:id - Get user by id
router.get(
  "/users/:id",
  authorizedMiddleware,
  adminMiddleware,
  controller.getUserById
);

// PUT /api/admin/users/:id - Update user with optional image upload
router.put(
  "/users/:id",
  authorizedMiddleware,
  adminMiddleware,
  uploads.single("image"),
  controller.updateUser
);

// DELETE /api/admin/users/:id - Delete user
router.delete(
  "/users/:id",
  authorizedMiddleware,
  adminMiddleware,
  controller.deleteUser
);

export default router;
