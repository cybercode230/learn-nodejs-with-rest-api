import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'airbnb_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const savedUser = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.warn('AsyncStorage not available for Auth');
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    // Mock login delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate a mock JWT token
    const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ id: '1', email }))}.mock_signature`;

    const mockUser: User = {
      id: '1',
      email,
      name: email.split('@')[0],
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop',
      bio: 'Travel enthusiast and food lover.',
      token: mockToken,
    };
    
    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockUser));
    } catch (e) {}
    
    setUser(mockUser);
    setIsLoading(false);
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ id: '2', email }))}.mock_signature`;

    const mockUser: User = {
      id: '2',
      email,
      name,
      token: mockToken,
    };
    
    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockUser));
    } catch (e) {}
    
    setUser(mockUser);
    setIsLoading(false);
  }, []);

  const updateUser = useCallback(async (data: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...data };
    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
    } catch (e) {}
    setUser(updatedUser);
  }, [user]);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {}
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading, 
      login, 
      signup, 
      updateUser,
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
