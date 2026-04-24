import type { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service.js";
import { createUserSchema, updateUserSchema } from "../dtos/index.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import { Role } from "../generated/prisma/index.js";

/**
 * @swagger
 * /airbnb/api/v1/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
export const getAllUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const users = await UserService.getAllUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /airbnb/api/v1/users/{id}:
 *   get:
 *     summary: Get user by ID with listings and bookings
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 */
export const getUserById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params["id"] as string;
    const user = await UserService.getUserById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /airbnb/api/v1/users:
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
 *       201:
 *         description: User created
 *       400:
 *         description: Validation error
 *       409:
 *         description: Duplicate email or username
 */
export const createUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const newUser = await UserService.createUser(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /airbnb/api/v1/users/{id}:
 *   put:
 *     summary: Update user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserDTO'
 *     responses:
 *       200:
 *         description: User updated
 *       403:
 *         description: Forbidden (Not the owner)
 *       404:
 *         description: User not found
 */
export const updateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params["id"] as string;

    if (id !== req.userId && req.role !== Role.ADMIN) {
      return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
    }

    const updatedUser = await UserService.updateUser(id, req.body);
    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /airbnb/api/v1/users/{id}:
 *   delete:
 *     summary: Delete user by ID (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: User deleted
 *       404:
 *         description: User not found
 */
export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params["id"] as string;
    await UserService.deleteUser(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /airbnb/api/v1/users/{id}/listings:
 *   get:
 *     summary: Get all listings by host ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of host's listings
 */
export const getListingsByHost = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params["id"] as string;
    const listings = await UserService.getListingsByHost(id);
    res.json(listings);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /airbnb/api/v1/users/{id}/bookings:
 *   get:
 *     summary: Get all bookings by guest ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of guest's bookings
 *       403:
 *         description: Forbidden (Not the owner)
 */
export const getBookingsByGuest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params["id"] as string;

    if (id !== req.userId && req.role !== Role.ADMIN) {
      return res.status(403).json({ message: "Forbidden: You can only view your own bookings" });
    }

    const bookings = await UserService.getBookingsByGuest(id);
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};
