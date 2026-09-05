"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalUser = exports.requireAdmin = exports.authenticateUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const db_1 = require("../db");
const authenticateUser = (req, res, next) => {
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
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret, { algorithms: ['HS256'] });
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
    }
    catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid or expired session token.' });
    }
};
exports.authenticateUser = authenticateUser;
// requireAdmin: Performs Real-Time Database Re-Verification to eliminate JWT role staleness
const requireAdmin = async (req, res, next) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    // Real-Time DB Role Lookup
    const sql = (0, db_1.getDbClient)();
    if (sql) {
        try {
            const rows = await sql `
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
        }
        catch (err) {
            console.error('Error during real-time admin role verification:', err);
            if (sql)
                await sql.end().catch(() => { });
        }
    }
    // Fallback check against req.user.role if DB query failed
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ success: false, message: 'Access denied. Administrator privileges required.' });
    }
    next();
};
exports.requireAdmin = requireAdmin;
const optionalUser = (req, res, next) => {
    let token = req.cookies?.sunma_access_token;
    if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }
    }
    if (token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret, { algorithms: ['HS256'] });
            const userId = decoded.sub || decoded.id;
            if (userId && decoded.role) {
                req.user = {
                    id: userId,
                    email: decoded.email || '',
                    role: decoded.role,
                    fullName: decoded.fullName,
                };
            }
        }
        catch {
            // Ignore invalid token on optional route
        }
    }
    next();
};
exports.optionalUser = optionalUser;
