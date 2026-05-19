/**
 * File: index.ts (DTOs)
 * What it is doing: Defines Data Transfer Objects (DTOs) using Zod schemas for input validation and TypeScript types for development.
 * Responsibility: Enforcing strict data shape, type, and rule validations (like min lengths, formats) before data reaches the controller or database.
 * Outcomes: Prevents invalid or malicious data from being processed and provides strong type inference for developers.
 */
import { z } from "zod";
import { Role, ListingType, BookingStatus, UserStatus } from "@prisma/client";

// =======================
// User Schemas
// =======================

export const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.nativeEnum(Role).optional().default(Role.GUEST),
  avatar: z.string().url().nullish(),
  bio: z.string().max(500).nullish(),
});

export const updateUserSchema = createUserSchema.partial().extend({
  status: z.nativeEnum(UserStatus).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

export type CreateUserDTO = z.infer<typeof createUserSchema>;
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;
export type ForgotPasswordDTO = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDTO = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordDTO = z.infer<typeof changePasswordSchema>;

// =======================
// Listing Schemas
// =======================

export const createListingSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(2, "Location is required"),
  pricePerNight: z.number().positive("Price must be a positive number"),
  guests: z.number().int().min(1, "Must allow at least 1 guest"),
  type: z.nativeEnum(ListingType),
  amenities: z.array(z.string()).min(1, "At least one amenity is required"),
});

export const updateListingSchema = createListingSchema.partial();

export type CreateListingDTO = z.infer<typeof createListingSchema>;
export type UpdateListingDTO = z.infer<typeof updateListingSchema>;

// =======================
// Booking Schemas
// =======================

export const createBookingSchema = z.object({
  checkIn: z.string().datetime("Invalid check-in date"),
  checkOut: z.string().datetime("Invalid check-out date"),
  listingId: z.string().min(1, "Listing ID is required"),
});

export type CreateBookingDTO = z.infer<typeof createBookingSchema>;

// =======================
// Review Schemas
// =======================

export const createReviewSchema = z.object({
  rating: z
    .number()
    .int("Rating must be an integer")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5"),
  comment: z.string().min(5, "Comment must be at least 5 characters"),
});

export type CreateReviewDTO = z.infer<typeof createReviewSchema>;

// =======================
// Response Interfaces
// =======================

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  username: string;
  phone: string;
  role: Role;
  avatar?: string | null;
  bio?: string | null;
  createdAt: Date;
}

export interface ListingDTO {
  id: string;
  title: string;
  description: string;
  location: string;
  pricePerNight: number;
  guests: number;
  type: ListingType;
  amenities: string[];
  rating?: number | null;
  hostId: string;
  createdAt: Date;
  updatedAt: Date;
}

// =======================
// SWAGGER COMPONENTS (Consolidated)
// =======================

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateUserDTO:
 *       type: object
 *       required: [name, email, username, phone, password]
 *       properties:
 *         name: { type: string, example: "Jane Smith" }
 *         email: { type: string, example: "jane.smith@example.com" }
 *         username: { type: string, example: "janesmith_traveler" }
 *         phone: { type: string, example: "+250788123456" }
 *         password: { type: string, example: "secret123" }
 *         role: { type: string, enum: [HOST, GUEST], example: "HOST" }
 *     LoginDTO:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email: { type: string, example: "jane.smith@example.com" }
 *         password: { type: string, example: "secret123" }
 *     CreateListingDTO:
 *       type: object
 *       required: [title, description, location, pricePerNight, guests, type, amenities]
 *       properties:
 *         title: { type: string, example: "Cozy Beach House" }
 *         description: { type: string, example: "A beautiful house by the beach." }
 *         location: { type: string, example: "Malibu, CA" }
 *         pricePerNight: { type: number, example: 250 }
 *         guests: { type: integer, example: 4 }
 *         type: { type: string, enum: [APARTMENT, HOUSE, VILLA, CABIN], example: "HOUSE" }
 *         amenities: { type: array, items: { type: string }, example: ["WiFi", "Pool"] }
 *     UpdateListingDTO:
 *       type: object
 *       properties:
 *         title: { type: string, example: "Updated Beach House" }
 *         pricePerNight: { type: number, example: 300 }
 *     CreateBookingDTO:
 *       type: object
 *       required: [listingId, checkIn, checkOut]
 *       properties:
 *         listingId: { type: string, example: "clxyz123abc" }
 *         checkIn: { type: string, format: date-time, example: "2025-08-01T14:00:00Z" }
 *         checkOut: { type: string, format: date-time, example: "2025-08-07T11:00:00Z" }
 *     CreateReviewDTO:
 *       type: object
 *       required: [rating, comment]
 *       properties:
 *         rating: { type: integer, minimum: 1, maximum: 5, example: 5 }
 *         comment: { type: string, example: "Amazing stay!" }
 *     User:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         name: { type: string }
 *         email: { type: string }
 *         role: { type: string, enum: [GUEST, HOST, ADMIN] }
 *         avatar: { type: string, nullable: true }
 *         bio: { type: string, nullable: true }
 *     Listing:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         title: { type: string }
 *         pricePerNight: { type: number }
 *         type: { type: string, enum: [APARTMENT, HOUSE, VILLA, CABIN] }
 *     Booking:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         status: { type: string, enum: [PENDING, CONFIRMED, CANCELLED] }
 *         totalPrice: { type: number }
 */
