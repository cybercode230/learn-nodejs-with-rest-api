import prisma from "../config/prisma.js";
import { generateId } from "../utils/idGenerator.js";
import { BookingStatus } from "../generated/prisma/index.js";
import { createBookingSchema } from "../dtos/index.js";

export class BookingService {
  static async getAllBookings() {
    return prisma.booking.findMany({
      include: {
        guest: {
          select: { name: true }
        },
        listing: {
          select: { title: true }
        }
      }
    });
  }

  static async getBookingById(id: string) {
    return prisma.booking.findUnique({
      where: { id },
      include: {
        guest: true,
        listing: true
      }
    });
  }

  static async createBooking(rawData: any) {
    const validatedData = createBookingSchema.parse(rawData);

    // Verify guest and listing exist
    const guest = await prisma.user.findUnique({ where: { id: validatedData.guestId } });
    if (!guest) throw new Error("GUEST_NOT_FOUND");

    const listing = await prisma.listing.findUnique({ where: { id: validatedData.listingId } });
    if (!listing) throw new Error("LISTING_NOT_FOUND");

    // Calculate total price server-side
    const start = new Date(validatedData.checkIn);
    const end = new Date(validatedData.checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) {
      throw new Error("INVALID_DATES");
    }

    const totalPrice = diffDays * listing.pricePerNight;

    return prisma.booking.create({
      data: {
        id: generateId(),
        checkIn: start,
        checkOut: end,
        totalPrice,
        status: BookingStatus.PENDING,
        guestId: validatedData.guestId,
        listingId: validatedData.listingId
      }
    });
  }

  static async updateBookingStatus(id: string, status: BookingStatus) {
    return prisma.booking.update({
      where: { id },
      data: { status }
    });
  }

  static async deleteBooking(id: string) {
    return prisma.booking.delete({
      where: { id }
    });
  }
}
