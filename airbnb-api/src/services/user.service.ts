/**
 * File: user.service.ts
 * What it is doing: Manages business logic related to User entity operations.
 * Responsibility: Executing CRUD operations on user records, hashing passwords on update, and returning paginated bookings with listing details.
 * Outcomes: Returns user details, lists of users, or associated resources.
 */
import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";
import { generateId } from "../utils/idGenerator.js";
import { createUserSchema, updateUserSchema } from "../dtos/index.js";
import { cleanObject } from "../utils/cleanObject.js";

export class UserService {
  static async getAllUsers(options: { skip: number; take: number }) {
    // Fetch all users and count in parallel to optimize query performance
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip: options.skip,
        take: options.take,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          phone: true,
          role: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { listings: true, bookings: true } }
        }
      }),
      prisma.user.count()
    ]);
    return { data: users, total };
  }

  static async getUserById(id: string) {
    // Fetch a single user by their ID, including their listings and booking details with nested listing data
    return prisma.user.findUnique({
      where: { id },
      include: {
        listings: true,
        bookings: {
          include: {
            listing: { select: { title: true, location: true, type: true } }
          }
        }
      }
    });
  }

  static async createUser(rawData: any) {
    const validatedData = createUserSchema.parse(rawData);
    // Separate bio from user data as it belongs to the Profile model
    const { bio, ...userData } = validatedData;
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const userId = generateId();

    const user = await prisma.user.create({
      data: {
        id: userId,
        name: userData.name,
        email: userData.email,
        username: userData.username,
        phone: userData.phone,
        password: hashedPassword,
        role: userData.role || "GUEST",
        avatar: userData.avatar,
        profile: { 
          create: { 
            id: generateId(),
            bio: bio || null 
          } 
        }
      }
    });

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async updateUser(id: string, rawData: any) {
    const validatedData = updateUserSchema.parse(rawData);
    // Separate bio for nested profile update
    const { bio, ...userData } = validatedData;

    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...cleanObject(userData),
        // If bio is provided, update the associated profile record
        profile: bio !== undefined ? {
          update: { bio }
        } : undefined
      }
    });

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async deleteUser(id: string) {
    return prisma.user.delete({ where: { id } });
  }

  static async getListingsByHost(hostId: string) {
    return prisma.listing.findMany({
      where: { hostId },
      include: {
        _count: { select: { bookings: true } },
        photos: true
      }
    });
  }

  static async getBookingsByGuest(guestId: string, options: { skip?: number; take?: number } = {}) {
    // Retrieve all bookings made by a specific guest, with listing title and location
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where: { guestId },
        include: {
          listing: { select: { title: true, location: true, type: true } }
        },
        orderBy: { createdAt: "desc" },
        skip: options.skip,
        take: options.take
      }),
      prisma.booking.count({ where: { guestId } })
    ]);
    return { data: bookings, total };
  }
}
