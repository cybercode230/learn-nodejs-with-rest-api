import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import { ENDPOINTS } from '../../../api/endpoints';
import { useAuth } from '../../../contexts/AuthContext';
import type { RegisterPayload, AuthResponse } from '../types/auth.types';

export const useRegister = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (payload: RegisterPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post<AuthResponse>(ENDPOINTS.AUTH.REGISTER, payload);
      const { token, user } = response.data;
      
      login(token, user);
      navigate('/');
      return { success: true };
    } catch (err: any) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleRegister,
    isLoading,
    error,
    setError
  };
};
