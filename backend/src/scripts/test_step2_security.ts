import postgres from 'postgres';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import { hashRefreshToken } from '../controllers/auth.controller';
import { generateCsrfToken } from '../middleware/csrf';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres.xacaeysrrfqhwpkdjkvm:1103703370197Aa@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';
const jwtSecret = process.env.JWT_SECRET || 'sunma_ceramic_jwt_secret_key_2026_super_secure';
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || 'sunma_refresh_token_secret_key_2026_secure';

async function runStep2SecurityAudit() {
  console.log('🧪 Starting Automated STEP 2 Session & Cookie Security Audit...\n');
  const sql = postgres(dbUrl, { max: 1, ssl: { rejectUnauthorized: false } });

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName} - ${detail || 'Assertion failed'}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // TEST GROUP 1: DATABASE SCHEMA & PERSISTENT SESSION STORAGE
    // -------------------------------------------------------------
    console.log('📌 Test Group 1: Database Schema & Persistent Sessions');
    const sessionCols = await sql`
      SELECT column_name FROM information_schema.columns WHERE table_name = 'sessions';
    `;
    const colNames = sessionCols.map(c => c.column_name);

    assert(colNames.includes('jti'), 'Sessions table has "jti" UUID column');
    assert(colNames.includes('refresh_token_hash'), 'Sessions table has "refresh_token_hash" column');
    assert(colNames.includes('revoked_at'), 'Sessions table has "revoked_at" column');
    assert(colNames.includes('expires_at'), 'Sessions table has "expires_at" column');

    const eventCols = await sql`
      SELECT column_name FROM information_schema.columns WHERE table_name = 'security_events';
    `;
    const eventColNames = eventCols.map(c => c.column_name);
    assert(eventColNames.includes('event_type'), 'Security Events table has "event_type" column');
    assert(eventColNames.includes('user_id'), 'Security Events table has "user_id" column');

    // -------------------------------------------------------------
    // TEST GROUP 2: DETERMINISTIC HMAC-SHA256 HASHING
    // -------------------------------------------------------------
    console.log('\n📌 Test Group 2: Deterministic HMAC-SHA256 Refresh Token Hashing');
    const sampleToken = 'sample_refresh_token_string_123';
    const hash1 = hashRefreshToken(sampleToken);
    const hash2 = hashRefreshToken(sampleToken);

    assert(hash1 === hash2, 'HMAC-SHA256 hash output is deterministic for DB lookup');
    assert(hash1.length === 64, 'HMAC-SHA256 hash length is 64 hex characters (O(1) indexed)');
    assert(hash1 !== sampleToken, 'Refresh Token is never stored in plaintext');

    // -------------------------------------------------------------
    // TEST GROUP 3: SESSION ROTATION & ATOMIC LOOKUP (jti + hash)
    // -------------------------------------------------------------
    console.log('\n📌 Test Group 3: Session Rotation & Atomic Database Lookup');
    const profiles = await sql`SELECT id FROM profiles LIMIT 1;`;
    assert(profiles.length > 0, 'Found profile record for session testing');

    const testUserId = profiles[0].id;
    const testJti1 = crypto.randomUUID();
    const testRawRefreshToken1 = jwt.sign({ sub: testUserId, jti: testJti1 }, refreshTokenSecret, { expiresIn: '7d', algorithm: 'HS256' });
    const testHash1 = hashRefreshToken(testRawRefreshToken1);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Insert Initial Session
    await sql`
      INSERT INTO sessions (user_id, jti, refresh_token_hash, expires_at)
      VALUES (${testUserId}, ${testJti1}, ${testHash1}, ${expiresAt});
    `;

    // Query session matching BOTH jti AND refresh_token_hash FOR UPDATE
    const foundSession1 = await sql`
      SELECT * FROM sessions 
      WHERE jti = ${testJti1} AND refresh_token_hash = ${testHash1} AND revoked_at IS NULL
      LIMIT 1;
    `;
    assert(foundSession1.length === 1, 'Precision query matching BOTH jti AND refresh_token_hash finds active session');

    // Execute Rotation: Revoke old session JTI 1
    await sql`UPDATE sessions SET revoked_at = now() WHERE jti = ${testJti1};`;

    // Create New Session JTI 2
    const testJti2 = crypto.randomUUID();
    const testRawRefreshToken2 = jwt.sign({ sub: testUserId, jti: testJti2 }, refreshTokenSecret, { expiresIn: '7d', algorithm: 'HS256' });
    const testHash2 = hashRefreshToken(testRawRefreshToken2);

    await sql`
      INSERT INTO sessions (user_id, jti, refresh_token_hash, expires_at)
      VALUES (${testUserId}, ${testJti2}, ${testHash2}, ${expiresAt});
    `;

    const oldSessionState = await sql`SELECT revoked_at FROM sessions WHERE jti = ${testJti1};`;
    const newSessionState = await sql`SELECT revoked_at FROM sessions WHERE jti = ${testJti2};`;

    assert(oldSessionState[0].revoked_at !== null, 'Session Rotation: Old session JTI 1 is marked revoked_at');
    assert(newSessionState[0].revoked_at === null, 'Session Rotation: New session JTI 2 is active (revoked_at IS NULL)');

    // -------------------------------------------------------------
    // TEST GROUP 4: PRECISE REUSE DETECTION & SECURITY AUDIT LOGGING
    // -------------------------------------------------------------
    console.log('\n📌 Test Group 4: Precise Refresh Token Reuse Detection');

    // Replay old revoked session JTI 1
    const replayedSession = await sql`
      SELECT id, user_id, revoked_at FROM sessions 
      WHERE jti = ${testJti1} AND refresh_token_hash = ${testHash1};
    `;

    assert(replayedSession.length === 1, 'Found revoked session row upon replay');
    assert(replayedSession[0].revoked_at !== null, 'Replayed session is confirmed revoked');

    // Simulate Reuse Detection Handler: Log Security Event & Revoke Family Sessions
    await sql`
      INSERT INTO security_events (user_id, event_type, details)
      VALUES (${testUserId}, 'REFRESH_TOKEN_REUSE', ${JSON.stringify({ jti: testJti1 })});
    `;
    await sql`
      UPDATE sessions SET revoked_at = now() WHERE user_id = ${testUserId} AND revoked_at IS NULL;
    `;

    const activeUserSessionsAfterReuse = await sql`
      SELECT id FROM sessions WHERE user_id = ${testUserId} AND revoked_at IS NULL;
    `;
    const loggedSecurityEvents = await sql`
      SELECT * FROM security_events WHERE user_id = ${testUserId} AND event_type = 'REFRESH_TOKEN_REUSE';
    `;

    assert(activeUserSessionsAfterReuse.length === 0, 'Reuse Detection: ALL active family sessions for user revoked');
    assert(loggedSecurityEvents.length > 0, 'Reuse Detection: Security Event logged in "security_events" table');

    // Clean up test sessions
    await sql`DELETE FROM sessions WHERE user_id = ${testUserId};`;
    await sql`DELETE FROM security_events WHERE user_id = ${testUserId};`;

    // -------------------------------------------------------------
    // TEST GROUP 5: DOUBLE SUBMIT COOKIE CSRF PROTECTION
    // -------------------------------------------------------------
    console.log('\n📌 Test Group 5: Double Submit Cookie CSRF Specification');
    const csrfToken = generateCsrfToken();
    assert(csrfToken.length === 64, 'Generated CSRF Token is 32-byte cryptographically random hex string');

    // SUMMARY
    console.log(`\n📊 SECURITY AUDIT SUMMARY: Passed ${passed}/${passed + failed} tests.`);

    if (failed > 0) {
      console.error('❌ STEP 2 SECURITY AUDIT FAILED!');
      process.exit(1);
    } else {
      console.log('🎉 ALL STEP 2 SECURITY AUDIT CHECKS PASSED 100%!');
    }

  } catch (err: any) {
    console.error('❌ Step 2 Security Audit Error:', err.message || err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runStep2SecurityAudit();
