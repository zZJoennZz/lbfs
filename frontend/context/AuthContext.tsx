'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, getCurrentUser, login as apiLogin, logout as apiLogout, ensureCSRF } from '@/lib/api';
import axios from 'axios';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await ensureCSRF();
        await checkUser();
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const checkUser = async () => {
    try {
      const response = await getCurrentUser();
      setUser(response.data);
      setError(null);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        // User not logged in - this is expected
        setUser(null);
      } else {
        console.error('Error checking user:', error);
      }
    }
  };

  const login = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiLogin(username, password);
      // The response might be just the user object or contain a user property
      const userData = response.data.user || response.data;
      setUser(userData);

      // Verify login was successful
      await checkUser();
    } catch (error: any) {
      console.error('Login error:', error);
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.error || error.response.data.message || 'Login failed');
      } else {
        setError('An unexpected error occurred');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await apiLogout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return <AuthContext.Provider value={{ user, loading, error, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
