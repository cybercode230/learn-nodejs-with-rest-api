import type { Request, Response } from "express";
import { UserService } from "../services/user.service.js";
import { Prisma } from "../generated/prisma/index.js";

/**
 * @swagger
 * /airbnb/api/v1/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await UserService.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

/**
 * @swagger
 * /airbnb/api/v1/users/{id}:
 *   get:
 *     summary: Get user by ID with listings and bookings
 *     tags: [Users]
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
export const getUserById = async (req: Request, res: Response) => {
  try {
    const id = req.params["id"] as string;
    const user = await UserService.getUserById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

/**
 * @swagger
 * /airbnb/api/v1/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, username, phone]
 *             properties:
 *               name: { type: string, example: "Emmanuel Nsabimana" }
 *               email: { type: string, example: "emma.nsabi@example.rw" }
 *               username: { type: string, example: "emma_kgl" }
 *               phone: { type: string, example: "+250780000000" }
 *               role: { type: string, enum: [HOST, GUEST], example: "GUEST" }
 *               avatar: { type: string, example: "https://avatar.iran.liara.run/public/boy" }
 *               bio: { type: string, example: "Software developer from Kigali, eager to explore the country." }
 *     responses:
 *       201:
 *         description: User created
 *       409:
 *         description: Duplicate email or username
 */
export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, username, phone, role, avatar, bio } = req.body;

    if (!name || !email || !username || !phone) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newUser = await UserService.createUser({
      name,
      email,
      username,
      phone,
      role,
      avatar,
      bio
    });

    res.status(201).json(newUser);
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return res.status(409).json({ message: "Email or username already exists" });
      }
    }
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

/**
 * @swagger
 * /airbnb/api/v1/users/{id}:
 *   put:
 *     summary: Update user by ID
 *     tags: [Users]
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
 *             type: object
 *             properties:
 *               name: { type: string, example: "John Updated" }
 *               phone: { type: string, example: "+1987654321" }
 *     responses:
 *       200:
 *         description: User updated
 *       404:
 *         description: User not found
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = req.params["id"] as string;
    
    const existingUser = await UserService.getUserById(id);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = await UserService.updateUser(id, req.body);
    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

/**
 * @swagger
 * /airbnb/api/v1/users/{id}:
 *   delete:
 *     summary: Delete user by ID
 *     tags: [Users]
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
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = req.params["id"] as string;

    const existingUser = await UserService.getUserById(id);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    await UserService.deleteUser(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Something went wrong" });
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
export const getListingsByHost = async (req: Request, res: Response) => {
  try {
    const id = req.params["id"] as string;
    const listings = await UserService.getListingsByHost(id);
    res.json(listings);
  } catch (error) {
    console.error("Error fetching host listings:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

/**
 * @swagger
 * /airbnb/api/v1/users/{id}/bookings:
 *   get:
 *     summary: Get all bookings by guest ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of guest's bookings
 */
export const getBookingsByGuest = async (req: Request, res: Response) => {
  try {
    const id = req.params["id"] as string;
    const bookings = await UserService.getBookingsByGuest(id);
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching guest bookings:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
