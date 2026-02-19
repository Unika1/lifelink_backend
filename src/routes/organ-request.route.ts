import { Router } from "express";
import { OrganRequestController } from "../controllers/organ-request.controller.js";
import { authorizedMiddleware } from "../middlewares/auth.middleware.js";
import { uploads } from "../middlewares/upload.middleware.js";

const router = Router();
const controller = new OrganRequestController();

// Create a new organ donation request (with report upload)
router.post(
  "/",
  authorizedMiddleware,
  uploads.single("report"),
  controller.createRequest
);

// List requests with optional filters: hospitalId, status, requestedBy
router.get("/", authorizedMiddleware, controller.getAllRequests);

// Get a request by id
router.get("/:id", authorizedMiddleware, controller.getRequestById);

// Update a request (optional report upload)
router.put(
  "/:id",
  authorizedMiddleware,
  uploads.single("report"),
  controller.updateRequest
);

// Delete a request
router.delete("/:id", authorizedMiddleware, controller.deleteRequest);

export default router;
