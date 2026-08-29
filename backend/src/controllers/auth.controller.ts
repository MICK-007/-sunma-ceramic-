import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config';
import { store } from '../repositories/store';
import { AuthenticatedRequest } from '../middleware/auth';
import { getDbClient } from '../db';

export const login = async (req: Request, res: Response) => {
  const { email, username, password } = req.body;
  const rawIdentifier = (email || username || '').trim();
  const identifier = rawIdentifier.toLowerCase();

  if (!identifier || !password) {
    return res.status(400).json({
      success: false,
      message: 'กรุณากรอกอีเมล/ชื่อผู้ใช้ และรหัสผ่าน',
    });
  }

  let dbUser: any = null;

  // 1. Primary DB Query: Query Supabase PostgreSQL by LOWER(email) or LOWER(username)
  const sql = getDbClient();
  if (sql) {
    try {
      const rows = await sql`
        SELECT id, email, username, full_name as "fullName", phone, role, password_hash as "passwordHash", created_at as "createdAt"
        FROM profiles
        WHERE LOWER(email) = ${identifier} OR LOWER(username) = ${identifier}
        LIMIT 1
      `;
      await sql.end();

      if (rows && rows.length > 0) {
        dbUser = rows[0];
      }
    } catch (dbErr) {
      console.error('Supabase query error during login:', dbErr);
    }
  }

  // Generic authentication failure response to prevent user enumeration
  const genericAuthError = {
    success: false,
    message: 'อีเมล/ชื่อผู้ใช้ หรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง',
  };

  if (!dbUser || !dbUser.passwordHash) {
    return res.status(401).json(genericAuthError);
  }

  // 2. Strict bcrypt password verification
  try {
    const isPasswordValid = await bcrypt.compare(password, dbUser.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json(genericAuthError);
    }
  } catch (bcryptErr) {
    console.error('Bcrypt comparison error:', bcryptErr);
    return res.status(401).json(genericAuthError);
  }

  // 3. Issue minimal short-lived JWT Access Token
  const token = jwt.sign(
    {
      sub: dbUser.id,
      role: dbUser.role,
    },
    config.jwtSecret,
    {
      expiresIn: config.jwtExpiresIn as any,
      algorithm: 'HS256',
    }
  );

  // 4. Return sanitized user object without password or passwordHash
  return res.json({
    success: true,
    message: 'User authentication successful.',
    user: {
      id: dbUser.id,
      email: dbUser.email,
      username: dbUser.username || dbUser.email.split('@')[0],
      fullName: dbUser.fullName || dbUser.email.split('@')[0],
      phone: dbUser.phone || '',
      role: dbUser.role,
      createdAt: dbUser.createdAt ? new Date(dbUser.createdAt).toISOString() : new Date().toISOString(),
    },
    token,
  });
};

export const register = async (req: Request, res: Response) => {
  const { email, username, password, fullName, phone } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'กรุณากรอกอีเมลและรหัสผ่าน' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = (fullName || cleanEmail.split('@')[0]).trim();
  
  // Basic Server-side validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({ success: false, message: 'รูปแบบอีเมลไม่ถูกต้อง' });
  }

  if (password.length < 8) {
    return res.status(400).json({ success: false, message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร' });
  }

  // Derive unique username if not provided
  let cleanUsername = (username || cleanEmail.split('@')[0]).trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
  if (!cleanUsername) cleanUsername = 'user';

  const roleStr = cleanEmail.includes('admin') ? 'ADMIN' : 'USER';

  // 1. Check existing user & Insert into Supabase PostgreSQL
  const sql = getDbClient();
  if (!sql) {
    return res.status(500).json({ success: false, message: 'Database connection failure.' });
  }

  try {
    // Check duplicate email or username
    const existing = await sql`
      SELECT id, email, username FROM profiles 
      WHERE LOWER(email) = ${cleanEmail} OR LOWER(username) = ${cleanUsername}
      LIMIT 1
    `;

    if (existing && existing.length > 0) {
      await sql.end();
      return res.status(400).json({
        success: false,
        message: 'อีเมลหรือชื่อผู้ใช้นี้ถูกลงทะเบียนไว้แล้ว กรุณาเข้าสู่ระบบด้วยรหัสผ่านของคุณ',
      });
    }

    // Hash password with bcryptjs
    const passwordHash = await bcrypt.hash(password, config.bcryptRounds);

    const insertedRows = await sql`
      INSERT INTO profiles (email, username, phone, role, full_name, password_hash)
      VALUES (${cleanEmail}, ${cleanUsername}, ${phone || ''}, ${roleStr}::user_role, ${cleanName}, ${passwordHash})
      RETURNING id, email, username, full_name as "fullName", phone, role, created_at as "createdAt";
    `;
    await sql.end();

    const createdUser = insertedRows[0];

    // Return sanitized response (No password or password_hash!)
    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      user: {
        id: createdUser.id,
        email: createdUser.email,
        username: createdUser.username,
        fullName: createdUser.fullName || cleanName,
        phone: createdUser.phone || '',
        role: createdUser.role,
        createdAt: createdUser.createdAt ? new Date(createdUser.createdAt).toISOString() : new Date().toISOString(),
      },
    });

  } catch (dbErr: any) {
    console.error('⚠️ Supabase error during registration:', dbErr);
    if (sql) await sql.end().catch(() => {});
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดขณะบันทึกข้อมูลเข้าสู่ฐานข้อมูล: ' + (dbErr?.message || dbErr),
    });
  }
};

export const me = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ success: false, message: 'Unauthenticated.' });
  }

  const sql = getDbClient();
  if (sql) {
    try {
      const rows = await sql`
        SELECT id, email, username, full_name as "fullName", phone, role, created_at as "createdAt"
        FROM profiles
        WHERE id = ${req.user.id}
        LIMIT 1
      `;
      await sql.end();
      if (rows && rows.length > 0) {
        return res.json({ success: true, user: rows[0] });
      }
    } catch (e) {
      console.error('Error in me controller:', e);
    }
  }

  return res.json({
    success: true,
    user: {
      id: req.user.id,
      email: req.user.email || '',
      role: req.user.role || 'USER',
    },
  });
};

export const logout = (req: Request, res: Response) => {
  return res.json({ success: true, message: 'Logged out successfully.' });
};
