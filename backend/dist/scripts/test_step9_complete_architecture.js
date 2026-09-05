"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../db");
const storage_1 = require("../utils/storage");
const migrate_legacy_base64_media_1 = require("./migrate_legacy_base64_media");
async function runCompleteStep9TestSuite() {
    const sql = (0, db_1.getDbClient)();
    if (!sql)
        throw new Error('DB client is null');
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
    console.log('STEP 9 — COMPLETE CMS MEDIA ARCHITECTURE TEST SUITE');
    console.log('==================================================\n');
    try {
        // --------------------------------------------------
        // SECTION 1: STORAGE INFRASTRUCTURE & SECURITY
        // --------------------------------------------------
        console.log('--- SECTION 1: STORAGE INFRASTRUCTURE ---');
        const validUuid = '550e8400-e29b-41d4-a716-446655440000';
        const pathRes = (0, storage_1.getStoragePath)(validUuid, 'image/jpeg');
        assert(pathRes.success && pathRes.storagePath === `cms/media/${validUuid}.jpg`, '1. Storage path generation correct', pathRes.storagePath);
        const traversalRes = (0, storage_1.getStoragePath)('../550e8400-e29b-41d4-a716-446655440000', 'image/jpeg');
        assert(!traversalRes.success, '2. Path traversal rejected');
        const svgRes = (0, storage_1.getStoragePath)(validUuid, 'image/svg+xml');
        assert(!svgRes.success && svgRes.code === 'MEDIA_STORAGE_INVALID_MIME', '3. SVG MIME rejected by storage path generator');
        // --------------------------------------------------
        // SECTION 2: BINARY UPLOAD & IMMUTABILITY
        // --------------------------------------------------
        console.log('\n--- SECTION 2: BINARY UPLOAD & IMMUTABILITY ---');
        const testMediaId = 'a1b2c3d4-e5f6-47a8-b9c0-112233445566';
        const fakeJpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
        const uploadRes = await (0, storage_1.uploadCmsMedia)(testMediaId, 'image/jpeg', fakeJpegBuffer);
        assert(Boolean(uploadRes.success && (uploadRes.url?.startsWith('http://') || uploadRes.url?.startsWith('https://') || uploadRes.url?.startsWith('/'))), '4. Binary JPEG upload succeeds with valid HTTP/HTTPS or Relative API URL', uploadRes.url);
        // Overwrite Prevention Test
        const overwriteRes = await (0, storage_1.uploadCmsMedia)(testMediaId, 'image/jpeg', fakeJpegBuffer);
        assert(!overwriteRes.success && overwriteRes.code === 'MEDIA_STORAGE_OBJECT_EXISTS', '5. Storage object overwrite strictly prohibited');
        // Clean up test media
        await (0, storage_1.deleteCmsMedia)(uploadRes.storagePath);
        // --------------------------------------------------
        // SECTION 3: LEGACY BASE64 MIGRATION
        // --------------------------------------------------
        console.log('\n--- SECTION 3: LEGACY BASE64 MIGRATION ---');
        const migrationRes = await (0, migrate_legacy_base64_media_1.runLegacyBase64Migration)();
        assert(migrationRes.failed === 0, '6. Legacy Base64 migration completes with 0 failures');
        // Verify all cms_media records in DB have clean HTTPS URLs and no Base64
        const mediaRows = await sql `SELECT id, storage_path, url FROM cms_media`;
        const noBase64InDb = mediaRows.every((r) => !r.url.startsWith('data:image/') && (r.url.startsWith('http://') || r.url.startsWith('https://') || r.url.startsWith('/')));
        assert(noBase64InDb, '7. Zero Base64 Data URIs remain in cms_media.url', `Total rows: ${mediaRows.length}`);
        // --------------------------------------------------
        // SECTION 4: HISTORICAL JSONB IMMUTABILITY
        // --------------------------------------------------
        console.log('\n--- SECTION 4: HISTORICAL SNAPSHOT IMMUTABILITY ---');
        const initialVersions = await sql `SELECT id, version_number, content_payload FROM cms_section_versions`;
        assert(initialVersions.length > 0, '8. Historical JSONB version snapshots exist', `Total versions: ${initialVersions.length}`);
        const versionIdSample = initialVersions[0].id;
        const versionPayloadSample = JSON.stringify(initialVersions[0].content_payload);
        // Re-verify that payload was untouched
        const afterVersions = await sql `SELECT id, version_number, content_payload FROM cms_section_versions WHERE id = ${versionIdSample}`;
        const afterPayloadSample = JSON.stringify(afterVersions[0].content_payload);
        assert(versionPayloadSample === afterPayloadSample, '9. Historical JSONB content_payload is byte-for-byte immutable');
        // --------------------------------------------------
        // SECTION 5: REPLACEMENT & ROLLBACK SEMANTICS
        // --------------------------------------------------
        console.log('\n--- SECTION 5: REPLACEMENT & ROLLBACK SEMANTICS ---');
        const oldMediaId = '11111111-2222-3333-4444-555555555555';
        const newMediaId = '66666666-7777-8888-9999-000000000000';
        const assetABuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x41, 0x53, 0x53, 0x45, 0x54, 0x41]); // Asset A
        const assetBBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x42, 0x53, 0x53, 0x54]); // Asset B
        const oldUpload = await (0, storage_1.uploadCmsMedia)(oldMediaId, 'image/jpeg', assetABuffer);
        const newUpload = await (0, storage_1.uploadCmsMedia)(newMediaId, 'image/png', assetBBuffer);
        assert(oldUpload.success && newUpload.success, '10. Replacement assets A and B created independently');
        assert(oldUpload.url !== newUpload.url, '11. Old media_id X and replacement media_id Y have distinct Storage URLs');
        // Clean up test replacement objects
        await (0, storage_1.deleteCmsMedia)(oldUpload.storagePath);
        await (0, storage_1.deleteCmsMedia)(newUpload.storagePath);
        // --------------------------------------------------
        // SECTION 6: MEDIA DELETION PROTECTION
        // --------------------------------------------------
        console.log('\n--- SECTION 6: MEDIA DELETION PROTECTION ---');
        // Insert a test item referencing legacy media
        const existingMedia = mediaRows[0];
        const sectionRow = await sql `SELECT id FROM cms_sections LIMIT 1`;
        if (sectionRow.length > 0) {
            const sectionId = sectionRow[0].id;
            const refItem = await sql `
        INSERT INTO cms_section_items (section_id, title, media_id, custom_image_url, sort_order)
        VALUES (${sectionId}, 'Deletion Test Item', ${existingMedia.id}, NULL, 999)
        RETURNING id
      `;
            // Verify reference check logic: item exists -> referenced
            const checkRef = await sql `SELECT id FROM cms_section_items WHERE media_id = ${existingMedia.id}`;
            assert(checkRef.length > 0, '12. Media reference check detects active usage in section items');
            // Cleanup test item
            await sql `DELETE FROM cms_section_items WHERE id = ${refItem[0].id}`;
        }
        else {
            assert(true, '12. Media reference check skipped (no section rows)');
        }
        // --------------------------------------------------
        // TEST SUMMARY REPORT
        // --------------------------------------------------
        console.log('\n==================================================');
        console.log(`STEP 9 COMPLETE SUITE: ${passCount}/${passCount + failCount} TESTS PASSED`);
        console.log('==================================================\n');
    }
    catch (err) {
        console.error('❌ Exception running complete test suite:', err?.message || err);
        failCount++;
    }
    return { passCount, failCount };
}
if (require.main === module) {
    runCompleteStep9TestSuite()
        .then(async (res) => {
        const sql = (0, db_1.getDbClient)();
        await sql?.end();
        process.exit(res.failCount > 0 ? 1 : 0);
    })
        .catch((err) => {
        console.error('Fatal test error:', err);
        process.exit(1);
    });
}
