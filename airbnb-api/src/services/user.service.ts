import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";
import { generateId } from "../utils/idGenerator.js";
import { createUserSchema, updateUserSchema, type CreateUserDTO, type UpdateUserDTO } from "../dtos/index.js";
import { cleanObject } from "../utils/cleanObject.js";

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

  static async createUser(rawData: any) {
    const validatedData = createUserSchema.parse(rawData);
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    
    const user = await prisma.user.create({
      data: cleanObject({
        ...validatedData,
        id: generateId(),
        password: hashedPassword,
        role: validatedData.role || "GUEST"
      })
    });
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async updateUser(id: string, rawData: any) {
    const validatedData = updateUserSchema.parse(rawData);
    
    if (validatedData.password) {
      validatedData.password = await bcrypt.hash(validatedData.password, 10);
    }
    
    const user = await prisma.user.update({
      where: { id },
      data: cleanObject(validatedData)
    });
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
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
