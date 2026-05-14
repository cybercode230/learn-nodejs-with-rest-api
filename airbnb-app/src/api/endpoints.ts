/**
 * Centralized API endpoints for the entire application.
 * Aligned with Backend v1 API structure.
 */

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    VALIDATE_RESET_TOKEN: (token: string) => `/auth/validate-reset-token/${token}`,
    RESET_PASSWORD: (token: string) => `/auth/reset-password/${token}`,
    CHANGE_PASSWORD: '/auth/change-password',
    LOGOUT: '/auth/logout',
  },
  LISTINGS: {
    BASE: '/listings',
    SEARCH: '/listings/search',
    STATS: '/listings/stats',
    HISTORY: '/listings/history',
    DETAILS: (id: string) => `/listings/${id}`,
    PHOTOS: (id: string) => `/listings/${id}/photos`,
    PHOTO: (listingId: string, photoId: string) => `/listings/${listingId}/photos/${photoId}`,
    REVIEWS: (id: string) => `/listings/${id}/reviews`,
  },
  AI: {
    SEARCH: '/ai/search',
    CHAT: '/ai/chat',
    RECOMMEND: '/ai/recommend',
    REVIEW_SUMMARY: (id: string) => `/ai/listings/${id}/review-summary`,
  },
  BOOKINGS: {
    BASE: '/bookings',
    BY_ID: (id: string) => `/bookings/${id}`,
    STATUS: (id: string) => `/bookings/${id}/status`,
    BY_LISTING: (listingId: string) => `/bookings/listing/${listingId}`,
  },
  USERS: {
    BASE: '/users',
    STATS: '/users/stats',
    PROFILE: (id: string) => `/users/${id}`,
    BY_ID: (id: string) => `/users/${id}`,
    AVATAR: (id: string) => `/users/${id}/avatar`,
    LISTINGS: (id: string) => `/users/${id}/listings`,
    BOOKINGS: (id: string) => `/users/${id}/bookings`,
    HOST_BOOKINGS: (id: string) => `/users/${id}/host-bookings`,
    ROLE: (id: string) => `/users/${id}/role`,
  },
  PROFILE: {
    BASE: '/profile',
    UPLOAD: '/profile/upload',
  },
  REVIEWS: {
    BASE: '/reviews',
    BY_ID: (id: string) => `/reviews/${id}`,
  }
};
