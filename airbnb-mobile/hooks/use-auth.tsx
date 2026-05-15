/**
 * @file use-auth.tsx
 * @description Global Authentication Provider using React Context and TanStack Query.
 * Features:
 * - Persistent session management using Expo SecureStore.
 * - Integration with the backend API for Login, Register, Logout, and Me.
 * - React Query for caching user data and handling loading/error states.
 * - Navigation protection hooks.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { secureStorage } from '@/lib/secure-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { useRouter } from 'expo-router';

// Types for Auth
export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  phone: string;
  role: 'GUEST' | 'HOST' | 'ADMIN';
  avatar: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  bio?: string;
  address?: string;
  profile?: {
    bio: string;
    address: string | null;
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  refetchUser: () => Promise<any>;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isInitializing, setIsInitializing] = useState(true);

  /**
   * TanStack Query: Fetch current user profile (Me)
   * This query automatically runs when a token is found in SecureStore.
   */
  const { 
    data: user, 
    isLoading: isUserLoading, 
    refetch: refetchUser,
  } = useQuery({
    queryKey: ['auth-user'],
    queryFn: async () => {
      const token = await secureStorage.getItem('auth_token');
      if (!token) return null;
      try {
        const response = await apiClient.get('/auth/me');
        return response.data;
      } catch (error) {
        // If "me" fails, token is likely invalid
        await secureStorage.deleteItem('auth_token');
        return null;
      }
    },
    enabled: !isInitializing, // Wait until we check if token exists on mount
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Check for token on mount
  useEffect(() => {
    const initAuth = async () => {
      setIsInitializing(false);
    };
    initAuth();
  }, []);

  /**
   * Login Mutation
   */
  const loginMutation = useMutation({
    mutationFn: async (credentials: any) => {
      const response = await apiClient.post('/auth/login', credentials);
      return response.data;
    },
    onSuccess: async (data) => {
      // ── GUEST AND HOST GATE ─────────────────────────────────────────────
      // The mobile app is for guests and hosts.
      // ADMIN accounts must use the web platform.
      if (data.user?.role !== 'GUEST' && data.user?.role !== 'HOST') {
        throw new Error(
          'Access denied. This app is for guests and hosts only.\n\nADMIN accounts must use the Airbnb web platform.'
        );
      }
      // ────────────────────────────────────────────────────────────────
      await secureStorage.setItem('auth_token', data.token);
      queryClient.setQueryData(['auth-user'], data.user);
      router.replace('/(tabs)');
    },
  });

  /**
   * Register Mutation
   */
  const registerMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    },
    onSuccess: () => {
      // Typically we might redirect to login or auto-login
      router.replace('/auth/login');
    },
  });

  /**
   * Logout Logic
   */
  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      // Even if logout fails on server, we clear locally
    } finally {
      await secureStorage.deleteItem('auth_token');
      queryClient.removeQueries({ queryKey: ['auth-user'] });
      queryClient.clear();
      router.replace('/auth/login');
    }
  };

  /**
   * Social Login Placeholder (Google)
   * Requires Expo AuthSession configuration
   */
  const loginWithGoogle = async () => {
    console.log('Google login triggered - Configuration needed in app.json');
    // Integration logic would go here using expo-auth-session
  };

  return (
    <AuthContext.Provider value={{
      user: user || null,
      isAuthenticated: !!user,
      isLoading: isUserLoading || isInitializing || loginMutation.isPending,
      login: async (data) => { await loginMutation.mutateAsync(data); },
      register: async (data) => { await registerMutation.mutateAsync(data); },
      logout,
      loginWithGoogle,
      refetchUser,
      updateUser: (data: Partial<User>) => {
        queryClient.setQueryData(['auth-user'], (old: User | null) => old ? { ...old, ...data } : null);
      },
    }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access Auth State
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
