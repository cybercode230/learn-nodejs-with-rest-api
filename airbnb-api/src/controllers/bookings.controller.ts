import type { Request, Response } from "express";
import { BookingService } from "../services/booking.service.js";
import { BookingStatus } from "../generated/prisma/index.js";

/**
 * @swagger
 * /airbnb/api/v1/bookings:
 *   get:
 *     summary: Get all bookings
 *     tags: [Bookings]
 *     responses:
 *       200:
 *         description: List of bookings
 */
export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await BookingService.getAllBookings();
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

/**
 * @swagger
 * /airbnb/api/v1/bookings/{id}:
 *   get:
 *     summary: Get booking details by ID
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Booking details
 *       404:
 *         description: Booking not found
 */
export const getBookingById = async (req: Request, res: Response) => {
  try {
    const id = req.params["id"] as string;
    const booking = await BookingService.getBookingById(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(booking);
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

/**
 * @swagger
 * /airbnb/api/v1/bookings:
 *   post:
 *     summary: Create a new booking
 *     description: Calculates total price based on dates and property price
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [checkIn, checkOut, guestId, listingId]
 *             properties:
 *               checkIn: { type: string, format: date, example: "2024-06-15" }
 *               checkOut: { type: string, format: date, example: "2024-06-20" }
 *               guestId: { type: string, example: "usr_112233" }
 *               listingId: { type: string, example: "lst_556677" }
 *     responses:
 *       201:
 *         description: Booking created
 *       404:
 *         description: Guest or Listing not found
 */
export const createBooking = async (req: Request, res: Response) => {
  try {
    const { checkIn, checkOut, guestId, listingId } = req.body;

    if (!checkIn || !checkOut || !guestId || !listingId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newBooking = await BookingService.createBooking({
      checkIn,
      checkOut,
      guestId,
      listingId
    });

    res.status(201).json(newBooking);
  } catch (error: any) {
    if (error.message === "GUEST_NOT_FOUND") return res.status(404).json({ message: "Guest not found" });
    if (error.message === "LISTING_NOT_FOUND") return res.status(404).json({ message: "Listing not found" });
    if (error.message === "INVALID_DATES") return res.status(400).json({ message: "Invalid check-in/check-out dates" });

    console.error("Error creating booking:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

/**
 * @swagger
 * /airbnb/api/v1/bookings/{id}/status:
 *   patch:
 *     summary: Update booking status
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [PENDING, CONFIRMED, CANCELLED], example: "CONFIRMED" }
 *     responses:
 *       200:
 *         description: Status updated
 *       404:
 *         description: Booking not found
 */
export const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    const id = req.params["id"] as string;
    const { status } = req.body;

    if (!status || !Object.values(BookingStatus).includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const existingBooking = await BookingService.getBookingById(id);
    if (!existingBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const updatedBooking = await BookingService.updateBookingStatus(id, status as BookingStatus);
    res.json(updatedBooking);
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

/**
 * @swagger
 * /airbnb/api/v1/bookings/{id}:
 *   delete:
 *     summary: Cancel/Delete a booking
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Booking deleted
 *       404:
 *         description: Booking not found
 */
export const deleteBooking = async (req: Request, res: Response) => {
  try {
    const id = req.params["id"] as string;

    const existingBooking = await BookingService.getBookingById(id);
    if (!existingBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    await BookingService.deleteBooking(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
