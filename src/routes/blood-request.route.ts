import { Router } from "express";
import { BloodRequestController } from "../controllers/blood-request.controller";
import { authorizedMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const controller = new BloodRequestController();

// Create a new request
router.post("/", authorizedMiddleware, controller.createRequest);

// List requests with optional filters: hospitalId, status
router.get("/", authorizedMiddleware, controller.getAllRequests);

// Get a request by id
router.get("/:id", authorizedMiddleware, controller.getRequestById);

// Update a request
router.put("/:id", authorizedMiddleware, controller.updateRequest);

// Delete a request
router.delete("/:id", authorizedMiddleware, controller.deleteRequest);

export default router;
