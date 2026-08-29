import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
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

// Security Headers via Helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// Cookie Parser Middleware
app.use(cookieParser());

// Strict Explicit CORS Allowlist (No Wildcards with credentials)
const ALLOWED_ORIGINS = [
  'https://sunma-ceramic.vercel.app',
  'http://localhost:3000',
  config.frontendUrl,
].map(url => url.toLowerCase().replace(/\/$/, ''));

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, curl, internal calls)
    if (!origin) return callback(null, true);

    const parsedOrigin = origin.toLowerCase().replace(/\/$/, '');
    if (ALLOWED_ORIGINS.includes(parsedOrigin)) {
      return callback(null, true);
    } else {
      return callback(new Error(`CORS policy error: Origin ${origin} is not allowed.`));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Double Submit CSRF Protection Middleware
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
