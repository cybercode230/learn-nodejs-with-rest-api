/**
 * File: bookings.routes.ts
 * What it is doing: Handles routing for booking/reservation-related requests.
 * Responsibility: Protecting endpoints with role-based middleware and mapping HTTP methods to booking controllers.
 * Outcomes: Provides the routing layer for the bookings API.
 */
import { Router } from "express";
import {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  deleteBooking
} from "../../controllers/bookings.controller.js";
import { requireGuest, requireAdmin } from "../../middlewares/auth.middleware.js";

const router = Router();

// Admin-only route to view all platform bookings (paginated)
router.get("/", requireAdmin, getAllBookings);

// Fetch details for a specific booking (controller handles ownership check)
router.get("/:id", getBookingById);

// Only authenticated GUEST users can create new reservations
router.post("/", requireGuest, createBooking);

// Route to confirm/cancel a booking status (controller handles host/guest/admin checks)
router.patch("/:id/status", updateBookingStatus);

// Soft-cancel a booking — sets status to CANCELLED, keeps record for history
// Controller enforces: only the guest who booked can cancel + already-cancelled guard
router.delete("/:id", deleteBooking);

export default router;
