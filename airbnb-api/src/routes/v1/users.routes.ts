/**
 * File: users.routes.ts
 * What it is doing: Defines endpoints for retrieving and managing user data.
 * Responsibility: Assigning URLs to user controller actions and enforcing strict admin-only rules.
 * Outcomes: Exports the user management router.
 */
import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getListingsByHost,
  getBookingsByGuest,
  getUserStats
} from "../../controllers/users.controller.js";
import { authenticate, requireAdmin } from "../../middlewares/auth.middleware.js";

const router = Router();

// IMPORTANT: /stats must come before /:id to avoid being treated as a param
router.get("/stats", authenticate, requireAdmin, getUserStats);

// Protected admin-only route to list all platform users (paginated)
router.get("/", authenticate, requireAdmin, getAllUsers);

// Protected route — get user details (requires auth)
router.get("/:id", authenticate, getUserById);

// Public/Protected routes for fetching related entity data
router.get("/:id/listings", getListingsByHost);
router.get("/:id/bookings", authenticate, getBookingsByGuest);

// Admin-only route for creating users manually
router.post("/", authenticate, requireAdmin, createUser);

// Route for updating profile details (auth check + ownership in controller)
router.put("/:id", authenticate, updateUser);

// Admin-only route to forcefully delete a user
router.delete("/:id", authenticate, requireAdmin, deleteUser);

export default router;
