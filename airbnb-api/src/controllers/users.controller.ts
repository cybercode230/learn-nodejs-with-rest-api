/**
 * File: users.controller.ts
 * What it is doing: Handles incoming HTTP requests related to user management.
 * Responsibility: Parsing request parameters/body, performing authorization checks, calling UserService, and sending appropriate HTTP responses.
 * Outcomes: Returns requested user data, paginated lists, stats, or success/error responses.
 */
import type { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service.js";
import { createUserSchema, updateUserSchema } from "../dtos/index.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import { Role } from "@prisma/client";
import prisma from "../config/prisma.js";
import jwt from "jsonwebtoken";
import { PushService } from "../services/push.service.js";
import { NotificationService } from "../services/notification.service.js";

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get all users (admin only, paginated)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 10 } }
 *     responses:
 *       200: { description: Paginated list of users }
 */
export const getAllUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const role = req.query.role as string;
    const search = req.query.search as string;

    const { data, total } = await UserService.getAllUsers({ 
      skip, 
      take: limit,
      role,
      search 
    });
    res.json({ data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
};

/**
 * @swagger
 * /api/v1/users/stats:
 *   get:
 *     summary: Get platform-wide user statistics
 *     description: Returns total user count and a breakdown by role. Cached for 5 minutes.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User stats
 *         content:
 *           application/json:
 *             example:
 *               totalUsers: 500
 *               byRole:
 *                 - role: "GUEST"
 *                   _count: { role: 350 }
 *                 - role: "HOST"
 *                   _count: { role: 140 }
 *                 - role: "ADMIN"
 *                   _count: { role: 10 }
 */
export const getUserStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Run total count and role breakdown in parallel — no sequential queries
    const [totalUsers, byRole, byStatus, totalBookings, totalListings, revenueData] = await Promise.all([
      prisma.user.count(),
      prisma.user.groupBy({
        by: ["role"],
        _count: { role: true },
        orderBy: { _count: { role: "desc" } }
      }),
      prisma.user.groupBy({
        by: ["status"],
        _count: { status: true },
        orderBy: { _count: { status: "desc" } }
      }),
      prisma.booking.count(),
      prisma.listing.count(),
      prisma.booking.aggregate({
        where: { status: { in: ["CONFIRMED", "COMPLETED"] as any } },
        _sum: { totalPrice: true }
      })
    ]);
    
    res.json({ 
      totalUsers, 
      byRole,
      byStatus,
      totalBookings,
      totalListings,
      revenue: revenueData?._sum?.totalPrice || 0
    });
  } catch (error) { next(error); }
};

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: User details }
 *       404: { description: User not found }
 */
export const getUserById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params["id"] as string;
    const user = await UserService.getUserById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) { next(error); }
};

/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     summary: Create a new user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserDTO'
 *     responses:
 *       201: { description: User created }
 *       400: { description: Validation error }
 *       409: { description: Duplicate email or username }
 */
export const createUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const newUser = await UserService.createUser(req.body);
    res.status(201).json(newUser);
  } catch (error) { next(error); }
};

/**
 * @swagger
 * /api/v1/users/{id}:
 *   put:
 *     summary: Update user by ID (own profile or admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserDTO'
 *     responses:
 *       200: { description: User updated }
 *       403: { description: Forbidden }
 *       404: { description: User not found }
 */
export const updateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params["id"] as string;
    if (id !== req.userId && req.role !== Role.ADMIN) {
      return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
    }
    const updatedUser = await UserService.updateUser(id, req.body);
    res.json(updatedUser);
  } catch (error) { next(error); }
};

/**
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     summary: Delete user by ID (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       204: { description: User deleted }
 *       404: { description: User not found }
 */
export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params["id"] as string;
    await UserService.deleteUser(id);
    res.status(204).send();
  } catch (error) { next(error); }
};

/**
 * @swagger
 * /api/v1/users/{id}/listings:
 *   get:
 *     summary: Get all listings by host ID
 *     tags: [Users]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: List of host's listings }
 */
export const getListingsByHost = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params["id"] as string;
    const listings = await UserService.getListingsByHost(id);
    res.json(listings);
  } catch (error) { next(error); }
};

/**
 * @swagger
 * /api/v1/users/{id}/bookings:
 *   get:
 *     summary: Get all bookings for a user (paginated)
 *     description: Returns the guest's bookings including listing title and location. Only the user themselves or an ADMIN can view.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 10 } }
 *     responses:
 *       200: { description: Paginated bookings with listing title and location }
 *       403: { description: You can only view your own bookings }
 *       404: { description: User not found }
 */
export const getBookingsByGuest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params["id"] as string;
    // Ownership check — only the user or an ADMIN can see their bookings
    if (id !== req.userId && req.role !== Role.ADMIN) {
      return res.status(403).json({ message: "Forbidden: You can only view your own bookings" });
    }
    // Verify the user exists before querying their bookings
    const userExists = await prisma.user.findUnique({ where: { id }, select: { id: true } });
    if (!userExists) return res.status(404).json({ message: "User not found" });

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const { data, total } = await UserService.getBookingsByGuest(id, { skip, take: limit });
    res.json({ data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
};

/**
 * @swagger
 * /api/v1/users/{id}/host-bookings:
 *   get:
 *     summary: Get all bookings for a host's listings (paginated)
 *     description: Returns bookings for all listings owned by the host. Only the host themselves or an ADMIN can view.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 10 } }
 *     responses:
 *       200: { description: Paginated bookings for host's listings }
 *       403: { description: You can only view bookings for your own listings }
 *       404: { description: User not found }
 */
export const getBookingsForHost = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params["id"] as string;
    // Authorization check — only the host themselves or an ADMIN
    if (id !== req.userId && req.role !== Role.ADMIN) {
      return res.status(403).json({ message: "Forbidden: You can only view bookings for your own listings" });
    }
    
    const userExists = await prisma.user.findUnique({ where: { id }, select: { role: true } });
    if (!userExists) return res.status(404).json({ message: "User not found" });
    if (userExists.role !== Role.HOST && req.role !== Role.ADMIN) {
      return res.status(403).json({ message: "Forbidden: Only hosts can access this endpoint" });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const { data, total } = await UserService.getBookingsForHost(id, { skip, take: limit });
    res.json({ data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
};

/**
 * Register push token for user
 */
export const registerPushToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: "Push token is required" });
    
    await PushService.registerToken(req.userId as string, token);
    res.json({ message: "Push token registered successfully" });
  } catch (error) { next(error); }
};

// Temporary in-memory / file-based storage for dev notification preferences
import fs from "fs";
import path from "path";
const PREFS_FILE = path.join(process.cwd(), "notification-preferences.json");

const loadPreferences = () => {
  try {
    if (fs.existsSync(PREFS_FILE)) {
      return JSON.parse(fs.readFileSync(PREFS_FILE, "utf-8"));
    }
  } catch (e) {
    console.error("Failed to load notification preferences file:", e);
  }
  return {};
};

const savePreferences = (prefs: any) => {
  try {
    fs.writeFileSync(PREFS_FILE, JSON.stringify(prefs, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to save notification preferences file:", e);
  }
};

export const getNotificationPreferences = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId as string;
    const allPrefs = loadPreferences();
    const userPrefs = allPrefs[userId] || {
      pushMessages: true,
      pushReminders: true,
      pushPromotions: false,
      emailMessages: true,
      emailReminders: true,
      emailPromotions: false,
    };
    res.json(userPrefs);
  } catch (error) { next(error); }
};

export const updateNotificationPreferences = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId as string;
    const newPrefs = req.body;
    const allPrefs = loadPreferences();
    allPrefs[userId] = {
      ...allPrefs[userId],
      ...newPrefs
    };
    savePreferences(allPrefs);
    res.json({ message: "Notification preferences updated", preferences: allPrefs[userId] });
  } catch (error) { next(error); }
};


/**
 * Get messages history between two users
 */
export const getChatMessages = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const otherUserId = req.params["otherUserId"] as string;
    const userId = req.userId as string;
    if (!otherUserId) return res.status(400).json({ error: "otherUserId is required" });

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId }
        ]
      },
      orderBy: { createdAt: "asc" }
    });

    res.json(messages);
  } catch (error) { next(error); }
};

/**
 * Get users list for messaging thread inbox
 * Guests see hosts they booked with. Hosts see guests who booked with them.
 */
export const getChatUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId as string;
    const userRole = req.role as Role;

    if (userRole === Role.HOST) {
      // Find all bookings for host listings
      const hostBookings = await prisma.booking.findMany({
        where: {
          listing: { hostId: userId }
        },
        select: {
          guest: {
            select: { id: true, name: true, email: true, avatar: true }
          },
          listing: {
            select: { title: true }
          }
        }
      });

      // Group by unique guest
      const uniqueGuestsMap = new Map();
      hostBookings.forEach((b) => {
        if (!b.guest) return;
        const exists = uniqueGuestsMap.get(b.guest.id);
        if (exists) {
          exists.listings.add(b.listing.title);
        } else {
          uniqueGuestsMap.set(b.guest.id, {
            id: b.guest.id,
            name: b.guest.name,
            email: b.guest.email,
            avatar: b.guest.avatar,
            role: "GUEST",
            listings: new Set([b.listing.title])
          });
        }
      });

      const data = Array.from(uniqueGuestsMap.values()).map(g => ({
        ...g,
        listings: Array.from(g.listings)
      }));

      return res.json(data);
    } else {
      // Guest: find all bookings made by this guest
      const guestBookings = await prisma.booking.findMany({
        where: { guestId: userId },
        select: {
          listing: {
            select: {
              title: true,
              host: {
                select: { id: true, name: true, email: true, avatar: true }
              }
            }
          }
        }
      });

      // Group by unique host
      const uniqueHostsMap = new Map();
      guestBookings.forEach((b) => {
        if (!b.listing?.host) return;
        const host = b.listing.host;
        const exists = uniqueHostsMap.get(host.id);
        if (exists) {
          exists.listings.add(b.listing.title);
        } else {
          uniqueHostsMap.set(host.id, {
            id: host.id,
            name: host.name,
            email: host.email,
            avatar: host.avatar,
            role: "HOST",
            listings: new Set([b.listing.title])
          });
        }
      });

      const data = Array.from(uniqueHostsMap.values()).map(h => ({
        ...h,
        listings: Array.from(h.listings)
      }));

      return res.json(data);
    }
  } catch (error) { next(error); }
};

/**
 * Switch account role between GUEST and HOST
 */
export const switchUserRole = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId as string;
    const currentUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!currentUser) return res.status(404).json({ message: "User not found" });

    const newRole = currentUser.role === Role.HOST ? Role.GUEST : Role.HOST;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole }
    });

    // Sign a new token
    const token = jwt.sign(
      { id: updatedUser.id, email: updatedUser.email, role: updatedUser.role },
      process.env.JWT_SECRET || "super-secret-key-change-in-production",
      { expiresIn: "7d" }
    );

    res.json({
      message: `Successfully switched to ${newRole.toLowerCase()} mode`,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar
      },
      token
    });

    // Notify admins in background (don't await)
    NotificationService.sendToAdmins({
      title: "User Role Switched 🔄",
      body: `${updatedUser.name} switched their profile to ${newRole} mode`,
      type: "admin_role_switch",
      data: { userId: updatedUser.id, newRole },
    }).catch(err => console.error("Failed to send admin role switch notification:", err));

  } catch (error) { next(error); }
};

