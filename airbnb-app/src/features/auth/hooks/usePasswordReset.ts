import { useState } from 'react';
import api from '../../../api/axios';
import { ENDPOINTS } from '../../../api/endpoints';
import type { 
  ForgotPasswordPayload, 
  ResetPasswordPayload, 
  SuccessResponse 
} from '../types/auth.types';

export const usePasswordReset = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const forgotPassword = async (payload: ForgotPasswordPayload) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await api.post<SuccessResponse>(ENDPOINTS.AUTH.FORGOT_PASSWORD, payload);
      setSuccessMessage('If an account exists with this email, a reset link has been sent.');
      return { success: true };
    } catch (err: any) {
      // Backend might return 200 silently, but if it returns error:
      setError(err.response?.data?.message || 'Something went wrong.');
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const validateToken = async (token: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ valid: boolean }>(ENDPOINTS.AUTH.VALIDATE_RESET_TOKEN(token));
      return { success: true, valid: response.data.valid };
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired token.');
      return { success: false, valid: false };
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (token: string, payload: ResetPasswordPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.post<SuccessResponse>(ENDPOINTS.AUTH.RESET_PASSWORD(token), payload);
      setSuccessMessage('Password has been reset successfully. You can now log in.');
      return { success: true };
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password.');
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    forgotPassword,
    validateToken,
    resetPassword,
    isLoading,
    error,
    successMessage,
    setError
  };
};
