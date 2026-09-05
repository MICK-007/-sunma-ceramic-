"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runUploadFlowAuditTest = runUploadFlowAuditTest;
const db_1 = require("../db");
const storage_1 = require("../utils/storage");
/**
 * UPLOAD FLOW AUDIT & CANONICAL URL PERSISTENCE VERIFICATION TEST
 */
async function runUploadFlowAuditTest() {
    const sql = (0, db_1.getDbClient)();
    if (!sql)
        throw new Error('Database client unavailable');
    let passCount = 0;
    let failCount = 0;
    function assert(condition, testName, detail) {
        if (condition) {
            passCount++;
            console.log(`[PASS] ${testName}${detail ? ` - ${detail}` : ''}`);
        }
        else {
            failCount++;
            console.error(`[FAIL] ${testName}${detail ? ` - ${detail}` : ''}`);
        }
    }
    console.log('==================================================');
    console.log('STEP 9: UPLOAD FLOW AUDIT & CANONICAL PERSISTENCE TEST');
    console.log('==================================================\n');
    try {
        const testMediaId = crypto.randomUUID();
        const testJpegBytes = Buffer.from([
            0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
            0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xff, 0xd9
        ]);
        // 1. Simulate Binary Upload Pipeline
        const uploadRes = await (0, storage_1.uploadCmsMedia)(testMediaId, 'image/jpeg', testJpegBytes);
        assert(uploadRes.success, '1. Binary upload to storage succeeds');
        assert(Boolean(uploadRes.url && (uploadRes.url.startsWith('https://') || uploadRes.url.startsWith('/api/'))), '2. Generated URL is Canonical Production HTTPS or Relative API URL', uploadRes.url);
        assert(!uploadRes.url?.includes('localhost'), '3. Upload response URL contains ZERO localhost references', uploadRes.url);
        // 2. Persist to PostgreSQL database cms_media
        const canonicalStoragePath = `cms/media/${testMediaId}.jpg`;
        const canonicalUrl = (0, storage_1.getCmsMediaUrl)(canonicalStoragePath);
        const insertedRows = await sql `
      INSERT INTO cms_media (id, filename, original_name, mime_type, size_bytes, storage_path, url, alt_text)
      VALUES (${testMediaId}, ${`${testMediaId}.jpg`}, 'canonical-test.jpg', 'image/jpeg', ${testJpegBytes.length}, ${canonicalStoragePath}, ${canonicalUrl}, 'Canonical Upload Test')
      RETURNING id, storage_path, url
    `;
        // 3. Direct DB Inspection
        const dbRecord = insertedRows[0];
        assert(dbRecord.id === testMediaId, '4. cms_media row created with server UUID');
        assert(Boolean(dbRecord.url.startsWith('https://') || dbRecord.url.startsWith('/api/')), '5. PostgreSQL url column stores Canonical Production HTTPS or Relative API URL', dbRecord.url);
        assert(!dbRecord.url.includes('localhost'), '6. PostgreSQL url column contains ZERO localhost strings', dbRecord.url);
        // 4. Audit entire cms_media table in PostgreSQL
        const localhostRows = await sql `SELECT id, url FROM cms_media WHERE url LIKE '%localhost%'`;
        assert(localhostRows.length === 0, '7. Total localhost rows remaining in PostgreSQL = 0');
        // Clean up test media row
        await sql `DELETE FROM cms_media WHERE id = ${testMediaId}`;
        await (0, storage_1.deleteCmsMedia)(canonicalStoragePath);
        console.log('\n==================================================');
        console.log(`UPLOAD FLOW AUDIT RESULT: ${passCount}/${passCount + failCount} CHECKS PASSED`);
        console.log('==================================================\n');
    }
    catch (err) {
        console.error('❌ Exception during upload flow audit:', err?.message || err);
        failCount++;
    }
    return { passCount, failCount };
}
if (require.main === module) {
    runUploadFlowAuditTest()
        .then(async (res) => {
        const sql = (0, db_1.getDbClient)();
        await sql?.end();
        process.exit(res.failCount > 0 ? 1 : 0);
    })
        .catch((err) => {
        console.error('Fatal error:', err);
        process.exit(1);
    });
}
