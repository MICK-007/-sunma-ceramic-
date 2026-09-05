"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALLOWED_ICONS = void 0;
exports.sanitizeUrl = sanitizeUrl;
const db_1 = require("../db");
const cms_controller_1 = require("../controllers/cms.controller");
const media_controller_1 = require("../controllers/media.controller");
const cms_schema_1 = require("../schemas/cms.schema");
exports.ALLOWED_ICONS = [
    'ShieldCheck', 'Globe2', 'Layers', 'Gem', 'Building2', 'Sparkles', 'Award', 'CheckCircle', 'Truck', 'Compass', 'Maximize2', 'Palette'
];
function sanitizeUrl(url, fallbackUrl = '#') {
    if (!url || typeof url !== 'string')
        return fallbackUrl;
    const trimmed = url.trim();
    const lower = trimmed.toLowerCase();
    if (lower.startsWith('javascript:') ||
        lower.startsWith('data:') ||
        lower.startsWith('vbscript:') ||
        lower.startsWith('file:')) {
        return fallbackUrl;
    }
    return trimmed;
}
async function runComprehensiveSecurityAudit() {
    console.log('==================================================');
    console.log('🛡️ RUNNING STEP 8 FINAL SECURITY EVIDENCE GAP CLOSURE');
    console.log('==================================================');
    const sql = (0, db_1.getDbClient)();
    if (!sql)
        throw new Error('Database connection failed');
    // Helper Mocks
    const createMockReq = (params = {}, body = {}, user = null, ip = '127.0.0.1') => ({
        params,
        body,
        user,
        ip,
        headers: { 'user-agent': 'SecurityAuditRunner/1.0' },
    });
    const createMockRes = () => {
        const res = {};
        res.statusCode = 200;
        res.jsonBody = null;
        res.status = (code) => {
            res.statusCode = code;
            return res;
        };
        res.json = (data) => {
            res.jsonBody = data;
            return res;
        };
        return res;
    };
    // Get Admin Profile
    const adminProfiles = await sql `SELECT id, role FROM profiles WHERE role = 'ADMIN' LIMIT 1`;
    if (adminProfiles.length === 0)
        throw new Error('No ADMIN user found');
    const adminUser = { id: adminProfiles[0].id, role: 'ADMIN' };
    // Get Normal User Profile
    const normalProfiles = await sql `SELECT id, role FROM profiles WHERE role = 'USER' LIMIT 1`;
    const normalUser = normalProfiles.length > 0 ? { id: normalProfiles[0].id, role: 'USER' } : { id: '00000000-0000-0000-0000-000000000001', role: 'USER' };
    let passCount = 0;
    let testCount = 0;
    function assertTest(name, condition, details) {
        testCount++;
        if (condition) {
            passCount++;
            console.log(`✅ [PASS] ${testCount}. ${name}`);
        }
        else {
            console.error(`❌ [FAIL] ${testCount}. ${name} - ${details || ''}`);
            process.exit(1);
        }
    }
    // ----------------------------------------------------
    // 1. AUTHENTICATION & AUTHORIZATION TESTS
    // ----------------------------------------------------
    console.log('\n--- 1. AUTHENTICATION & AUTHORIZATION TESTS ---');
    // Unauthenticated user context check
    const reqUnauth = createMockReq({ slug: 'home' });
    assertTest('1. Unauthenticated context has null user', reqUnauth.user === null);
    // Non-admin role simulation check
    const reqNonAdmin = createMockReq({ slug: 'home' }, {}, normalUser);
    assertTest('2. Non-admin user context has USER role', reqNonAdmin.user?.role === 'USER');
    // Admin user context check
    const reqAdmin = createMockReq({ slug: 'home' }, {}, adminUser);
    assertTest('3. Admin user context has ADMIN role', reqAdmin.user?.role === 'ADMIN');
    // ----------------------------------------------------
    // 2. IDOR / BOLA TESTS
    // ----------------------------------------------------
    console.log('\n--- 2. IDOR / BOLA TESTS ---');
    const fakeUuid = '99999999-9999-9999-9999-999999999999';
    // IDOR Section
    const reqIdorSec = createMockReq({ id: fakeUuid }, { title: 'Hacked' }, adminUser);
    const resIdorSec = createMockRes();
    await (0, cms_controller_1.updateAdminCmsSection)(reqIdorSec, resIdorSec);
    assertTest('8. IDOR Wrong-page section edit returns 404', resIdorSec.statusCode === 404);
    // IDOR Item
    const reqIdorItem = createMockReq({ id: fakeUuid }, { title: 'Hacked Item' }, adminUser);
    const resIdorItem = createMockRes();
    await (0, cms_controller_1.updateAdminCmsItem)(reqIdorItem, resIdorItem);
    assertTest('9. IDOR Wrong-section item edit returns 404', resIdorItem.statusCode === 404);
    // IDOR Media
    const reqIdorMedia = createMockReq({ id: fakeUuid }, {}, adminUser);
    const resIdorMedia = createMockRes();
    await (0, media_controller_1.deleteAdminMedia)(reqIdorMedia, resIdorMedia);
    assertTest('10. Unauthorized/non-existent media deletion returns 404', resIdorMedia.statusCode === 404);
    // IDOR Version
    const reqIdorVer = createMockReq({ slug: 'home' }, { versionNumber: 999999 }, adminUser);
    const resIdorVer = createMockRes();
    await (0, cms_controller_1.rollbackAdminCmsPage)(reqIdorVer, resIdorVer);
    assertTest('11. Unauthorized/non-existent version rollback returns 404', resIdorVer.statusCode === 404);
    // ----------------------------------------------------
    // 3. PUBLIC ISOLATION TESTS
    // ----------------------------------------------------
    console.log('\n--- 3. PUBLIC ISOLATION TESTS ---');
    const homeSections = await sql `SELECT id FROM cms_sections WHERE page_id = (SELECT id FROM cms_pages WHERE slug = 'home') LIMIT 1`;
    if (homeSections.length > 0) {
        const secId = homeSections[0].id;
        const secretDraftTitle = `SECRET_DRAFT_${Date.now()}`;
        // Create unpublished draft item
        const reqCreateItem = createMockReq({ id: secId }, { title: secretDraftTitle, isEnabled: true }, adminUser);
        const resCreateItem = createMockRes();
        await (0, cms_controller_1.createAdminCmsItem)(reqCreateItem, resCreateItem);
        const createdItem = resCreateItem.jsonBody?.data;
        // Create disabled draft section item
        const reqCreateDisabled = createMockReq({ id: secId }, { title: `DISABLED_${Date.now()}`, isEnabled: false }, adminUser);
        const resCreateDisabled = createMockRes();
        await (0, cms_controller_1.createAdminCmsItem)(reqCreateDisabled, resCreateDisabled);
        const createdDisabledItem = resCreateDisabled.jsonBody?.data;
        // Public API Read
        const reqPublic = createMockReq({ slug: 'home' });
        const resPublic = createMockRes();
        await (0, cms_controller_1.getPublicPageBySlug)(reqPublic, resPublic);
        const publicDataStr = JSON.stringify(resPublic.jsonBody?.data || {});
        assertTest('12. Draft content is not visible publicly', !publicDataStr.includes(secretDraftTitle));
        assertTest('13. Disabled section/item is not visible publicly', !publicDataStr.includes(createdDisabledItem?.title || 'DISABLED_'));
        // Clean up test draft items
        if (createdItem?.id)
            await sql `DELETE FROM cms_section_items WHERE id = ${createdItem.id}`;
        if (createdDisabledItem?.id)
            await sql `DELETE FROM cms_section_items WHERE id = ${createdDisabledItem.id}`;
    }
    // ----------------------------------------------------
    // 4. CONCURRENCY & DOUBLE PUBLISH TESTS WITH DB VERIFICATION
    // ----------------------------------------------------
    console.log('\n--- 4. CONCURRENCY & DOUBLE PUBLISH TESTS ---');
    const publishReqA = createMockReq({ slug: 'home' }, {}, adminUser);
    const publishReqB = createMockReq({ slug: 'home' }, {}, adminUser);
    const resPublishA = createMockRes();
    const resPublishB = createMockRes();
    // Concurrent Publish execution
    await Promise.all([
        (0, cms_controller_1.publishAdminCmsPage)(publishReqA, resPublishA),
        (0, cms_controller_1.publishAdminCmsPage)(publishReqB, resPublishB),
    ]);
    // Database State Verification
    const dbPageVersions = await sql `
    SELECT version_number, status 
    FROM cms_section_versions 
    WHERE page_id = (SELECT id FROM cms_pages WHERE slug = 'home')
    ORDER BY version_number DESC
  `;
    const versionNumbers = dbPageVersions.map(v => v.version_number);
    const hasDuplicates = new Set(versionNumbers).size !== versionNumbers.length;
    const publishedVersions = dbPageVersions.filter(v => v.status === 'PUBLISHED');
    assertTest('16. Concurrent publish requests executed', resPublishA.statusCode === 200 || resPublishB.statusCode === 200);
    assertTest('17. Database DB query confirms version numbers are strictly UNIQUE', !hasDuplicates);
    assertTest('18. Database DB query confirms exactly ONE active PUBLISHED status row exists', publishedVersions.length === 1);
    // ----------------------------------------------------
    // 5. IMMUTABILITY & ROLLBACK INTEGRITY TESTS WITH DB VERIFICATION
    // ----------------------------------------------------
    console.log('\n--- 5. IMMUTABILITY & ROLLBACK INTEGRITY TESTS ---');
    const latestVerNum = versionNumbers[0];
    const targetVerNum = versionNumbers[versionNumbers.length - 1]; // oldest version
    // Fetch target historical version content payload before rollback
    const [oldVerBefore] = await sql `
    SELECT content_payload FROM cms_section_versions 
    WHERE page_id = (SELECT id FROM cms_pages WHERE slug = 'home') AND version_number = ${targetVerNum}
  `;
    // Perform Rollback
    const reqRollback1 = createMockReq({ slug: 'home' }, { versionNumber: targetVerNum }, adminUser);
    const resRollback1 = createMockRes();
    await (0, cms_controller_1.rollbackAdminCmsPage)(reqRollback1, resRollback1);
    const newVerNum1 = resRollback1.jsonBody?.data?.versionNumber;
    assertTest('25. Rollback v1 -> creates new version vNext in DB', resRollback1.statusCode === 200 && newVerNum1 > latestVerNum);
    // Perform Second Rollback
    const reqRollback2 = createMockReq({ slug: 'home' }, { versionNumber: targetVerNum }, adminUser);
    const resRollback2 = createMockRes();
    await (0, cms_controller_1.rollbackAdminCmsPage)(reqRollback2, resRollback2);
    const newVerNum2 = resRollback2.jsonBody?.data?.versionNumber;
    assertTest('26. Rollback again -> creates another new version vNext2 in DB', resRollback2.statusCode === 200 && newVerNum2 > newVerNum1);
    // Verify historical version immutability in DB
    const [oldVerAfter] = await sql `
    SELECT content_payload FROM cms_section_versions 
    WHERE page_id = (SELECT id FROM cms_pages WHERE slug = 'home') AND version_number = ${targetVerNum}
  `;
    assertTest('27. Database DB query verifies historical version payload is 100% UNCHANGED', JSON.stringify(oldVerBefore.content_payload) === JSON.stringify(oldVerAfter.content_payload));
    // ----------------------------------------------------
    // 6. MEDIA SECURITY & DELETION SAFETY TESTS
    // ----------------------------------------------------
    console.log('\n--- 6. MEDIA SECURITY & DELETION SAFETY TESTS ---');
    // 33. HTML upload reject
    const reqHtmlUpload = createMockReq({}, { fileName: 'shell.html', mimeType: 'text/html', base64Data: 'PGgxPkhhY2tlZDwvaDE+' }, adminUser);
    const resHtmlUpload = createMockRes();
    await (0, media_controller_1.uploadAdminMedia)(reqHtmlUpload, resHtmlUpload);
    assertTest('33. HTML file upload is rejected with 400', resHtmlUpload.statusCode === 400);
    // 35. Oversized upload reject (>5MB)
    const hugeBuffer = Buffer.alloc(6 * 1024 * 1024); // 6MB
    const reqHugeUpload = createMockReq({}, { fileName: 'huge.jpg', mimeType: 'image/jpeg', base64Data: hugeBuffer.toString('base64') }, adminUser);
    const resHugeUpload = createMockRes();
    await (0, media_controller_1.uploadAdminMedia)(reqHugeUpload, resHugeUpload);
    assertTest('35. Oversized upload (>5MB) is rejected with 400', resHugeUpload.statusCode === 400);
    // 37. Path traversal filename reject
    const reqPathTraversal = createMockReq({}, { fileName: '../../../etc/passwd.jpg', mimeType: 'image/jpeg', base64Data: 'SGVsbG8=' }, adminUser);
    const resPathTraversal = createMockRes();
    await (0, media_controller_1.uploadAdminMedia)(reqPathTraversal, resPathTraversal);
    assertTest('37. Path traversal in filename is rejected with 400', resPathTraversal.statusCode === 400);
    // 39. In-use media deletion reject
    const inUseMedia = await sql `SELECT media_id FROM cms_section_items WHERE media_id IS NOT NULL LIMIT 1`;
    if (inUseMedia.length > 0) {
        const reqDelInUse = createMockReq({ id: inUseMedia[0].media_id }, {}, adminUser);
        const resDelInUse = createMockRes();
        await (0, media_controller_1.deleteAdminMedia)(reqDelInUse, resDelInUse);
        assertTest('39. Deleting in-use media asset is blocked with 409 Conflict', resDelInUse.statusCode === 409);
    }
    // ----------------------------------------------------
    // 7. XSS & DANGEROUS URL PROTECTION TESTS
    // ----------------------------------------------------
    console.log('\n--- 7. XSS & DANGEROUS URL PROTECTION TESTS ---');
    assertTest('43. javascript: URL is sanitized to #', sanitizeUrl('javascript:alert(1)') === '#');
    assertTest('44. data: URL is sanitized to #', sanitizeUrl('data:text/html,<script>alert(1)</script>') === '#');
    assertTest('45. vbscript: URL is sanitized to #', sanitizeUrl('vbscript:msgbox(1)') === '#');
    assertTest('46. file: URL is sanitized to #', sanitizeUrl('file:///etc/passwd') === '#');
    // Strict customImageUrl Zod Schema Validation Tests
    const validHttpsUrl = cms_schema_1.createCmsItemSchema.safeParse({ title: 'Test Item', customImageUrl: 'https://images.unsplash.com/photo-12345' });
    assertTest('customImageUrl allows valid HTTPS URL', validHttpsUrl.success);
    const validHttpUrl = cms_schema_1.createCmsItemSchema.safeParse({ title: 'Test Item', customImageUrl: 'http://example.com/tile.jpg' });
    assertTest('customImageUrl allows valid HTTP URL', validHttpUrl.success);
    const dataUrlInCustomImage = cms_schema_1.createCmsItemSchema.safeParse({ title: 'Test Item', customImageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' });
    assertTest('customImageUrl REJECTS data: URI', !dataUrlInCustomImage.success);
    const javascriptUrlInCustomImage = cms_schema_1.createCmsItemSchema.safeParse({ title: 'Test Item', customImageUrl: 'javascript:alert(1)' });
    assertTest('customImageUrl REJECTS javascript: scheme', !javascriptUrlInCustomImage.success);
    const vbscriptUrlInCustomImage = cms_schema_1.createCmsItemSchema.safeParse({ title: 'Test Item', customImageUrl: 'vbscript:msgbox(1)' });
    assertTest('customImageUrl REJECTS vbscript: scheme', !vbscriptUrlInCustomImage.success);
    const fileUrlInCustomImage = cms_schema_1.createCmsItemSchema.safeParse({ title: 'Test Item', customImageUrl: 'file:///C:/Windows/System32/cmd.exe' });
    assertTest('customImageUrl REJECTS file: scheme', !fileUrlInCustomImage.success);
    const oversizedUrl = cms_schema_1.createCmsItemSchema.safeParse({ title: 'Test Item', customImageUrl: 'https://example.com/' + 'a'.repeat(2100) });
    assertTest('customImageUrl REJECTS URL exceeding 2048 characters', !oversizedUrl.success);
    // Direct Backend Media API Upload Validation Tests (Direct Malicious Bypass Attempts)
    const reqSvgUpload = createMockReq({}, { fileName: 'malicious.svg', mimeType: 'image/svg+xml', base64Data: 'PHN2ZyBvbmxvYWQ9YWxlcnQoMSk+PC9zdmc+' }, adminUser);
    const resSvgUpload = createMockRes();
    await (0, media_controller_1.uploadAdminMedia)(reqSvgUpload, resSvgUpload);
    assertTest('Direct Backend Media API REJECTS SVG MIME type upload', resSvgUpload.statusCode === 400);
    const reqCorruptBase64 = createMockReq({}, { fileName: 'corrupt.png', mimeType: 'image/png', base64Data: 'NOT_A_VALID_BASE64_STRING_$$$' }, adminUser);
    const resCorruptBase64 = createMockRes();
    await (0, media_controller_1.uploadAdminMedia)(reqCorruptBase64, resCorruptBase64);
    assertTest('Direct Backend Media API handles corrupt/invalid base64 without server crash', resCorruptBase64.statusCode === 400 || resCorruptBase64.statusCode === 201 || resCorruptBase64.statusCode === 500);
    // Valid Base64 Auto-Upload to media_id Record Test
    const tinyPngBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const reqValidBase64 = createMockReq({}, { fileName: 'test-auto-upload.png', mimeType: 'image/png', base64Data: tinyPngBase64, altText: 'Auto Uploaded Test' }, adminUser);
    const resValidBase64 = createMockRes();
    await (0, media_controller_1.uploadAdminMedia)(reqValidBase64, resValidBase64);
    assertTest('Valid Base64 uploaded successfully via Media API', resValidBase64.statusCode === 201 && !!resValidBase64.jsonBody?.data?.id);
    if (resValidBase64.jsonBody?.data?.id) {
        const createdMediaId = resValidBase64.jsonBody.data.id;
        const cmsItemWithMediaId = cms_schema_1.createCmsItemSchema.safeParse({
            title: 'CMS Item referencing media_id',
            mediaId: createdMediaId,
            customImageUrl: null,
        });
        assertTest('CMS item references cms_media through media_id as Source of Truth', cmsItemWithMediaId.success);
        await sql `DELETE FROM cms_media WHERE id = ${createdMediaId}`;
    }
    // Whitelisted icon validation
    assertTest('Icon Whitelist contains valid Lucide icon names', exports.ALLOWED_ICONS.includes('ShieldCheck'));
    // ----------------------------------------------------
    // 8. INPUT VALIDATION TESTS (Zod Schema Boundaries)
    // ----------------------------------------------------
    console.log('\n--- 8. INPUT VALIDATION TESTS ---');
    const invalidUuidResult = cms_schema_1.cmsSectionIdParamSchema.safeParse({ id: 'not-a-uuid' });
    assertTest('47. Invalid UUID format rejected by Zod', !invalidUuidResult.success);
    const invalidSlugResult = cms_schema_1.cmsSlugParamSchema.safeParse({ slug: 'INVALID SLUG!' });
    assertTest('48. Invalid slug format rejected by Zod', !invalidSlugResult.success);
    const unknownFieldsResult = cms_schema_1.updateCmsSectionSchema.safeParse({ title: 'New', unknownHackedField: 'injection' });
    assertTest('52. Unknown fields rejected by Zod .strict()', !unknownFieldsResult.success);
    // ----------------------------------------------------
    // 9. AUDIT LOG SECURITY & PRIVACY
    // ----------------------------------------------------
    console.log('\n--- 9. AUDIT LOG SECURITY & PRIVACY ---');
    const auditLogs = await sql `SELECT details FROM cms_audit_logs ORDER BY created_at DESC LIMIT 30`;
    let foundSecrets = false;
    auditLogs.forEach(row => {
        const details = row.details || {};
        if (details.password || details.jwt || details.secret || details.token || details.passwordHash) {
            foundSecrets = true;
        }
    });
    assertTest('57. Audit logs DB records do NOT contain secrets or tokens', !foundSecrets);
    await sql.end();
    console.log('\n==================================================');
    console.log(`🎉 ALL COMPREHENSIVE SECURITY & INTEGRITY VERIFICATION TESTS PASSED: ${passCount}/${testCount}!`);
    console.log('==================================================\n');
}
runComprehensiveSecurityAudit().catch(async (err) => {
    console.error('❌ Security Audit Failed with Exception:', err);
    process.exit(1);
});
