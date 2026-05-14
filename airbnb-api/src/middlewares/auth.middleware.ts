/**
 * File: auth.middleware.ts
 * What it is doing: Provides middleware for verifying JWT tokens and enforcing role-based access control (RBAC).
 * Responsibility: Extracting tokens from authorization headers, verifying their validity, attaching user identity/roles to the request object, and blocking unauthorized requests.
 * Outcomes: Secure routes by ensuring only authenticated and properly authorized users can access protected endpoints.
 */
import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import prisma from "../config/prisma.js";

// Load the JWT signing secret from environment variables
const JWT_SECRET = process.env["JWT_SECRET"] || "your-secret-key";

// Extend the standard Express Request interface to include custom auth fields
export interface AuthRequest extends Request {
  userId?: string;
  role?: Role;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  // Extract the authorization header from the incoming request
  const authHeader = req.headers.authorization;

  // Check if the header exists and follows the 'Bearer <token>' format
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ status: "error", message: "Unauthorized: No token provided" });
  }

  // Extract the actual token string by splitting the header
  const token = authHeader.split(" ")[1];

  try {
    // Verify and decode the JWT using the secret key
    const decoded = jwt.verify(token!, JWT_SECRET) as { userId: string; role: Role };
    
    // Attach the decoded user ID and role to the request object for downstream use
    req.userId = decoded.userId;
    req.role = decoded.role;

    // Check user status in database (e.g. for suspension)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { status: true }
    });

    if (!user || user.status === "SUSPENDED") {
      return res.status(403).json({ 
        status: "error", 
        message: "Forbidden: Your account has been suspended or does not exist" 
      });
    }
    
    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // If token verification fails (e.g. expired or tampered), return a 401 error
    return res.status(401).json({ status: "error", message: "Unauthorized: Invalid or expired token" });
  }
};

// function that is there to help me to capture the active Role based on the action that is allowed to handle the action.
export const authorize = (...allowedRoles: Role[]) => {
  // Return a middleware function tailored to the provided roles
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // Check if the user's role is missing or not included in the allowed roles
    if (!req.role || !allowedRoles.includes(req.role)) {
      return res.status(403).json({
        status: "error",
        message: `Forbidden: Only ${allowedRoles.join(" or ")} can perform this action`
      });
    }
    // Access granted, proceed to the next handler
    next();
  };
};

// Pre-configured authorization middlewares for specific roles
export const requireHost = authorize(Role.HOST, Role.ADMIN);
export const requireGuest = authorize(Role.GUEST, Role.ADMIN);
export const requireAdmin = authorize(Role.ADMIN);
export const allRolesCanDoIt = authorize(Role.HOST, Role.GUEST, Role.ADMIN);

