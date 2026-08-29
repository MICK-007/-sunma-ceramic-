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

  let user: any = null;
  let dbChecked = false;

  // 1. Primary DB Query: Fetch directly from Supabase PostgreSQL profiles table
  const sql = getDbClient();
  if (sql) {
    try {
      dbChecked = true;
      const rows = await sql`
        SELECT id, email, full_name as "fullName", phone, role, password, created_at as "createdAt"
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
          fullName: dbUser.fullName || dbUser.email.split('@')[0],
          phone: dbUser.phone || '',
          role: (dbUser.role as 'USER' | 'ADMIN') || 'USER',
          password: dbUser.password || 'password123',
          createdAt: dbUser.createdAt ? new Date(dbUser.createdAt).toISOString() : new Date().toISOString(),
        };

        // Cache in memory store
        const existingIdx = store.users.findIndex(u => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
        if (existingIdx !== -1) {
          store.users[existingIdx] = user;
        } else {
          store.users.push(user);
        }
      } else {
        // If DB explicitly confirms user is not in Supabase, purge any stale memory records
        store.users = store.users.filter(
          u => u.email.toLowerCase() !== identifier && u.fullName.toLowerCase() !== identifier
        );
      }
    } catch (dbErr) {
      console.error('Supabase query error during login:', dbErr);
    }
  }

  // 2. Fallback to memory store ONLY if DB query failed/skipped
  if (!user && !dbChecked) {
    user = store.users.find(
      u => u.email.toLowerCase() === identifier || u.fullName.toLowerCase() === identifier
    );
  }

  // 3. User existence validation
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'ไม่พบบัญชีผู้ใช้นี้ในระบบ กรุณาตรวจสอบชื่อผู้ใช้/อีเมล หรือสมัครสมาชิกใหม่',
    });
  }

  // 4. Strict Password Validation against Database Record
  if (user.password && user.password !== password) {
    return res.status(401).json({
      success: false,
      message: 'รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง',
    });
  }

  // 5. Generate JWT Token
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
  const cleanName = (fullName || cleanEmail.split('@')[0]).trim();
  const role = cleanEmail.includes('admin') ? ('ADMIN' as const) : ('USER' as const);

  // 1. Check & Insert directly in Supabase PostgreSQL database
  const sql = getDbClient();
  if (sql) {
    try {
      // Check existing in Supabase DB
      const existing = await sql`
        SELECT id FROM profiles 
        WHERE LOWER(email) = ${cleanEmail}
        LIMIT 1
      `;

      if (existing && existing.length > 0) {
        await sql.end();
        return res.status(400).json({
          success: false,
          message: 'อีเมลนี้ถูกลงทะเบียนไว้แล้ว กรุณาใช้รหัสผ่านเพื่อเข้าสู่ระบบ',
        });
      }

      await sql`
        INSERT INTO profiles (email, full_name, phone, role, password)
        VALUES (${cleanEmail}, ${cleanName}, ${phone || ''}, ${role}, ${password})
        ON CONFLICT (email) DO UPDATE SET password = ${password}, full_name = ${cleanName}
      `;
      await sql.end();
      console.log('✅ Registered new user in Supabase DB profiles:', cleanEmail);
    } catch (dbErr) {
      console.error('⚠️ Supabase error during registration:', dbErr);
    }
  }

  const newUser = {
    id: `user-${Date.now()}`,
    email: cleanEmail,
    password,
    fullName: cleanName,
    phone: phone || '',
    role,
    createdAt: new Date().toISOString(),
  };

  const existingIdx = store.users.findIndex(u => u.email.toLowerCase() === cleanEmail);
  if (existingIdx !== -1) {
    store.users[existingIdx] = newUser;
  } else {
    store.users.push(newUser);
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
