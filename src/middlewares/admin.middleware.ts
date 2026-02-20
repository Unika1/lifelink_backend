import { Request, Response, NextFunction } from "express";
import { HttpError } from "../errors/http-error";

/**
 * Admin Middleware - Check if user is admin
 * Must be used after authorizedMiddleware
 */
export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user as any;

    if (!user) {
      throw new HttpError(401, "Unauthorized, User not found");
    }

    if (user.role !== "admin") {
      throw new HttpError(
        403,
        "Forbidden, Only admin can access this resource"
      );
    }

    next();
  } catch (error: any) {
    return res.status(error.statusCode ?? 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
