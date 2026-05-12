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
    const [totalUsers, byRole, totalBookings, totalListings, revenueData] = await Promise.all([
      prisma.user.count(),
      prisma.user.groupBy({
        by: ["role"],
        _count: { role: true },
        orderBy: { _count: { role: "desc" } }
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

