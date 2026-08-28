'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: 'USER' | 'ADMIN';
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (email: string, password: string, fullName?: string, phone?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('sunma_auth_token');
    const storedUser = localStorage.getItem('sunma_auth_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing cached user:', e);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, password);
      if (res.success && res.token) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('sunma_auth_token', res.token);
        localStorage.setItem('sunma_auth_user', JSON.stringify(res.user));
        return { success: true };
      }
      return { success: false, message: res.message || 'Login failed.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Server error during login.' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName?: string, phone?: string) => {
    setIsLoading(true);
    try {
      const res = await api.register(email, password, fullName, phone);
      if (res.success && res.token) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('sunma_auth_token', res.token);
        localStorage.setItem('sunma_auth_user', JSON.stringify(res.user));
        return { success: true };
      }
      return { success: false, message: res.message || 'Registration failed.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Server error during registration.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('sunma_auth_token');
    localStorage.removeItem('sunma_auth_user');
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
