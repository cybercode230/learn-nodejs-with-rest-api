/**
 * File: auth.routes.ts
 * What it is doing: Defines the API endpoints for user authentication and authorization.
 * Responsibility: Mapping URL paths to auth controller functions, applying authenticate middleware to protected routes.
 * Outcomes: Exports a configured Express router for all auth operations.
 */
import { Router } from "express";
import {
  register,
  login,
  getMe,
  forgotPassword,
  resetPasswordByToken,
  validateResetToken,
  changePassword,
  logout
} from "../../controllers/auth.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

// Public — create a new account
router.post("/register", register);

// Public — authenticate and receive a JWT token
router.post("/login", login);

// Protected — log out and clear the session/cookie
router.post("/logout", authenticate, logout);

// Protected — get the currently authenticated user's profile
router.get("/me", authenticate, getMe);

// Public — send a password reset email (always 200, never reveals if email exists)
router.post("/forgot-password", forgotPassword);

// Public — validate a reset token from the email link (token in URL path)
router.get("/validate-reset-token/:token", validateResetToken);

// Public — reset password using the raw token from the email link
router.post("/reset-password/:token", resetPasswordByToken);

// Protected — change password while logged in (requires current password)
router.post("/change-password", authenticate, changePassword);

export default router;
