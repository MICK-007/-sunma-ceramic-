import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { store } from '../repositories/store';
import { AuthenticatedRequest } from '../middleware/auth';

export const login = (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'กรุณากรอกอีเมลและรหัสผ่าน' });
  }

  const cleanEmail = email.trim().toLowerCase();

  // Find user in database
  const user = store.users.find(u => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'อีเมลนี้ยังไม่ได้ลงทะเบียนในระบบ กรุณากดลงทะเบียนสมัครสมาชิกก่อนเข้าสู่ระบบ',
    });
  }

  // Validate password
  if (user.password && user.password !== password) {
    return res.status(401).json({
      success: false,
      message: 'รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง',
    });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, fullName: user.fullName },
    config.jwtSecret,
    { expiresIn: '7d' }
  );

  return res.json({
    success: true,
    message: 'User authentication successful.',
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
    },
    token,
  });
};

export const register = (req: Request, res: Response) => {
  const { email, password, fullName, phone } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'กรุณากรอกอีเมลและรหัสผ่าน' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const existing = store.users.find(u => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return res.status(400).json({ success: false, message: 'อีเมลนี้ถูกลงทะเบียนไว้แล้ว กรุณาเข้าสู่ระบบ' });
  }

  const newUser = {
    id: `user-${Date.now()}`,
    email: cleanEmail,
    password,
    fullName: fullName || cleanEmail.split('@')[0],
    phone: phone || '',
    role: cleanEmail.includes('admin') ? ('ADMIN' as const) : ('USER' as const),
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
    user: {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
      phone: newUser.phone,
      role: newUser.role,
      createdAt: newUser.createdAt,
    },
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
