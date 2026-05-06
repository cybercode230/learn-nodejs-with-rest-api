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
  },
  AI: {
    SEARCH: '/ai/search',
  },
  BOOKINGS: {
    BASE: '/bookings',
    BY_ID: (id: string) => `/bookings/${id}`,
  },
  USERS: {
    BASE: '/users',
    PROFILE: (id: string) => `/users/${id}`,
  },
};
