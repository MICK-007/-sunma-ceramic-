import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { getDbClient } from '../db';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    role: 'USER' | 'ADMIN';
    fullName?: string;
  };
}

export const authenticateUser = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // 1. Read Access Token from HttpOnly Cookie FIRST
  let token = req.cookies?.sunma_access_token;

  // 2. Fallback to Authorization Bearer header
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
  }

  // 3. Stateless Access Token verification
  try {
    const decoded = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] }) as {
      sub?: string;
      id?: string;
      email?: string;
      role?: 'USER' | 'ADMIN';
      fullName?: string;
    };

    const userId = decoded.sub || decoded.id;
    if (!userId || !decoded.role) {
      return res.status(401).json({ success: false, message: 'Invalid token payload structure.' });
    }

    req.user = {
      id: userId,
      email: decoded.email || '',
      role: decoded.role,
      fullName: decoded.fullName,
    };
    return next();
  } catch (error: any) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session token.' });
  }
};

// requireAdmin: Performs Real-Time Database Re-Verification to eliminate JWT role staleness
export const requireAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  // Real-Time DB Role Lookup
  const sql = getDbClient();
  if (sql) {
    try {
      const rows = await sql`
        SELECT role FROM profiles WHERE id = ${req.user.id} LIMIT 1
      `;
      await sql.end();

      if (!rows || rows.length === 0 || rows[0].role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Administrator privileges required.',
        });
      }

      // Sync verified DB role
      req.user.role = 'ADMIN';
      return next();
    } catch (err) {
      console.error('Error during real-time admin role verification:', err);
      if (sql) await sql.end().catch(() => {});
    }
  }

  // Fallback check against req.user.role if DB query failed
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Access denied. Administrator privileges required.' });
  }

  next();
};

export const optionalUser = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  let token = req.cookies?.sunma_access_token;
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] }) as {
        sub?: string;
        id?: string;
        email?: string;
        role?: 'USER' | 'ADMIN';
        fullName?: string;
      };

      const userId = decoded.sub || decoded.id;
      if (userId && decoded.role) {
        req.user = {
          id: userId,
          email: decoded.email || '',
          role: decoded.role,
          fullName: decoded.fullName,
        };
      }
    } catch {
      // Ignore invalid token on optional route
    }
  }
  next();
};
