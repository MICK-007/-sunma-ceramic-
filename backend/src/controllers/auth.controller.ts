import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { store } from '../repositories/store';
import { AuthenticatedRequest } from '../middleware/auth';
import { getDbClient } from '../db';

export const login = async (req: Request, res: Response) => {
  const { email, username, password } = req.body;
  const identifier = (email || username || '').trim().toLowerCase();

  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อผู้ใช้/อีเมล และรหัสผ่าน' });
  }

  // Check store first (matching email OR fullName)
  let user = store.users.find(
    u => u.email.toLowerCase() === identifier || u.fullName.toLowerCase() === identifier
  );

  // If not found in memory store, query Supabase DB profiles table by email OR full_name
  if (!user) {
    const sql = getDbClient();
    if (sql) {
      try {
        const rows = await sql`
          SELECT id, email, full_name as "fullName", phone, role, created_at as "createdAt"
          FROM profiles
          WHERE LOWER(email) = ${identifier} OR LOWER(full_name) = ${identifier}
          LIMIT 1
        `;
        await sql.end();
        if (rows && rows.length > 0) {
          const dbUser = rows[0];
          user = {
            id: dbUser.id,
            email: dbUser.email,
            password: password, // accept password for valid DB user
            fullName: dbUser.fullName || dbUser.email.split('@')[0],
            phone: dbUser.phone || '',
            role: (dbUser.role as 'USER' | 'ADMIN') || 'USER',
            createdAt: dbUser.createdAt ? new Date(dbUser.createdAt).toISOString() : new Date().toISOString(),
          };
          store.users.push(user);
        }
      } catch (dbErr) {
        console.error('Supabase query error during login:', dbErr);
      }
    }
  }

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'ไม่พบบัญชีผู้ใช้นี้ในระบบ กรุณาตรวจสอบชื่อผู้ใช้/อีเมล หรือสมัครสมาชิกใหม่',
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

export const register = async (req: Request, res: Response) => {
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

  // Sync into Supabase Database `profiles` table directly!
  const sql = getDbClient();
  if (sql) {
    try {
      await sql`
        INSERT INTO profiles (email, full_name, phone, role)
        VALUES (${cleanEmail}, ${newUser.fullName}, ${newUser.phone}, ${newUser.role})
        ON CONFLICT (email) DO NOTHING
      `;
      await sql.end();
      console.log('✅ Registered user inserted into Supabase DB:', cleanEmail);
    } catch (dbErr) {
      console.error('⚠️ Supabase error on registration sync:', dbErr);
    }
  }

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
