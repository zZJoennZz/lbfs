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
      const userData = response.data.user || response.data;
      setUser(userData);
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

      // Clear all auth state
      setUser(null);
      setError(null);

      // Clear any stored data
      if (typeof window !== 'undefined') {
        // Clear localStorage items if any
        localStorage.removeItem('user');
        localStorage.removeItem('session');

        // Clear cookies by setting expired dates
        document.cookie.split(';').forEach(function (c) {
          document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
        });
      }

      console.log('Logout completed, user state cleared');
    } catch (error) {
      console.error('Logout error:', error);

      // Even if API fails, clear local state
      setUser(null);

      // Still try to redirect
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }

      throw error;
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
