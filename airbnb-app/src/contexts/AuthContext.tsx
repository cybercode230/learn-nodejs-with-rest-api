import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../shared/types';
import { encrypt, decrypt } from '../shared/utils/encryption';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Auth: Check localStorage and verify with backend
  useEffect(() => {
    const initAuth = async () => {
      const encryptedToken = localStorage.getItem('token');
      const encryptedUser = localStorage.getItem('user');

      if (encryptedToken && encryptedUser) {
        try {
          const decryptedToken = decrypt(encryptedToken);
          const decryptedUser = decrypt(encryptedUser);
          
          if (decryptedToken && decryptedUser) {
            const parsedUser = JSON.parse(decryptedUser);
            setToken(decryptedToken);
            setUser(parsedUser);
          }
        } catch (error) {
          console.error('Failed to restore auth session:', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = (newToken: string, newUser: User) => {
    const encryptedToken = encrypt(newToken);
    const encryptedUser = encrypt(JSON.stringify(newUser));
    
    setToken(newToken);
    setUser(newUser);
    
    localStorage.setItem('token', encryptedToken);
    localStorage.setItem('user', encryptedUser);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout, 
      isAuthenticated: !!token, 
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
