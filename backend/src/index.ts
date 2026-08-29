import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { errorHandler } from './middleware/error';
import { csrfProtection } from './middleware/csrf';

import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import categoryRoutes from './routes/category.routes';
import brandRoutes from './routes/brand.routes';
import cartRoutes from './routes/cart.routes';
import orderRoutes from './routes/order.routes';
import wishlistRoutes from './routes/wishlist.routes';
import promotionRoutes from './routes/promotion.routes';
import roomRoutes from './routes/room.routes';
import adminRoutes from './routes/admin.routes';

const app = express();

// 1. Safe Security Headers via Helmet (Explicit Origin Allowlist for Unsplash, Google Fonts, Supabase)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https://images.unsplash.com', 'https://*.supabase.co'],
        connectSrc: ["'self'", 'https://*.supabase.co', config.frontendUrl],
      },
    },
  })
);

// 2. Cookie Parser Middleware
app.use(cookieParser());

// 3. Strict Explicit CORS Allowlist
const ALLOWED_ORIGINS = [
  'https://sunma-ceramic.vercel.app',
  'http://localhost:3000',
  config.frontendUrl,
].map(url => url.toLowerCase().replace(/\/$/, ''));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const parsedOrigin = origin.toLowerCase().replace(/\/$/, '');
      if (ALLOWED_ORIGINS.includes(parsedOrigin)) {
        return callback(null, true);
      } else {
        return callback(new Error(`CORS policy error: Origin ${origin} is not allowed.`));
      }
    },
    credentials: true,
  })
);

// 4. Hardened Request Body Size Limit (1MB)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));

// 5. Rate Limiters Strategy
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login/register requests per IP
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // 30 refresh requests per 15m
  message: {
    success: false,
    message: 'Too many session refresh attempts. Please wait a few minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15, // 15 order creation requests per 15m
  message: {
    success: false,
    message: 'Too many order requests. Please wait a moment before creating another order.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500, // 500 read requests per 15m for Catalog & 3D Studio responsiveness
  message: {
    success: false,
    message: 'Rate limit exceeded. Please slow down your requests.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general API rate limiter to all API endpoints
app.use('/api', apiLimiter);

// 6. Double Submit CSRF Protection Middleware
app.use(csrfProtection);

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'SUNMA CERAMIC REST API',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handler
app.use(errorHandler);

// Start Server
app.listen(config.port, () => {
  console.log(`\n==================================================`);
  console.log(`🏛️  SUNMA CERAMIC REST API Server running on port ${config.port}`);
  console.log(`🔗  Healthcheck: http://localhost:${config.port}/api/health`);
  console.log(`==================================================\n`);
});
