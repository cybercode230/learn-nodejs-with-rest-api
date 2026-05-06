import type { User, Role } from '../../../shared/types';

/**
 * Payload for the login API
 */
export interface LoginPayload {
  email: string;
  password: string;
}

/**
 * Payload for the registration API
 */
export interface RegisterPayload {
  name: string;
  email: string;
  username: string;
  phone: string;
  password: string;
  role: Role;
  bio?: string;
}

/**
 * Payload for the forgot password API
 */
export interface ForgotPasswordPayload {
  email: string;
}

/**
 * Payload for the reset password API
 */
export interface ResetPasswordPayload {
  newPassword: string;
}

/**
 * Response from Auth APIs (login/register)
 */
export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}

/**
 * Generic success response
 */
export interface SuccessResponse {
  message: string;
  success: boolean;
}
