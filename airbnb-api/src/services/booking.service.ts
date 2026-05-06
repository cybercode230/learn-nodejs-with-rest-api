/**
 * File: booking.service.ts
 * What it is doing: Handles business logic associated with property bookings/reservations.
 * Responsibility: Processing booking creation with overlap detection, calculating prices, managing soft-cancel state, sending booking and cancellation emails, and providing paginated booking lists.
 * Outcomes: Returns booking details, creates new booking records, performs soft cancellations, or returns conflict errors when dates overlap.
 */
import prisma from "../config/prisma.js";
import { generateId } from "../utils/idGenerator.js";
import { BookingStatus } from "@prisma/client";
import { createBookingSchema } from "../dtos/index.js";

export class BookingService {
  static async getAllBookings(options: { skip?: number; take?: number } = {}) {
    // Fetch all bookings and count in parallel — never run sequential queries for list + count
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        include: {
          guest: { select: { name: true } },
          listing: { select: { title: true, location: true } }
        },
        orderBy: { createdAt: "desc" },
        skip: options.skip,
        take: options.take
      }),
      prisma.booking.count()
    ]);

    return { data: bookings, total };
  }

  static async getBookingById(id: string) {
    // Fetch a single booking by ID and eagerly load all associated guest and listing information
    return prisma.booking.findUnique({
      where: { id },
      include: {
        guest: { select: { id: true, name: true, email: true, avatar: true } },
        listing: true
      }
    });
  }

  static async createBooking(rawData: any) {
    // Extract guestId separately — it comes from req.userId (token), never from the client body
    const { guestId, ...bodyData } = rawData;

    // Validate the rest of the booking payload
    const validatedData = createBookingSchema.parse(bodyData);

    // Verify the guest making the booking exists
    const guest = await prisma.user.findUnique({ where: { id: guestId } });
    if (!guest) throw new Error("GUEST_NOT_FOUND");

    // Verify the requested listing exists
    const listing = await prisma.listing.findUnique({ where: { id: validatedData.listingId } });
    if (!listing) throw new Error("LISTING_NOT_FOUND");

    const checkIn = new Date(validatedData.checkIn);
    const checkOut = new Date(validatedData.checkOut);

    // Validate date logic — checkOut must be after checkIn
    if (checkOut <= checkIn) {
      throw new Error("INVALID_DATES");
    }

    // ─── Overlapping date check ───────────────────────────────────────────────
    // Two date ranges [A, B] and [C, D] overlap when: A < D AND B > C
    // In Prisma terms: existingCheckIn < newCheckOut AND existingCheckOut > newCheckIn
    // This catches all overlap cases: full overlap, partial start, partial end, and containment.
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        listingId: validatedData.listingId,
        status: BookingStatus.CONFIRMED,
        checkIn: { lt: checkOut },   // existing check-in is before new check-out
        checkOut: { gt: checkIn }    // existing check-out is after new check-in
      }
    });

    if (conflictingBooking) {
      throw new Error("BOOKING_CONFLICT");
    }
    // ─────────────────────────────────────────────────────────────────────────

    // ─── Total price calculation ──────────────────────────────────────────────
    // Formula: totalPrice = (checkOut - checkIn in days) × listing.pricePerNight
    // Math.ceil ensures partial days count as a full night (e.g., 3.2 days = 4 nights)
    const diffMs = checkOut.getTime() - checkIn.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const totalPrice = diffDays * listing.pricePerNight;
    // ─────────────────────────────────────────────────────────────────────────

    // Persist the new booking record in the database
    const booking = await prisma.booking.create({
      data: {
        id: generateId(),
        checkIn,
        checkOut,
        totalPrice,
        status: BookingStatus.PENDING,
        guestId,
        listingId: validatedData.listingId
      }
    });

    // ─── Booking confirmation email ───────────────────────────────────────────
    // Send asynchronously — a failure here should not fail the booking itself
    try {
      const { sendMail } = await import("../config/mailer.js");
      const { bookingConfirmationTemplate } = await import("../templates/emails/booking-confirmation.js");

      const emailContent = bookingConfirmationTemplate({
        guestName: guest.name,
        listingTitle: listing.title,
        checkIn: checkIn.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
        checkOut: checkOut.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
        totalPrice,
      });

      sendMail({
        to: guest.email,
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html,
      }).catch(err => console.error("Failed to send booking confirmation email:", err));
    } catch (err) {
      console.error("Booking confirmation email template failed to load:", err);
    }
    // ─────────────────────────────────────────────────────────────────────────

    return booking;
  }

  static async cancelBooking(id: string, userId: string) {
    // Find the booking — return 404 if it doesn't exist
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        guest: { select: { name: true, email: true } },
        listing: { select: { title: true } }
      }
    });

    if (!booking) throw new Error("BOOKING_NOT_FOUND");

    // Ownership check — only the guest who created the booking can cancel it
    if (booking.guestId !== userId) throw new Error("FORBIDDEN");

    // Guard against double-cancellation — keep the record but prevent no-op updates
    if (booking.status === BookingStatus.CANCELLED) {
      throw new Error("ALREADY_CANCELLED");
    }

    // Soft cancel — update status to CANCELLED, do NOT delete the record
    // Keeping cancelled records is important for audit trails and billing history
    const updated = await prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CANCELLED }
    });

    // ─── Cancellation email ───────────────────────────────────────────────────
    // Send asynchronously — a failure here should not fail the cancellation itself
    try {
      const { sendMail } = await import("../config/mailer.js");
      const { bookingCancellationTemplate } = await import("../templates/emails/booking-cancellation.js");

      const emailContent = bookingCancellationTemplate({
        guestName: booking.guest.name,
        listingTitle: booking.listing.title,
        checkIn: booking.checkIn.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
        checkOut: booking.checkOut.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
      });

      sendMail({
        to: booking.guest.email,
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html,
      }).catch(err => console.error("Failed to send cancellation email:", err));
    } catch (err) {
      console.error("Cancellation email template failed to load:", err);
    }
    // ─────────────────────────────────────────────────────────────────────────

    return updated;
  }

  static async updateBookingStatus(id: string, status: BookingStatus) {
    // Update the state/status of an existing booking (e.g., to CONFIRMED or CANCELLED)
    return prisma.booking.update({
      where: { id },
      data: { status }
    });
  }

  static async deleteBooking(id: string) {
    // Hard delete a booking record by its ID (admin-only operation)
    return prisma.booking.delete({
      where: { id }
    });
  }
}
