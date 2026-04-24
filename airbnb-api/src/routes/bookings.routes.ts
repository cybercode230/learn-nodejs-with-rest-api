import { Router } from "express";
import {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  deleteBooking
} from "../controllers/bookings.controller.js";
import { authenticate, requireGuest, requireAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", authenticate, requireAdmin, getAllBookings);
router.get("/:id", authenticate, getBookingById);
router.post("/", authenticate, requireGuest, createBooking);
router.patch("/:id/status", authenticate, updateBookingStatus);
router.delete("/:id", authenticate, requireAdmin, deleteBooking);

export default router;
