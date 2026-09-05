"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderLimiter = exports.refreshLimiter = exports.authLimiter = exports.apiLimiter = void 0;
// SUNMA CERAMIC Backend API - Production Hardened
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const config_1 = require("./config");
const error_1 = require("./middleware/error");
const csrf_1 = require("./middleware/csrf");
const rateLimit_1 = require("./middleware/rateLimit");
Object.defineProperty(exports, "apiLimiter", { enumerable: true, get: function () { return rateLimit_1.apiLimiter; } });
Object.defineProperty(exports, "authLimiter", { enumerable: true, get: function () { return rateLimit_1.authLimiter; } });
Object.defineProperty(exports, "refreshLimiter", { enumerable: true, get: function () { return rateLimit_1.refreshLimiter; } });
Object.defineProperty(exports, "orderLimiter", { enumerable: true, get: function () { return rateLimit_1.orderLimiter; } });
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const category_routes_1 = __importDefault(require("./routes/category.routes"));
const brand_routes_1 = __importDefault(require("./routes/brand.routes"));
const cart_routes_1 = __importDefault(require("./routes/cart.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const wishlist_routes_1 = __importDefault(require("./routes/wishlist.routes"));
const promotion_routes_1 = __importDefault(require("./routes/promotion.routes"));
const room_routes_1 = __importDefault(require("./routes/room.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const cms_routes_1 = __importDefault(require("./routes/cms.routes"));
const app = (0, express_1.default)();
app.set('trust proxy', 1); // Trust first proxy (Render / Vercel load balancers) so express-rate-limit reads actual client IP
// 1. Safe Security Headers via Helmet (Explicit Origin Allowlist for Unsplash, Google Fonts, Supabase)
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
            imgSrc: ["'self'", 'data:', 'https://images.unsplash.com', 'https://*.supabase.co'],
            connectSrc: ["'self'", 'https://*.supabase.co', config_1.config.frontendUrl, 'https://sunma-ceramic.vercel.app'],
        },
    },
}));
// 2. Cookie Parser Middleware
app.use((0, cookie_parser_1.default)());
// 3. Strict Explicit CORS Allowlist
const ALLOWED_ORIGINS = [
    'https://sunma-ceramic.vercel.app',
    'http://localhost:3000',
    config_1.config.frontendUrl,
].map(url => url.toLowerCase().replace(/\/$/, ''));
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        const parsedOrigin = origin.toLowerCase().replace(/\/$/, '');
        if (ALLOWED_ORIGINS.includes(parsedOrigin)) {
            return callback(null, true);
        }
        else {
            return callback(new Error(`CORS policy error: Origin ${origin} is not allowed.`));
        }
    },
    credentials: true,
}));
// 4. Expanded Request Body Size Limit for Admin Image Base64 Uploads (20MB)
app.use(express_1.default.json({ limit: '20mb' }));
app.use(express_1.default.urlencoded({ limit: '20mb', extended: true }));
// 5. Apply general API rate limiter to all API endpoints
app.use('/api', rateLimit_1.apiLimiter);
// 6. Double Submit CSRF Protection Middleware
app.use(csrf_1.csrfProtection);
// Healthcheck
app.get('/api/health', (req, res) => {
    res.json({
        status: 'online',
        service: 'SUNMA CERAMIC REST API',
        buildVersion: '2026-09-05-v4',
        timestamp: new Date().toISOString(),
    });
});
// API Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/products', product_routes_1.default);
app.use('/api/categories', category_routes_1.default);
app.use('/api/brands', brand_routes_1.default);
app.use('/api/cart', cart_routes_1.default);
app.use('/api/orders', order_routes_1.default);
app.use('/api/wishlist', wishlist_routes_1.default);
app.use('/api/promotions', promotion_routes_1.default);
app.use('/api/rooms', room_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.use('/api/cms', cms_routes_1.default);
// Global Error Handler
app.use(error_1.errorHandler);
// Start Server
app.listen(config_1.config.port, () => {
    console.log(`\n==================================================`);
    console.log(`🏛️  SUNMA CERAMIC REST API Server running on port ${config_1.config.port}`);
    console.log(`🔗  Healthcheck: http://localhost:${config_1.config.port}/api/health`);
    console.log(`==================================================\n`);
});
