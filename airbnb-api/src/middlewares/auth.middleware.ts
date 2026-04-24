import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "../generated/prisma/index.js";

const JWT_SECRET = process.env["JWT_SECRET"] || "your-secret-key";

export interface AuthRequest extends Request {
  userId?: string;
  role?: Role;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ status: "error", message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token!, JWT_SECRET) as { userId: string; role: Role };
    req.userId = decoded.userId;
    req.role = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({ status: "error", message: "Unauthorized: Invalid or expired token" });
  }
};

export const authorize = (...allowedRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.role || !allowedRoles.includes(req.role)) {
      return res.status(403).json({
        status: "error",
        message: `Forbidden: Only ${allowedRoles.join(" or ")} can perform this action`
      });
    }
    next();
  };
};

export const requireHost = authorize(Role.HOST, Role.ADMIN);
export const requireGuest = authorize(Role.GUEST, Role.ADMIN);
export const requireAdmin = authorize(Role.ADMIN);
