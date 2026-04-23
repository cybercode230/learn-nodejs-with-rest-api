import { Role, ListingType, BookingStatus } from "../generated/prisma/index.js";

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

export interface CreateUserDTO {
  name: string;
  email: string;
  username: string;
  phone: string;
  role?: Role;
  avatar?: string;
  bio?: string;
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

export interface CreateListingDTO {
  title: string;
  description: string;
  location: string;
  pricePerNight: number;
  guests: number;
  type: ListingType;
  amenities: string[];
  hostId: string;
}

export interface BookingDTO {
  id: string;
  checkIn: Date;
  checkOut: Date;
  totalPrice: number;
  status: BookingStatus;
  guestId: string;
  listingId: string;
  createdAt: Date;
}

export interface CreateBookingDTO {
  checkIn: string;
  checkOut: string;
  guestId: string;
  listingId: string;
}
