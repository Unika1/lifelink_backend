import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { authorizedMiddleware } from "../middlewares/auth.middleware.js";
import { uploads } from "../middlewares/upload.middleware.js";

const router = Router();
const controller = new AuthController();
router.put(
  "/update-profile",
  authorizedMiddleware,
  uploads.single("image"),
  controller.updateProfile.bind(controller)
);


router.post("/register", controller.register.bind(controller));
router.post("/login", controller.login.bind(controller));

export default router;
