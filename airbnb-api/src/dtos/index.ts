import { z } from "zod";
import { Role, ListingType, BookingStatus } from "../generated/prisma/index.js";

// User Schemas
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

export const updateUserSchema = createUserSchema.partial();

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type CreateUserDTO = z.infer<typeof createUserSchema>;
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;

// Listing Schemas
export const createListingSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(2, "Location is required"),
  pricePerNight: z.number().positive("Price must be a positive number"),
  guests: z.number().int().min(1, "Must allow at least 1 guest"),
  type: z.nativeEnum(ListingType),
  amenities: z.array(z.string()).min(1, "At least one amenity is required"),
  hostId: z.string().uuid("Invalid Host ID format"),
});

export const updateListingSchema = createListingSchema.omit({ hostId: true }).partial();

export type CreateListingDTO = z.infer<typeof createListingSchema>;
export type UpdateListingDTO = z.infer<typeof updateListingSchema>;

// Booking Schemas
export const createBookingSchema = z.object({
  checkIn: z.string().datetime("Invalid check-in date"),
  checkOut: z.string().datetime("Invalid check-out date"),
  guestId: z.string().uuid("Invalid Guest ID format"),
  listingId: z.string().uuid("Invalid Listing ID format"),
});

export type CreateBookingDTO = z.infer<typeof createBookingSchema>;

// Response DTOs (can remain as interfaces or be inferred from Prisma)
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
