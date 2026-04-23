import type { Request, Response } from "express";
import { users, type User } from "../models/user.model.js";

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - username
 *         - phone
 *         - role
 *       properties:
 *         id:
 *           type: number
 *           description: The auto-generated id of the user
 *         name:
 *           type: string
 *           description: The user's name
 *         email:
 *           type: string
 *           description: The user's email
 *         username:
 *           type: string
 *           description: The user's username
 *         phone:
 *           type: string
 *           description: The user's phone number
 *         role:
 *           type: string
 *           enum: [host, guest]
 *           description: The user's role
 *         avatar:
 *           type: string
 *           description: The user's avatar URL
 *         bio:
 *           type: string
 *           description: The user's bio
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Returns the list of all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: The list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
export const getAllUsers = (req: Request, res: Response) => {
  res.json(users);
};

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The user id
 *     responses:
 *       200:
 *         description: The user description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
export const getUserById = (req: Request, res: Response) => {
  const id = parseInt(req.params["id"] as string);
  const user = users.find((u) => u.id === id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json(user);
};

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: The user was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Missing required fields
 */
export const createUser = (req: Request, res: Response) => {
  const { name, email, username, phone, role, avatar, bio } = req.body;

  if (!name || !email || !username || !phone || !role) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const newUser: User = {
    id: users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1,
    name,
    email,
    username,
    phone,
    role,
    avatar,
    bio
  };

  users.push(newUser);
  res.status(201).json(newUser);
};

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update an existing user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The user id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: The user was updated
 *       404:
 *         description: User not found
 */
export const updateUser = (req: Request, res: Response) => {
  const id = parseInt(req.params["id"] as string);
  const userIndex = users.findIndex((u) => u.id === id);

  if (userIndex === -1) {
    return res.status(404).json({ message: "User not found" });
  }

  const updatedUser = { ...users[userIndex], ...req.body, id };
  users[userIndex] = updatedUser as User;
  res.json(updatedUser);
};

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The user id
 *     responses:
 *       204:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
export const deleteUser = (req: Request, res: Response) => {
  const id = parseInt(req.params["id"] as string);
  const userIndex = users.findIndex((u) => u.id === id);

  if (userIndex === -1) {
    return res.status(404).json({ message: "User not found" });
  }

  users.splice(userIndex, 1);
  res.status(204).send();
};
