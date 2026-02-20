import { Router } from "express";
import { HospitalController } from "../controllers/hospital.controller";
import { authorizedMiddleware } from "../middlewares/auth.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware";
import { uploads } from "../middlewares/upload.middleware";

const router = Router();
const hospitalController = new HospitalController();

/**
 * Public Routes - Anyone can view hospitals
 */

// GET /api/hospitals - Get all hospitals or search
router.get("/", hospitalController.getAllHospitals);

// GET /api/hospitals/donors - Get all donors (hospital/admin) - MUST come before /:id route
router.get(
  "/donors",
  authorizedMiddleware,
  hospitalController.getAllDonors
);

// GET /api/hospitals/:id - Get hospital by ID
router.get("/:id", hospitalController.getHospitalById);

// GET /api/hospitals/:id/inventory - Get blood inventory
router.get(
  "/:id/inventory",
  hospitalController.getBloodInventory
);

// POST /api/hospitals/:id/inventory - Add blood type to inventory
router.post(
  "/:id/inventory",
  authorizedMiddleware,
  hospitalController.addBloodInventory
);

/**
 * Protected Routes - Only admins or hospital staff
 */

// POST /api/hospitals - Create hospital (Admin only)
router.post(
  "/",
  authorizedMiddleware,
  adminMiddleware,
  uploads.single("image"),
  hospitalController.createHospital
);

// PUT /api/hospitals/:id - Update hospital (Admin or Hospital staff)
router.put(
  "/:id",
  authorizedMiddleware,
  uploads.single("image"),
  hospitalController.updateHospital
);

// DELETE /api/hospitals/:id - Delete hospital (Admin only)
router.delete(
  "/:id",
  authorizedMiddleware,
  adminMiddleware,
  hospitalController.deleteHospital
);

// PUT /api/hospitals/:id/inventory - Update blood inventory (Hospital staff)
router.put(
  "/:id/inventory",
  authorizedMiddleware,
  hospitalController.updateBloodInventory
);

// DELETE /api/hospitals/:id/inventory/:bloodType - Remove blood type
router.delete(
  "/:id/inventory/:bloodType",
  authorizedMiddleware,
  hospitalController.deleteBloodInventory
);

export default router;
