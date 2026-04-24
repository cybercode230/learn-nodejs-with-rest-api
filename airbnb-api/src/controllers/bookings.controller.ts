import type { Request, Response, NextFunction } from "express";
import { BookingService } from "../services/booking.service.js";
import { BookingStatus } from "../generated/prisma/index.js";
import { createBookingSchema } from "../dtos/index.js";

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
export const getAllBookings = async (req: Request, res: Response, next: NextFunction) => {
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
export const getBookingById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params["id"] as string;
    const booking = await BookingService.getBookingById(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
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
 *       404:
 *         description: Guest or Listing not found
 */
export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newBooking = await BookingService.createBooking(req.body);
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
export const updateBookingStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params["id"] as string;
    const { status } = req.body;

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
export const deleteBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params["id"] as string;
    await BookingService.deleteBooking(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
