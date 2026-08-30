// SUNMA CERAMIC Backend API - Production Hardened
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { config } from './config';
import { errorHandler } from './middleware/error';
import { csrfProtection } from './middleware/csrf';
import { apiLimiter, authLimiter, refreshLimiter, orderLimiter } from './middleware/rateLimit';

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

export { apiLimiter, authLimiter, refreshLimiter, orderLimiter };

const app = express();
app.set('trust proxy', 1); // Trust first proxy (Render / Vercel load balancers) so express-rate-limit reads actual client IP

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
        connectSrc: ["'self'", 'https://*.supabase.co', config.frontendUrl, 'https://sunma-ceramic.vercel.app'],
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

// 5. Apply general API rate limiter to all API endpoints
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
