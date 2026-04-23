import prisma from "../config/prisma.js";
import { generateId } from "../utils/idGenerator.js";
import { Prisma } from "../generated/prisma/index.js";

export class UserService {
  static async getAllUsers() {
    return prisma.user.findMany({
      include: {
        _count: {
          select: { listings: true }
        }
      }
    });
  }

  static async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        listings: true,
        bookings: {
          include: { listing: true }
        }
      }
    });
  }

  static async createUser(data: {
    name: string;
    email: string;
    username: string;
    phone: string;
    role?: "HOST" | "GUEST";
    avatar?: string;
    bio?: string;
  }) {
    return prisma.user.create({
      data: {
        ...data,
        id: generateId(),
        role: data.role || "GUEST"
      }
    });
  }

  static async updateUser(id: string, data: any) {
    return prisma.user.update({
      where: { id },
      data
    });
  }

  static async deleteUser(id: string) {
    return prisma.user.delete({
      where: { id }
    });
  }

  static async getListingsByHost(hostId: string) {
    return prisma.listing.findMany({
      where: { hostId }
    });
  }

  static async getBookingsByGuest(guestId: string) {
    return prisma.booking.findMany({
      where: { guestId },
      include: { listing: true }
    });
  }
}
