import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import prisma from "../config/prisma.js";
import { generateId } from "../utils/idGenerator.js";
import { loginSchema, createUserSchema } from "../dtos/index.js";

const JWT_SECRET = process.env["JWT_SECRET"] as string;

export class AuthService {
  static async register(rawData: any) {
    const validatedData = createUserSchema.parse(rawData);

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { username: validatedData.username }
        ]
      }
    });

    if (existingUser) {
      const error = new Error("User already exists");
      (error as any).code = "P2002"; // Simulate Prisma unique constraint error
      throw error;
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const user = await prisma.user.create({
      data: {
        ...validatedData,
        id: generateId(),
        password: hashedPassword,
        role: validatedData.role || "GUEST"
      }
    });

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async login(rawData: any) {
    const validatedData = loginSchema.parse(rawData);

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (!user) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const isMatch = await bcrypt.compare(validatedData.password, user.password);
    if (!isMatch) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
  }
}
