import { Router } from "express";
import {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  deleteBooking
} from "../controllers/bookings.controller.js";

const router = Router();

router.get("/", getAllBookings);
router.get("/:id", getBookingById);
router.post("/", createBooking);
router.patch("/:id/status", updateBookingStatus);
router.delete("/:id", deleteBooking);

export default router;
