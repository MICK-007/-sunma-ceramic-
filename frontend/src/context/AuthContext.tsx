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

const DEFAULT_USERS = [
  {
    email: 'admin@sunma.com',
    password: 'admin1234',
    fullName: 'SUNMA Executive Admin',
    phone: '02-800-9999',
    role: 'ADMIN' as const,
  },
  {
    email: 'prachakchai.srimala@gmail.com',
    password: 'password123',
    fullName: 'dil',
    phone: '0000000000',
    role: 'USER' as const,
  },
  {
    email: 'woonsen240506@gmail.com',
    password: 'password123',
    fullName: 'woon',
    phone: '0000000000',
    role: 'USER' as const,
  },
  {
    email: 'architect@studio-lux.com',
    password: 'password123',
    fullName: 'Somchai Studio Lux',
    phone: '081-234-5678',
    role: 'USER' as const,
  },
];

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load persistent registered users from localStorage
  const getRegisteredUsers = () => {
    if (typeof window === 'undefined') return DEFAULT_USERS;
    const stored = localStorage.getItem('sunma_registered_users');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Ensure default Supabase users exist
        const merged = [...parsed];
        for (const defU of DEFAULT_USERS) {
          if (!merged.some((u: any) => u.email.toLowerCase() === defU.email.toLowerCase())) {
            merged.push(defU);
          }
        }
        localStorage.setItem('sunma_registered_users', JSON.stringify(merged));
        return merged;
      } catch (e) {}
    }
    localStorage.setItem('sunma_registered_users', JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  };

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

      // If backend explicitly returned a message (e.g. Account not found or Invalid password), return it directly!
      if (res.message) {
        return { success: false, message: res.message };
      }

      // Offline / Local Storage Fallback Check
      const registered = getRegisteredUsers();
      const cleanInput = email.trim().toLowerCase();
      const match = registered.find(
        (u: any) =>
          u.email.toLowerCase() === cleanInput ||
          (u.fullName && u.fullName.toLowerCase() === cleanInput)
      );

      if (!match) {
        return {
          success: false,
          message: 'ไม่พบบัญชีผู้ใช้นี้ในระบบ กรุณาตรวจสอบชื่อผู้ใช้/อีเมล หรือสมัครสมาชิกใหม่',
        };
      }

      // Enforce strict password checking
      if (match.password && match.password !== password) {
        return {
          success: false,
          message: 'รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง',
        };
      }

      const mockUser: User = {
        id: match.id || 'user-' + Date.now(),
        email: match.email,
        fullName: match.fullName || match.email.split('@')[0],
        phone: match.phone || '',
        role: match.role || (match.email.includes('admin') ? 'ADMIN' : 'USER'),
      };
      const mockToken = 'auth-token-' + Date.now();
      setToken(mockToken);
      setUser(mockUser);
      localStorage.setItem('sunma_auth_token', mockToken);
      localStorage.setItem('sunma_auth_user', JSON.stringify(mockUser));
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message || 'Server error during login.' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName?: string, phone?: string) => {
    setIsLoading(true);
    try {
      // 1. Send registration request to Backend & Supabase Database first
      const res = await api.register(email, password, fullName, phone);

      if (res.message && !res.success) {
        return { success: false, message: res.message };
      }

      const registered = getRegisteredUsers();
      const cleanEmail = email.trim().toLowerCase();
      const cleanName = (fullName || cleanEmail.split('@')[0]).trim();

      const newUser = {
        id: res.user?.id || `user-${Date.now()}`,
        email: cleanEmail,
        password,
        fullName: cleanName,
        phone: phone || '',
        role: cleanEmail.includes('admin') ? ('ADMIN' as const) : ('USER' as const),
      };

      // Save to registered storage for fallback, but require user to log in explicitly via /login
      const updatedList = registered.filter((u: any) => u.email.toLowerCase() !== cleanEmail);
      updatedList.push(newUser);

      if (typeof window !== 'undefined') {
        localStorage.setItem('sunma_registered_users', JSON.stringify(updatedList));
      }

      return { success: true };
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
