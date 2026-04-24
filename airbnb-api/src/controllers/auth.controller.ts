import { type Request,type Response, type NextFunction } from "express";
import { AuthService } from "../services/auth.service.js";
import type{ AuthRequest } from "../middlewares/auth.middleware.js";
import prisma from "../config/prisma.js";

/**
 * @swagger
 * /airbnb/api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserDTO'
 *     responses:
 *       201:
 *         description: User registered successfully
 */
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await AuthService.register(req.body);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /airbnb/api/v1/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginDTO'
 *     responses:
 *       200:
 *         description: Login successful
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AuthService.login(req.body);
    res.json(result);
  } catch (error) {
    if ((error as Error).message === "INVALID_CREDENTIALS") {
      return res.status(401).json({ status: "error", message: "Invalid email or password" });
    }
    next(error);
  }
};

/**
 * @swagger
 * /airbnb/api/v1/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 */
export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        profile: true,
        listings: req.role === "HOST",
        bookings: req.role === "GUEST"
      }
    });

    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
};
