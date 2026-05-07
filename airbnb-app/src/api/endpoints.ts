/**
 * Centralized API endpoints for the entire application.
 */

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    VALIDATE_RESET_TOKEN: (token: string) => `/auth/validate-reset-token/${token}`,
    RESET_PASSWORD: (token: string) => `/auth/reset-password/${token}`,
  },
  LISTINGS: {
    BASE: '/listings',
    SEARCH: '/listings/search',
    DETAILS: (id: string) => `/listings/${id}`,
    PHOTOS: (id: string) => `/listings/${id}/photos`,
    PHOTO: (listingId: string, photoId: string) => `/listings/${listingId}/photos/${photoId}`,
    REVIEWS: (id: string) => `/listings/${id}/reviews`,
  },
  AI: {
    SEARCH: '/ai/search',
  },
  BOOKINGS: {
    BASE: '/bookings',
    BY_ID: (id: string) => `/bookings/${id}`,
    STATUS: (id: string) => `/bookings/${id}/status`,
    BY_LISTING: (listingId: string) => `/bookings/listing/${listingId}`,
  },
  USERS: {
    BASE: '/users',
    PROFILE: (id: string) => `/users/${id}`,
  },
};
