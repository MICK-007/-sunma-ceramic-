import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

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

  // 3. Stateless Access Token verification (0 DB queries per request for maximum performance)
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

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'ADMIN') {
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
