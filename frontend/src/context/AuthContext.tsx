'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export interface User {
  id: string;
  email: string;
  username?: string;
  fullName: string;
  phone?: string;
  role: 'USER' | 'ADMIN';
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (email: string, password: string, fullName?: string, phone?: string, username?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Restore session on load via HttpOnly Cookie (0 localStorage usage!)
        const res = await api.me();
        if (res && res.success && res.user) {
          setUser(res.user);
        } else {
          // Attempt seamless background refresh on page load
          const refreshRes = await api.refresh();
          if (refreshRes && refreshRes.success) {
            const meRes = await api.me();
            if (meRes && meRes.success && meRes.user) {
              setUser(meRes.user);
            }
          }
        }
      } catch (e) {
        console.error('Error initializing authentication session:', e);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (identifier: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(identifier, password);
      if (res && res.success && res.user) {
        setUser(res.user);
        return { success: true };
      }

      return {
        success: false,
        message: res.message || 'อีเมล/ชื่อผู้ใช้ หรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง',
      };
    } catch (err: any) {
      return { success: false, message: err.message || 'Server error during login.' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName?: string, phone?: string, username?: string) => {
    setIsLoading(true);
    try {
      const res = await api.register(email, password, fullName, phone, username);
      if (!res || !res.success) {
        return { success: false, message: res?.message || 'Registration failed.' };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message || 'Server error during registration.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.logout();
    } catch (err) {
      console.error('Error logging out:', err);
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  };

  const isAdmin = user?.role === 'ADMIN';
  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, register, logout, isAdmin }}>
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
