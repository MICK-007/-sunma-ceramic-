import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { config } from '../config';

const ALLOWED_ORIGINS = [
  'https://sunma-ceramic.vercel.app',
  'https://sunma-ceramic-frontend.vercel.app',
  'http://localhost:3000',
  config.frontendUrl,
].map(url => url.toLowerCase().replace(/\/$/, ''));

export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function setCsrfCookie(res: Response, token: string) {
  res.cookie('sunma_csrf', token, {
    httpOnly: false, // Must be readable by frontend JS to attach X-CSRF-Token header
    secure: true, // Required for cross-site cookies in modern browsers
    sameSite: 'none', // Required for cross-domain requests between Vercel and Render
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // Only apply to state-changing requests
  const stateChangingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  if (!stateChangingMethods.includes(req.method.toUpperCase())) {
    return next();
  }

  // Exempt auth routes
  const path = req.path.toLowerCase();
  if (path.includes('/auth/login') || path.includes('/auth/register') || path.includes('/auth/refresh')) {
    return next();
  }

  // 1. Strict Origin / Referer Validation
  const origin = req.headers.origin || req.headers.referer;
  if (origin) {
    try {
      const parsedOrigin = new URL(origin).origin.toLowerCase();
      const isAllowed =
        ALLOWED_ORIGINS.some(allowed => allowed === parsedOrigin) ||
        parsedOrigin.endsWith('.vercel.app') ||
        parsedOrigin.includes('sunma-ceramic');
      if (!isAllowed) {
        return res.status(403).json({
          success: false,
          message: 'CSRF Protection: Forbidden origin.',
        });
      }
    } catch {
      return res.status(403).json({
        success: false,
        message: 'CSRF Protection: Malformed Origin/Referer header.',
      });
    }
  }

  // 2. Double Submit Cookie Verification
  const headerToken = req.headers['x-csrf-token'] as string;
  const cookieToken = req.cookies?.sunma_csrf;

  if (headerToken && cookieToken && headerToken === cookieToken) {
    return next();
  }

  // If request has valid session cookie or Authorization header from authenticated user, proceed safely
  if (req.cookies?.sunma_access_token || req.headers.authorization) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'CSRF Protection: Invalid or missing CSRF token.',
  });
}
