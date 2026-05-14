/**
 * File: bookings.controller.ts
 * What it is doing: Manages API endpoints for booking/reservation workflows.
 * Responsibility: Enforcing access control, coordinating with BookingService, and returning proper responses.
 * Outcomes: Sends booking data to authenticated clients, handles soft-cancellation with conflict guards, or returns HTTP errors.
 */
import type { Response, NextFunction } from "express";
import { BookingService } from "../services/booking.service.js";
import { BookingStatus, Role } from "@prisma/client";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import prisma from "../config/prisma.js";

/**
 * @swagger
 * /api/v1/bookings:
 *   get:
 *     summary: Get all bookings (admin only, paginated)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 10 } }
 *     responses:
 *       200: { description: Paginated list of bookings with guest name and listing title/location }
 */
export const getAllBookings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const pageInt = parseInt(req.query.page as string) || 1;
    const limitInt = parseInt(req.query.limit as string) || 10;
    const skip = (pageInt - 1) * limitInt;

    // Build filters based on Role
    // GUEST: Only their own bookings
    // HOST: Only bookings for their listings
    // ADMIN: All bookings
    const where: any = {};
    if (req.role === Role.GUEST) {
      where.guestId = req.userId;
    } else if (req.role === Role.HOST) {
      where.listing = { hostId: req.userId };
    }
    // If ADMIN, where remains empty to fetch all

    const { data, total } = await BookingService.getAllBookings({ skip, take: limitInt, where });
    res.json({ data, meta: { total, page: pageInt, limit: limitInt, totalPages: Math.ceil(total / limitInt) } });
  } catch (error) { next(error); }
};

/**
 * @swagger
 * /api/v1/bookings/{id}:
 *   get:
 *     summary: Get booking details by ID
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Booking details }
 *       403: { description: You can only view your own bookings }
 *       404: { description: Booking not found }
 */
export const getBookingById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params["id"] as string;
    const booking = await BookingService.getBookingById(id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    // Ownership check — guests can only view their own bookings; ADMIN sees all
    if (booking.guestId !== req.userId && req.role !== Role.ADMIN) {
      return res.status(403).json({ message: "Forbidden: You can only view your own bookings" });
    }
    res.json(booking);
  } catch (error) { next(error); }
};

/**
 * @swagger
 * /api/v1/bookings:
 *   post:
 *     summary: Create a new booking
 *     description: >
 *       Creates a reservation. guestId is derived from the JWT token — do NOT include it in the body.
 *       totalPrice is computed server-side: (checkOut - checkIn in days) × listing.pricePerNight.
 *       Returns 409 if dates overlap with an existing CONFIRMED booking.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [listingId, checkIn, checkOut]
 *             properties:
 *               listingId: { type: string, example: "clxyz123abc", description: "ID of the listing to book" }
 *               checkIn: { type: string, format: date-time, example: "2025-08-01T14:00:00Z", description: "ISO 8601 Check-in date" }
 *               checkOut: { type: string, format: date-time, example: "2025-08-07T11:00:00Z", description: "ISO 8601 Check-out date" }
 *     responses:
 *       201: { description: Booking created with totalPrice calculated server-side }
 *       400: { description: Validation error or invalid dates }
 *       401: { description: Unauthorized }
 *       404: { description: Listing not found }
 *       409: { description: Dates conflict with an existing confirmed booking }
 */
export const createBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Strip guestId from body — must always come from the verified token, never from client input
    const { guestId: _ignored, ...bodyWithoutGuestId } = req.body;
    const newBooking = await BookingService.createBooking({
      ...bodyWithoutGuestId,
      guestId: req.userId
    });
    res.status(201).json(newBooking);
  } catch (error) {
    if ((error as Error).message === "BOOKING_CONFLICT") {
      return res.status(409).json({ 
        message: "These dates conflict with an existing confirmed booking",
        suggestion: (error as any).suggestion 
      });
    }
    if ((error as Error).message === "LISTING_NOT_FOUND") {
      return res.status(404).json({ message: "Listing not found" });
    }
    if ((error as Error).message === "INVALID_DATES") {
      return res.status(400).json({ message: "Check-out must be after check-in" });
    }
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/bookings/{id}/status:
 *   patch:
 *     summary: Update booking status (host or admin)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
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
 *       200: { description: Status updated }
 *       403: { description: Not authorized to update this booking }
 *       404: { description: Booking not found }
 */
export const updateBookingStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params["id"] as string;
    const { status } = req.body;
    const booking = await BookingService.getBookingById(id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    // Allow: the guest who owns it, the host of the listing, or an ADMIN
    if (booking.guestId !== req.userId && req.role !== Role.ADMIN) {
      const listing = await prisma.listing.findUnique({ where: { id: booking.listingId } });
      if (listing?.hostId !== req.userId) {
        return res.status(403).json({ message: "Forbidden: You cannot update this booking status" });
      }
    }
    if (!status || !Object.values(BookingStatus).includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }
    const updatedBooking = await BookingService.updateBookingStatus(id, status as BookingStatus);
    res.json(updatedBooking);
  } catch (error) { next(error); }
};

/**
 * @swagger
 * /api/v1/bookings/{id}:
 *   delete:
 *     summary: Cancel a booking (soft cancel — guest only, keeps record for history)
 *     description: >
 *       Sets booking status to CANCELLED — the record is kept for audit and history purposes.
 *       Only the guest who made the booking can cancel it.
 *       Returns 400 if the booking is already cancelled.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Booking cancelled successfully }
 *       400: { description: Booking is already cancelled }
 *       403: { description: You can only cancel your own bookings }
 *       404: { description: Booking not found }
 */
export const deleteBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params["id"] as string;
    // cancelBooking performs: existence check, ownership check, already-cancelled guard, soft update + email
    const cancelled = await BookingService.cancelBooking(id, req.userId as string);
    res.json({ message: "Booking cancelled successfully", booking: cancelled });
  } catch (error) {
    if ((error as Error).message === "BOOKING_NOT_FOUND") {
      return res.status(404).json({ message: "Booking not found" });
    }
    if ((error as Error).message === "FORBIDDEN") {
      return res.status(403).json({ message: "You can only cancel your own bookings" });
    }
    if ((error as Error).message === "ALREADY_CANCELLED") {
      return res.status(400).json({ message: "Booking is already cancelled" });
    }
    next(error);
  }
};
