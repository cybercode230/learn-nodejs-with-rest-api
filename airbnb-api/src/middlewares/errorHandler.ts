/**
 * File: errorHandler.ts
 * What it is doing: Centralized global error handling middleware for the Express application.
 * Responsibility: Catching all unhandled exceptions (e.g. Zod validation failures, Prisma DB errors), logging them appropriately, and formatting a standardized JSON response for the client.
 * Outcomes: Prevents app crashes, ensures API consumers receive consistent error formats, and provides useful debug logs on the server.
 */
import type { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { logger } from "../utils/logger.js";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Check if the error is a validation error thrown by Zod
  if (err instanceof ZodError) {
    const zodError = err as ZodError;
    // Log the validation issues
    logger.warn(`Validation Error: ${JSON.stringify(zodError.issues)}`);
    // Return a structured 400 Bad Request with specific field errors
    return res.status(400).json({
      status: "error",
      message: "Validation failed",
      errors: zodError.issues.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      })),
    });
  }

  // Check if the error is a recognized database error from Prisma
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Log the specific Prisma code and message
    logger.error(`Prisma Error [${err.code}]: ${err.message}`);

    // Map specific Prisma error codes to appropriate HTTP status codes
    switch (err.code) {
      case "P2002":
        // Handle unique constraint violations (e.g. duplicate email)
        return res.status(409).json({
          status: "error",
          message: `Duplicate field: ${err.meta?.target}`,
        });
      case "P2025":
        // Handle record not found errors
        return res.status(404).json({
          status: "error",
          message: "Record not found",
        });
      case "P2003":
        // Handle foreign key constraint failures (e.g. creating a listing for a non-existent host)
        return res.status(400).json({
          status: "error",
          message: "Foreign key constraint failed. Related record does not exist.",
        });
      default:
        // Fallback for other known Prisma errors
        return res.status(500).json({
          status: "error",
          message: "Internal server database error",
        });
    }
  }

  // Log any other unknown or unexpected errors
  logger.error("Unhandled Error", err);
  
  // Return a generic 500 Internal Server Error response
  res.status(500).json({
    status: "error",
    message: err instanceof Error ? err.message : "Something went wrong",
  });
}

