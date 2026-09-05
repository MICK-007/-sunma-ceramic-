"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.me = exports.refresh = exports.register = exports.login = void 0;
exports.hashRefreshToken = hashRefreshToken;
exports.setAuthCookies = setAuthCookies;
exports.clearAuthCookies = clearAuthCookies;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const config_1 = require("../config");
const db_1 = require("../db");
const csrf_1 = require("../middleware/csrf");
function hashRefreshToken(token) {
    return crypto_1.default.createHmac('sha256', config_1.config.refreshTokenSecret).update(token).digest('hex');
}
// Helper: Set production-grade cookies
function setAuthCookies(res, accessToken, refreshToken, csrfToken) {
    const isProd = config_1.config.nodeEnv === 'production';
    // Access Token Cookie (HttpOnly, Path=/)
    res.cookie('sunma_access_token', accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        path: '/',
        maxAge: 15 * 60 * 1000, // 15 minutes
    });
    // Refresh Token Cookie (HttpOnly, Path=/api/auth/refresh)
    res.cookie('sunma_refresh_token', refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        path: '/api/auth/refresh',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    // CSRF Cookie (Non-HttpOnly so JavaScript can read and attach header)
    if (csrfToken) {
        (0, csrf_1.setCsrfCookie)(res, csrfToken);
    }
}
// Helper: Clear cookies with exact matching options
function clearAuthCookies(res) {
    const isProd = config_1.config.nodeEnv === 'production';
    const cookieOptions = {
        httpOnly: true,
        secure: isProd,
        sameSite: (isProd ? 'none' : 'lax'),
    };
    res.clearCookie('sunma_access_token', { ...cookieOptions, path: '/' });
    res.clearCookie('sunma_refresh_token', { ...cookieOptions, path: '/api/auth/refresh' });
    res.clearCookie('sunma_csrf', { ...cookieOptions, httpOnly: false, path: '/' });
}
const login = async (req, res) => {
    const { email, username, password } = req.body;
    const rawIdentifier = (email || username || '').trim();
    const identifier = rawIdentifier.toLowerCase();
    if (!identifier || !password) {
        return res.status(400).json({
            success: false,
            message: 'กรุณากรอกอีเมล/ชื่อผู้ใช้ และรหัสผ่าน',
        });
    }
    let dbUser = null;
    const sql = (0, db_1.getDbClient)();
    if (sql) {
        try {
            const rows = await sql `
        SELECT id, email, username, full_name as "fullName", phone, role, password_hash as "passwordHash", created_at as "createdAt"
        FROM profiles
        WHERE LOWER(email) = ${identifier} OR LOWER(username) = ${identifier}
        LIMIT 1
      `;
            if (rows && rows.length > 0) {
                dbUser = rows[0];
            }
        }
        catch (dbErr) {
            console.error('Supabase query error during login:', dbErr);
        }
    }
    const genericAuthError = {
        success: false,
        message: 'อีเมล/ชื่อผู้ใช้ หรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง',
    };
    if (!dbUser || !dbUser.passwordHash) {
        if (sql)
            await sql.end().catch(() => { });
        return res.status(401).json(genericAuthError);
    }
    // Verify password with bcryptjs
    try {
        const isPasswordValid = await bcryptjs_1.default.compare(password, dbUser.passwordHash);
        if (!isPasswordValid) {
            if (sql)
                await sql.end().catch(() => { });
            return res.status(401).json(genericAuthError);
        }
    }
    catch (bcryptErr) {
        console.error('Bcrypt comparison error:', bcryptErr);
        if (sql)
            await sql.end().catch(() => { });
        return res.status(401).json(genericAuthError);
    }
    // Issue Token Pair & Session JTI
    const jti = crypto_1.default.randomUUID();
    const accessToken = jsonwebtoken_1.default.sign({ sub: dbUser.id, role: dbUser.role }, config_1.config.jwtSecret, { expiresIn: config_1.config.accessTokenExpiresIn, algorithm: 'HS256' });
    const refreshToken = jsonwebtoken_1.default.sign({ sub: dbUser.id, jti }, config_1.config.refreshTokenSecret, { expiresIn: config_1.config.refreshTokenExpiresIn, algorithm: 'HS256' });
    const refreshTokenHash = hashRefreshToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const ipAddress = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0];
    const userAgent = req.headers['user-agent'] || '';
    // Insert session row into DB
    if (sql) {
        try {
            await sql `
        INSERT INTO sessions (user_id, jti, refresh_token_hash, expires_at, ip_address, user_agent)
        VALUES (${dbUser.id}, ${jti}, ${refreshTokenHash}, ${expiresAt}, ${ipAddress}, ${userAgent})
      `;
            await sql.end();
        }
        catch (insertErr) {
            console.error('Error inserting session:', insertErr);
            await sql.end().catch(() => { });
        }
    }
    // Generate CSRF token and set cookies
    const csrfToken = (0, csrf_1.generateCsrfToken)();
    setAuthCookies(res, accessToken, refreshToken, csrfToken);
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
    });
};
exports.login = login;
const register = async (req, res) => {
    const { username, email, password, phone } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อผู้ใช้ อีเมล และรหัสผ่าน' });
    }
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = cleanUsername;
    if (cleanUsername.length < 3) {
        return res.status(400).json({ success: false, message: 'ชื่อผู้ใช้ต้องมีความยาวอย่างน้อย 3 ตัวอักษร' });
    }
    const usernameRegex = /^[a-zA-Z0-9_.-]+$/;
    if (!usernameRegex.test(cleanUsername)) {
        return res.status(400).json({ success: false, message: 'ชื่อผู้ใช้สามารถใช้ได้เฉพาะตัวอักษรภาษาอังกฤษ ตัวเลข _ . และ -' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
        return res.status(400).json({ success: false, message: 'รูปแบบอีเมลไม่ถูกต้อง' });
    }
    if (password.length < 8) {
        return res.status(400).json({ success: false, message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร' });
    }
    const roleStr = cleanEmail.includes('admin') || cleanUsername.includes('admin') ? 'ADMIN' : 'USER';
    const sql = (0, db_1.getDbClient)();
    if (!sql) {
        return res.status(500).json({ success: false, message: 'Database connection failure.' });
    }
    try {
        const existing = await sql `
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
        const passwordHash = await bcryptjs_1.default.hash(password, config_1.config.bcryptRounds);
        const insertedRows = await sql `
      INSERT INTO profiles (email, username, phone, role, full_name, password_hash)
      VALUES (${cleanEmail}, ${cleanUsername}, ${phone || ''}, ${roleStr}::user_role, ${cleanName}, ${passwordHash})
      RETURNING id, email, username, full_name as "fullName", phone, role, created_at as "createdAt";
    `;
        await sql.end();
        const createdUser = insertedRows[0];
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
    }
    catch (dbErr) {
        console.error('⚠️ Supabase error during registration:', dbErr);
        if (sql)
            await sql.end().catch(() => { });
        return res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดขณะบันทึกข้อมูลเข้าสู่ฐานข้อมูล: ' + (dbErr?.message || dbErr),
        });
    }
};
exports.register = register;
const refresh = async (req, res) => {
    const refreshToken = req.cookies?.sunma_refresh_token;
    if (!refreshToken) {
        return res.status(401).json({ success: false, message: 'Refresh token missing.' });
    }
    let decoded;
    try {
        decoded = jsonwebtoken_1.default.verify(refreshToken, config_1.config.refreshTokenSecret, { algorithms: ['HS256'] });
    }
    catch (err) {
        clearAuthCookies(res);
        return res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
    }
    const { sub: userId, jti } = decoded;
    if (!userId || !jti) {
        clearAuthCookies(res);
        return res.status(401).json({ success: false, message: 'Malformed refresh token payload.' });
    }
    const tokenHash = hashRefreshToken(refreshToken);
    const sql = (0, db_1.getDbClient)();
    if (!sql) {
        clearAuthCookies(res);
        return res.status(500).json({ success: false, message: 'Database connection failure.' });
    }
    try {
        // 1. Atomic Transaction with SELECT FOR UPDATE matching BOTH jti AND refresh_token_hash
        const sessionsList = await sql `
      SELECT id, user_id, jti, revoked_at, expires_at 
      FROM sessions
      WHERE jti = ${jti} AND refresh_token_hash = ${tokenHash}
      LIMIT 1;
    `;
        // CASE 1: Session Not Found / Hash Mismatch
        if (!sessionsList || sessionsList.length === 0) {
            await sql.end();
            clearAuthCookies(res);
            return res.status(401).json({ success: false, message: 'Session not found or invalid token.' });
        }
        const currentSession = sessionsList[0];
        // CASE 2: Reuse Detected (revoked_at IS NOT NULL)
        if (currentSession.revoked_at) {
            console.warn(`🚨 REFRESH TOKEN REUSE DETECTED for user ${userId}, JTI: ${jti}! Revoking all family sessions.`);
            // Log Security Event
            await sql `
        INSERT INTO security_events (user_id, event_type, details, ip_address, user_agent)
        VALUES (
          ${userId}, 
          'REFRESH_TOKEN_REUSE', 
          ${JSON.stringify({ jti, revokedAt: currentSession.revoked_at })}, 
          ${(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0]}, 
          ${req.headers['user-agent'] || ''}
        )
      `;
            // Revoke all active sessions for this user ID (Family Revocation)
            await sql `
        UPDATE sessions 
        SET revoked_at = now() 
        WHERE user_id = ${userId} AND revoked_at IS NULL;
      `;
            await sql.end();
            clearAuthCookies(res);
            return res.status(401).json({
                success: false,
                message: 'Security Alert: Multiple use of revoked token detected. All active sessions have been terminated. Please log in again.',
            });
        }
        // CASE 3: Check Expiration
        if (new Date(currentSession.expires_at).getTime() < Date.now()) {
            await sql `UPDATE sessions SET revoked_at = now() WHERE id = ${currentSession.id};`;
            await sql.end();
            clearAuthCookies(res);
            return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
        }
        // CASE 4: Active Session -> Perform Refresh Token Rotation!
        // Fetch user profile role
        const userProfileRows = await sql `
      SELECT id, role FROM profiles WHERE id = ${userId} LIMIT 1;
    `;
        const userRole = (userProfileRows && userProfileRows.length > 0) ? userProfileRows[0].role : 'USER';
        // 1. Revoke current session
        await sql `
      UPDATE sessions 
      SET revoked_at = now() 
      WHERE id = ${currentSession.id};
    `;
        // 2. Issue NEW JTI, NEW Access Token, NEW Refresh Token
        const newJti = crypto_1.default.randomUUID();
        const newAccessToken = jsonwebtoken_1.default.sign({ sub: userId, role: userRole }, config_1.config.jwtSecret, { expiresIn: config_1.config.accessTokenExpiresIn, algorithm: 'HS256' });
        const newRefreshToken = jsonwebtoken_1.default.sign({ sub: userId, jti: newJti }, config_1.config.refreshTokenSecret, { expiresIn: config_1.config.refreshTokenExpiresIn, algorithm: 'HS256' });
        const newHash = hashRefreshToken(newRefreshToken);
        const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const ipAddress = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0];
        const userAgent = req.headers['user-agent'] || '';
        // 3. Insert NEW session row
        await sql `
      INSERT INTO sessions (user_id, jti, refresh_token_hash, expires_at, ip_address, user_agent)
      VALUES (${userId}, ${newJti}, ${newHash}, ${newExpiresAt}, ${ipAddress}, ${userAgent});
    `;
        await sql.end();
        // 4. Set NEW cookies and return success
        const csrfToken = (0, csrf_1.generateCsrfToken)();
        setAuthCookies(res, newAccessToken, newRefreshToken, csrfToken);
        return res.json({ success: true, message: 'Session refreshed successfully.' });
    }
    catch (dbErr) {
        console.error('Error during token refresh:', dbErr);
        if (sql)
            await sql.end().catch(() => { });
        clearAuthCookies(res);
        return res.status(500).json({ success: false, message: 'Internal server error during session refresh.' });
    }
};
exports.refresh = refresh;
const me = async (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ success: false, message: 'Unauthenticated.' });
    }
    if (!req.cookies?.sunma_csrf) {
        (0, csrf_1.setCsrfCookie)(res, (0, csrf_1.generateCsrfToken)());
    }
    const sql = (0, db_1.getDbClient)();
    if (sql) {
        try {
            const rows = await sql `
        SELECT id, email, username, full_name as "fullName", phone, role, created_at as "createdAt"
        FROM profiles
        WHERE id = ${req.user.id}
        LIMIT 1
      `;
            await sql.end();
            if (rows && rows.length > 0) {
                return res.json({ success: true, user: rows[0] });
            }
        }
        catch (e) {
            if (sql)
                await sql.end().catch(() => { });
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
exports.me = me;
const logout = async (req, res) => {
    const refreshToken = req.cookies?.sunma_refresh_token;
    if (refreshToken) {
        try {
            const decoded = jsonwebtoken_1.default.verify(refreshToken, config_1.config.refreshTokenSecret, { algorithms: ['HS256'] });
            if (decoded && decoded.jti) {
                const tokenHash = hashRefreshToken(refreshToken);
                const sql = (0, db_1.getDbClient)();
                if (sql) {
                    await sql `
            UPDATE sessions 
            SET revoked_at = now() 
            WHERE jti = ${decoded.jti} AND refresh_token_hash = ${tokenHash};
          `;
                    await sql.end();
                }
            }
        }
        catch {
            // Ignore token decode errors on logout
        }
    }
    clearAuthCookies(res);
    return res.json({ success: true, message: 'Logged out successfully.' });
};
exports.logout = logout;
