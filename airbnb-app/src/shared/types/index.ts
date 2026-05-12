export type Role = 'HOST' | 'GUEST' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  phone: string;
  role: Role;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export type ListingType = 'APARTMENT' | 'HOUSE' | 'VILLA' | 'CABIN';

export interface ListingPhoto {
  id: string;
  url: string;
  publicId: string;
  listingId: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  location: string;
  pricePerNight: number;
  guests: number;
  amenities: string[];
  rating?: number;
  createdAt: string;
  updatedAt: string;
  hostId: string;
  type: ListingType;
  photos: ListingPhoto[];
  host?: User;
  longitude?: number;
  latitude?: number;
  _count?: {
    bookings: number;
    reviews: number;
  };
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'REJECTED' | 'COMPLETED';

export interface Booking {
  id: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
  guestId: string;
  listingId: string;
  listing?: Listing;
  guest?: User;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  guestId: string;
  listingId: string;
  createdAt: string;
  guest?: User;
}
