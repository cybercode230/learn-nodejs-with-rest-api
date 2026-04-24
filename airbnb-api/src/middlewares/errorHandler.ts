import type { Request, Response, NextFunction } from "express";
import { Prisma } from "../generated/prisma/index.js";
import { ZodError } from "zod";
import { logger } from "../utils/logger.js";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Zod validation errors
  if (err instanceof ZodError) {
    const zodError = err as ZodError;
    logger.warn(`Validation Error: ${JSON.stringify(zodError.issues)}`);
    return res.status(400).json({
      status: "error",
      message: "Validation failed",
      errors: zodError.issues.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      })),
    });
  }

  // Prisma known errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    logger.error(`Prisma Error [${err.code}]: ${err.message}`);
    switch (err.code) {
      case "P2002":
        return res.status(409).json({
          status: "error",
          message: `Duplicate field: ${err.meta?.target}`,
        });
      case "P2025":
        return res.status(404).json({
          status: "error",
          message: "Record not found",
        });
      case "P2003":
        return res.status(400).json({
          status: "error",
          message: "Foreign key constraint failed. Related record does not exist.",
        });
      default:
        return res.status(500).json({
          status: "error",
          message: "Internal server database error",
        });
    }
  }

  // Log unknown errors server-side
  logger.error("Unhandled Error", err);
  
  res.status(500).json({
    status: "error",
    message: err instanceof Error ? err.message : "Something went wrong",
  });
}
