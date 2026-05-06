import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import { ENDPOINTS } from '../../../api/endpoints';
import { useAuth } from '../../../contexts/AuthContext';
import type { LoginPayload, AuthResponse } from '../types/auth.types';

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (payload: LoginPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post<AuthResponse>(ENDPOINTS.AUTH.LOGIN, payload);
      const { token, user } = response.data;
      
      login(token, user);
      navigate('/');
      return { success: true };
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleLogin,
    isLoading,
    error,
    setError
  };
};
