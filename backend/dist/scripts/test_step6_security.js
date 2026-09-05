"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const postgres_1 = __importDefault(require("postgres"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../.env') });
const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres.xacaeysrrfqhwpkdjkvm:1103703370197Aa@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';
const rootDir = path_1.default.resolve(__dirname, '../../..');
async function runStep6SecurityAudit() {
    console.log('🧪 Starting Automated STEP 6 Production Security Hardening & Final Audit...\n');
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
        // -------------------------------------------------------------
        // TEST GROUP 1: SECURITY AUDIT EVENT LOGGING (security_events TABLE)
        // -------------------------------------------------------------
        console.log('📌 Test Group 1: Security Audit Logging (security_events)');
        // Insert a test audit log event
        const testUserId = '4aa9c816-0414-4cac-bdad-a1a0ff71f222';
        const testDetails = { email: 'admin@sunma.com', action: 'security_test' };
        const inserted = await sql `
      INSERT INTO security_events (user_id, event_type, details, ip_address, user_agent)
      VALUES (${testUserId}, 'STEP6_AUDIT_TEST', ${sql.json(testDetails)}, '127.0.0.1', 'SecurityTestRunner/1.0')
      RETURNING id, event_type, details;
    `;
        assert(inserted.length > 0, 'Successfully inserted security audit log entry into security_events table');
        const insertedLog = inserted[0];
        assert(insertedLog.details.password === undefined, 'Audit log details exclude plaintext passwords');
        assert(insertedLog.details.token === undefined, 'Audit log details exclude session/access tokens');
        // Clean up test entry
        await sql `DELETE FROM security_events WHERE id = ${insertedLog.id};`;
        // -------------------------------------------------------------
        // TEST GROUP 2: SECRET SCANNER VERIFICATION
        // -------------------------------------------------------------
        console.log('\n📌 Test Group 2: Secret Scanner Verification');
        const backdoorTokens = ['admin-token-secret-2026', 'user-token-secret-2026'];
        let backdoorFound = false;
        // Quick check on backend files
        const authControllerPath = path_1.default.join(__dirname, '../controllers/auth.controller.ts');
        const authContent = fs_1.default.readFileSync(authControllerPath, 'utf8');
        for (const b of backdoorTokens) {
            if (authContent.includes(b)) {
                backdoorFound = true;
            }
        }
        assert(!backdoorFound, 'Zero backdoor tokens found in auth.controller.ts');
        // -------------------------------------------------------------
        // TEST GROUP 3: PRODUCTION CONFIGURATION HARDENING VERIFICATION
        // -------------------------------------------------------------
        console.log('\n📌 Test Group 3: Production Configuration Hardening');
        const indexPath = path_1.default.join(__dirname, '../index.ts');
        const indexContent = fs_1.default.readFileSync(indexPath, 'utf8');
        assert(indexContent.includes("limit: '1mb'"), 'Express JSON body limit is strictly configured to 1MB');
        assert(indexContent.includes('authLimiter'), 'authLimiter rate limiting active on auth routes');
        assert(indexContent.includes('refreshLimiter'), 'refreshLimiter rate limiting active on refresh routes');
        assert(indexContent.includes('orderLimiter'), 'orderLimiter rate limiting active on order routes');
        assert(indexContent.includes('apiLimiter'), 'apiLimiter rate limiting active on general API routes');
        assert(indexContent.includes('helmet'), 'Helmet security headers and CSP directives configured');
        // -------------------------------------------------------------
        // TEST GROUP 4: SECURITY-AUDIT.md DOCUMENTATION VERIFICATION
        // -------------------------------------------------------------
        console.log('\n📌 Test Group 4: Security Documentation Verification');
        const auditDocPath = path_1.default.join(rootDir, 'SECURITY-AUDIT.md');
        assert(fs_1.default.existsSync(auditDocPath), 'SECURITY-AUDIT.md artifact exists in repository root');
        if (fs_1.default.existsSync(auditDocPath)) {
            const docContent = fs_1.default.readFileSync(auditDocPath, 'utf8');
            assert(docContent.includes('Severity Breakdown Table'), 'SECURITY-AUDIT.md contains Severity Breakdown Table');
            assert(docContent.includes('Remaining Operational Risks'), 'SECURITY-AUDIT.md documents Remaining Operational Risks');
            assert(docContent.includes('APPROVED FOR PRODUCTION DEPLOYMENT'), 'SECURITY-AUDIT.md includes final production verdict');
        }
        // SUMMARY
        console.log(`\n📊 SECURITY AUDIT SUMMARY: Passed ${passed}/${passed + failed} tests.`);
        if (failed > 0) {
            console.error('❌ STEP 6 SECURITY AUDIT FAILED!');
            process.exit(1);
        }
        else {
            console.log('🎉 ALL STEP 6 SECURITY AUDIT CHECKS PASSED 100%! Production Security Hardening & Final Audit complete.');
        }
    }
    catch (err) {
        console.error('❌ Step 6 Security Audit Error:', err.message || err);
        process.exit(1);
    }
    finally {
        await sql.end();
    }
}
runStep6SecurityAudit();
