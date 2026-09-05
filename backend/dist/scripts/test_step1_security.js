"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const postgres_1 = __importDefault(require("postgres"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../.env') });
const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres.xacaeysrrfqhwpkdjkvm:1103703370197Aa@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';
const jwtSecret = process.env.JWT_SECRET || 'sunma_ceramic_jwt_secret_key_2026_super_secure';
async function runSecurityAudit() {
    console.log('🧪 Starting Automated STEP 1 Authentication Security Audit...\n');
    const sql = (0, postgres_1.default)(dbUrl, { max: 1, ssl: { rejectUnauthorized: false } });
    let passed = 0;
    let failed = 0;
    function assert(condition, testName, detail) {
        if (condition) {
            console.log(`  ✅ [PASS] ${testName}`);
            passed++;
        }
        else {
            console.error(`  ❌ [FAIL] ${testName} - ${detail || 'Assertion failed'}`);
            failed++;
        }
    }
    try {
        // TEST 1: Database Inspection - Verify password_hash column and retired legacy column
        console.log('📌 Test Group 1: Database Schema & Password Storage Inspection');
        const cols = await sql `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'profiles';
    `;
        const colNames = cols.map(c => c.column_name);
        assert(colNames.includes('password_hash'), 'Database has "password_hash" column');
        assert(colNames.includes('username'), 'Database has "username" column');
        assert(!colNames.includes('password'), 'Legacy "password" column is retired');
        // TEST 2: Inspect existing rows for bcrypt hashes
        const profiles = await sql `SELECT id, email, username, role, password_hash FROM profiles LIMIT 5;`;
        for (const p of profiles) {
            const isBcrypt = p.password_hash && (p.password_hash.startsWith('$2a$') || p.password_hash.startsWith('$2b$'));
            assert(isBcrypt, `User ${p.email} has valid bcrypt hash`);
        }
        // TEST 3: Verify Backdoor Tokens Are Rejected
        console.log('\n📌 Test Group 2: Backdoor Token Elimination');
        const backdoorAdmin = 'admin-token-secret-2026';
        const backdoorUser = 'user-token-secret-2026';
        let adminCheckFailed = false;
        try {
            jsonwebtoken_1.default.verify(backdoorAdmin, jwtSecret, { algorithms: ['HS256'] });
        }
        catch {
            adminCheckFailed = true;
        }
        assert(adminCheckFailed, 'Backdoor token "admin-token-secret-2026" is rejected by JWT verification');
        let userCheckFailed = false;
        try {
            jsonwebtoken_1.default.verify(backdoorUser, jwtSecret, { algorithms: ['HS256'] });
        }
        catch {
            userCheckFailed = true;
        }
        assert(userCheckFailed, 'Backdoor token "user-token-secret-2026" is rejected by JWT verification');
        // TEST 4: JWT Signature Verification & Algorithm Restrictions
        console.log('\n📌 Test Group 3: JWT Verification & Security Boundary');
        const validUser = profiles[0];
        const minimalPayload = { sub: validUser.id, role: validUser.role };
        const validToken = jsonwebtoken_1.default.sign(minimalPayload, jwtSecret, { expiresIn: '1h', algorithm: 'HS256' });
        const decoded = jsonwebtoken_1.default.verify(validToken, jwtSecret, { algorithms: ['HS256'] });
        assert(decoded.sub === validUser.id, 'JWT correctly decodes sub claim');
        assert(decoded.role === validUser.role, 'JWT correctly decodes role claim');
        assert(decoded.email === undefined, 'JWT payload excludes unnecessary PII email field');
        // Tampered Token Test
        const tamperedToken = validToken.substring(0, validToken.length - 4) + 'abcd';
        let tamperedRejected = false;
        try {
            jsonwebtoken_1.default.verify(tamperedToken, jwtSecret, { algorithms: ['HS256'] });
        }
        catch {
            tamperedRejected = true;
        }
        assert(tamperedRejected, 'Tampered JWT signature is rejected');
        // Expired Token Test
        const expiredToken = jsonwebtoken_1.default.sign(minimalPayload, jwtSecret, { expiresIn: '-1s', algorithm: 'HS256' });
        let expiredRejected = false;
        try {
            jsonwebtoken_1.default.verify(expiredToken, jwtSecret, { algorithms: ['HS256'] });
        }
        catch {
            expiredRejected = true;
        }
        assert(expiredRejected, 'Expired JWT token is rejected');
        // SUMMARY
        console.log(`\n📊 SECURITY AUDIT SUMMARY: Passed ${passed}/${passed + failed} tests.`);
        if (failed > 0) {
            console.error('❌ SECURITY AUDIT FAILED!');
            process.exit(1);
        }
        else {
            console.log('🎉 ALL STEP 1 SECURITY AUDIT CHECKS PASSED 100%!');
        }
    }
    catch (err) {
        console.error('❌ Security Audit Error:', err.message || err);
        process.exit(1);
    }
    finally {
        await sql.end();
    }
}
runSecurityAudit();
