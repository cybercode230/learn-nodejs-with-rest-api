import type { Response, NextFunction } from "express";
import { BookingService } from "../services/booking.service.js";
import { BookingStatus, Role } from "../generated/prisma/index.js";
import { createBookingSchema } from "../dtos/index.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import prisma from "../config/prisma.js";

/**
 * @swagger
 * /airbnb/api/v1/bookings:
 *   get:
 *     summary: Get all bookings
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bookings
 */
export const getAllBookings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const bookings = await BookingService.getAllBookings();
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /airbnb/api/v1/bookings/{id}:
 *   get:
 *     summary: Get booking details by ID
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Booking details
 *       403:
 *         description: Forbidden (Not the owner)
 *       404:
 *         description: Booking not found
 */
export const getBookingById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params["id"] as string;
    const booking = await BookingService.getBookingById(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Ownership check
    if (booking.guestId !== req.userId && req.role !== Role.ADMIN) {
      return res.status(403).json({ message: "Forbidden: You can only view your own bookings" });
    }

    res.json(booking);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /airbnb/api/v1/bookings:
 *   post:
 *     summary: Create a new booking
 *     description: Calculates total price based on dates and property price
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBookingDTO'
 *     responses:
 *       201:
 *         description: Booking created
 *       400:
 *         description: Validation error or invalid dates
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Listing not found
 */
export const createBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const newBooking = await BookingService.createBooking({
      ...req.body,
      guestId: req.userId
    });
    res.status(201).json(newBooking);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /airbnb/api/v1/bookings/{id}/status:
 *   patch:
 *     summary: Update booking status
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
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
 *       403:
 *         description: Forbidden (Not the owner/host/admin)
 *       404:
 *         description: Booking not found
 */
export const updateBookingStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params["id"] as string;
    const { status } = req.body;

    const booking = await BookingService.getBookingById(id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Status update permission: Guest (only CANCELLED), Host (any), Admin (any)
    // For simplicity, let's allow owner (Guest) or Host/Admin
    if (booking.guestId !== req.userId && req.role !== Role.ADMIN) {
        // Check if user is the host of the property
        const listing = await prisma.listing.findUnique({ where: { id: booking.listingId } });
        if (listing?.hostId !== req.userId) {
            return res.status(403).json({ message: "Forbidden: You cannot update this booking status" });
        }
    }

    if (!status || !Object.values(BookingStatus).includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updatedBooking = await BookingService.updateBookingStatus(id, status as BookingStatus);
    res.json(updatedBooking);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /airbnb/api/v1/bookings/{id}:
 *   delete:
 *     summary: Cancel/Delete a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Booking deleted
 *       403:
 *         description: Forbidden (Not the owner/admin)
 *       404:
 *         description: Booking not found
 */
export const deleteBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params["id"] as string;

    const booking = await BookingService.getBookingById(id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.guestId !== req.userId && req.role !== Role.ADMIN) {
        return res.status(403).json({ message: "Forbidden: You can only delete your own bookings" });
    }

    await BookingService.deleteBooking(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
