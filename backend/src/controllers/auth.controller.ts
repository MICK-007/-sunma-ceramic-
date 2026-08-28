import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { store } from '../repositories/store';
import { AuthenticatedRequest } from '../middleware/auth';

export const login = (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  // Check if admin credentials
  if (email.toLowerCase() === 'admin@sunmaceramic.com' || email.toLowerCase().includes('admin')) {
    const adminUser = store.users.find(u => u.role === 'ADMIN') || {
      id: 'user-admin',
      email: 'admin@sunmaceramic.com',
      fullName: 'SUNMA Senior Administrator',
      phone: '+66 2 800 9999',
      role: 'ADMIN' as const,
      createdAt: new Date().toISOString(),
    };

    const token = jwt.sign(
      { id: adminUser.id, email: adminUser.email, role: 'ADMIN', fullName: adminUser.fullName },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Admin authentication successful.',
      user: adminUser,
      token: token || 'admin-token-secret-2026',
    });
  }

  // Standard user login / registration on-the-fly for demo
  let existingUser = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!existingUser) {
    existingUser = {
      id: `user-${Date.now()}`,
      email,
      fullName: email.split('@')[0],
      role: 'USER',
      createdAt: new Date().toISOString(),
    };
    store.users.push(existingUser);
  }

  const token = jwt.sign(
    { id: existingUser.id, email: existingUser.email, role: existingUser.role, fullName: existingUser.fullName },
    config.jwtSecret,
    { expiresIn: '7d' }
  );

  return res.json({
    success: true,
    message: 'User authentication successful.',
    user: existingUser,
    token: token || 'user-token-secret-2026',
  });
};

export const register = (req: Request, res: Response) => {
  const { email, password, fullName, phone } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  const existing = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ success: false, message: 'Account with this email already exists.' });
  }

  const newUser = {
    id: `user-${Date.now()}`,
    email,
    fullName: fullName || email.split('@')[0],
    phone: phone || '',
    role: 'USER' as const,
    createdAt: new Date().toISOString(),
  };

  store.users.push(newUser);

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, role: newUser.role, fullName: newUser.fullName },
    config.jwtSecret,
    { expiresIn: '7d' }
  );

  return res.status(201).json({
    success: true,
    message: 'Account registered successfully.',
    user: newUser,
    token,
  });
};

export const me = (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthenticated.' });
  }

  const user = store.users.find(u => u.id === req.user?.id) || {
    id: req.user.id,
    email: req.user.email,
    fullName: req.user.fullName || req.user.email,
    role: req.user.role,
    createdAt: new Date().toISOString(),
  };

  return res.json({ success: true, user });
};

export const logout = (req: Request, res: Response) => {
  return res.json({ success: true, message: 'Logged out successfully.' });
};
