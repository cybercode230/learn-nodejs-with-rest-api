/**
 * File: auth.controller.ts
 * What it is doing: Manages HTTP requests for user authentication (register, login, forgot password, reset password, change password, profile).
 * Responsibility: Receiving client credentials, routing them to the AuthService, handling specific domain errors, and returning the appropriate HTTP status codes and JSON payloads.
 * Outcomes: Sends back authentication tokens, user data, or error responses to the API client.
 */
import { type Request, type Response, type NextFunction } from "express";
import { AuthService } from "../services/auth.service.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import prisma from "../config/prisma.js";

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, username, phone, password]
 *             properties:
 *               name: { type: string, example: "John Doe" }
 *               email: { type: string, example: "john@example.com" }
 *               username: { type: string, example: "johndoe" }
 *               phone: { type: string, example: "+250788123456" }
 *               password: { type: string, example: "secretpassword", minLength: 6 }
 *               role: { type: string, enum: [GUEST, HOST], example: "GUEST" }
 *               bio: { type: string, example: "Traveler and food lover." }
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email or username already in use
 */
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Forward the registration request payload to the authentication service
    const user = await AuthService.register(req.body);
    // Respond with a 201 Created status and the newly created user object
    res.status(201).json(user);
  } catch (error) {
    // Pass any errors (e.g., validation, database constraints) to the error handler
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: "john@example.com" }
 *               password: { type: string, example: "secretpassword" }
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *       401:
 *         description: Invalid email or password
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Forward the login credentials to the authentication service
    const result = await AuthService.login(req.body);

    // Update user status to ACTIVE on successful login
    await prisma.user.update({
      where: { id: result.user.id },
      data: { status: "ACTIVE" }
    });

    // Send back the resulting token and user info
    res.json(result);
  } catch (error) {
    // Intercept specific 'INVALID_CREDENTIALS' error to return a clean 401 response
    if ((error as Error).message === "INVALID_CREDENTIALS") {
      return res.status(401).json({ status: "error", message: "Invalid email or password" });
    }
    // Pass any other unhandled errors to the global error middleware
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get current authenticated user profile
 *     description: >
 *       Returns the authenticated user's profile.
 *       If role is HOST — includes their listings with booking counts.
 *       If role is GUEST — includes their bookings with listing title and location.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const isHost = req.role === "HOST";
    const isGuest = req.role === "GUEST";

    // Query the database for the currently authenticated user's detailed information
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        profile: true,
        // HOST: include their listings with per-listing booking counts
        listings: isHost
          ? {
              include: {
                _count: { select: { bookings: true } }
              }
            }
          : false,
        // GUEST: include their bookings with listing title and location
        bookings: isGuest
          ? {
              include: {
                listing: {
                  select: { title: true, location: true, type: true }
                }
              },
              orderBy: { createdAt: "desc" }
            }
          : false
      }
    });

    // If the user record somehow doesn't exist, return a 404
    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }

    // Strip out the password field to prevent leaking secure credentials
    const { password: _, ...userWithoutPassword } = user;
    // Return the sanitized user profile details
    res.json(userWithoutPassword);
  } catch (error) {
    // Forward any database or unexpected errors
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Request a password reset email
 *     description: >
 *       Always returns 200 regardless of whether the email is registered.
 *       This prevents email enumeration attacks.
 *       If the email is registered, a reset link will be sent with a 1-hour expiry.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: >
 *           Always returns "If that email is registered, a reset link has been sent"
 *           — whether the user exists or not
 */
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // The service always returns a generic 200 message — never reveals if email is registered
    const result = await AuthService.forgotPassword(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/auth/reset-password/{token}:
 *   post:
 *     summary: Reset password using a URL token (from email link)
 *     description: >
 *       Accepts the raw token from the email reset link (in the URL path).
 *       The server hashes it internally and compares against the stored hash.
 *       Returns the same error message for both "invalid" and "expired" — prevents probing.
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Raw reset token received via email link
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [newPassword]
 *             properties:
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 example: "NewSecurePass123!"
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired reset token
 */
export const resetPasswordByToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Read the raw token from the URL path parameter
    const rawToken = req.params["token"] as string;

    if (!rawToken) {
      return res.status(400).json({ status: "error", message: "Token is required" });
    }

    // The service hashes the raw token and validates against the stored hash
    const result = await AuthService.resetPasswordByToken(rawToken, req.body);
    res.json(result);
  } catch (error) {
    // Both "not found" and "expired" return the same message to prevent probing
    if ((error as Error).message === "INVALID_OR_EXPIRED_TOKEN") {
      return res.status(400).json({ status: "error", message: "Invalid or expired reset token" });
    }
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/auth/change-password:
 *   post:
 *     summary: Change password for authenticated user
 *     description: >
 *       Requires authentication. The user must provide their current password
 *       along with the new password. The new password must be at least 8 characters.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: "OldPassword123"
 *                 description: "The user's current password for verification"
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 example: "NewSecurePass456!"
 *                 description: "The new password (minimum 8 characters)"
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       401:
 *         description: Current password is incorrect
 *       400:
 *         description: Validation error (e.g., newPassword too short)
 */
export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // userId comes from the verified JWT token — never from the request body
    const result = await AuthService.changePassword(req.userId as string, req.body);
    res.json(result);
  } catch (error) {
    if ((error as Error).message === "WRONG_CURRENT_PASSWORD") {
      return res.status(401).json({ status: "error", message: "Current password is incorrect" });
    }
    if ((error as Error).message === "USER_NOT_FOUND") {
      return res.status(404).json({ status: "error", message: "User not found" });
    }
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/auth/validate-reset-token/{token}:
 *   get:
 *     summary: Validate a password reset token
 *     description: Checks if the raw token from the reset link is still valid and unexpired.
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Raw reset token from email link
 *     responses:
 *       200:
 *         description: Token is valid
 *       400:
 *         description: Invalid or expired token
 */
export const validateResetToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Accept token from either URL path param or query string
    const token = (req.params["token"] || req.query.token) as string;
    if (!token) {
      return res.status(400).json({ status: "error", message: "Token is required" });
    }
    const result = await AuthService.validateResetToken(token);
    res.json({ status: "success", ...result });
  } catch (error) {
    if ((error as Error).message === "INVALID_OR_EXPIRED_TOKEN") {
      return res.status(400).json({ status: "error", valid: false, message: "Invalid or expired token" });
    }
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout user (sets status to DEACTIVATED)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Logged out successfully }
 */
export const logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.userId) {
      await prisma.user.update({
        where: { id: req.userId },
        data: { status: "DEACTIVATED" }
      });
    }
    res.json({ status: "success", message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};
