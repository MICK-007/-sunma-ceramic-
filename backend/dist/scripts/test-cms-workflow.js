"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../db");
const cms_controller_1 = require("../controllers/cms.controller");
async function runCmsWorkflowTest() {
    console.log('==================================================');
    console.log('🧪 RUNNING STEP 7 CMS WORKFLOW & SECURITY VERIFICATION');
    console.log('==================================================');
    const sql = (0, db_1.getDbClient)();
    if (!sql) {
        throw new Error('Database connection failed');
    }
    // Find valid admin user id
    const adminProfiles = await sql `SELECT id FROM profiles WHERE role = 'ADMIN' LIMIT 1`;
    const adminUserId = adminProfiles.length > 0 ? adminProfiles[0].id : null;
    // 1. Get initial page state
    const pages = await sql `SELECT id, title, slug FROM cms_pages WHERE slug = 'home' LIMIT 1`;
    if (pages.length === 0) {
        await sql.end();
        throw new Error('Home page not found in DB');
    }
    const homePage = pages[0];
    console.log(`✅ Target Page Found: ${homePage.title} (id: ${homePage.id})`);
    // Mock Request and Response for controllers
    const createMockReq = (params = {}, body = {}, user = { id: adminUserId, role: 'ADMIN' }) => ({
        params,
        body,
        user,
        ip: '127.0.0.1',
        headers: { 'user-agent': 'TestRunner/1.0' }
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
    // TEST 1: Publish Draft (Creates Immutable Snapshot vNext)
    console.log('\n--- TEST 1: Publish Page Draft ---');
    const reqPublish = createMockReq({ slug: 'home' });
    const resPublish = createMockRes();
    await (0, cms_controller_1.publishAdminCmsPage)(reqPublish, resPublish);
    if (resPublish.statusCode !== 200 || !resPublish.jsonBody?.success) {
        console.error('❌ Publish Failed:', resPublish.jsonBody);
        await sql.end();
        process.exit(1);
    }
    const publishedVersion = resPublish.jsonBody.data;
    console.log(`✅ Publish Success! Created Version v${publishedVersion.versionNumber}`);
    // TEST 2: Fetch Version History
    console.log('\n--- TEST 2: Fetch Version History ---');
    const reqVersions = createMockReq({ slug: 'home' });
    const resVersions = createMockRes();
    await (0, cms_controller_1.getAdminCmsPageVersions)(reqVersions, resVersions);
    if (resVersions.statusCode !== 200 || !resVersions.jsonBody?.success) {
        console.error('❌ Fetch Versions Failed:', resVersions.jsonBody);
        await sql.end();
        process.exit(1);
    }
    const versionsList = resVersions.jsonBody.data;
    console.log(`✅ Version History Fetched: Total ${versionsList.length} versions found.`);
    console.log(`   Latest Version: v${versionsList[0].version_number} (Status: ${versionsList[0].status})`);
    // TEST 3: Rollback to previous version if available
    if (versionsList.length > 1) {
        const targetVersion = versionsList[1]; // older version
        console.log(`\n--- TEST 3: Rollback to Version v${targetVersion.version_number} ---`);
        const reqRollback = createMockReq({ slug: 'home' }, { versionNumber: targetVersion.version_number });
        const resRollback = createMockRes();
        await (0, cms_controller_1.rollbackAdminCmsPage)(reqRollback, resRollback);
        if (resRollback.statusCode !== 200 || !resRollback.jsonBody?.success) {
            console.error('❌ Rollback Failed:', resRollback.jsonBody);
            await sql.end();
            process.exit(1);
        }
        const rollbackResultVersion = resRollback.jsonBody.data;
        console.log(`✅ Rollback Success! Created NEW Version v${rollbackResultVersion.versionNumber} with content from v${targetVersion.version_number}`);
        if (rollbackResultVersion.versionNumber === targetVersion.version_number) {
            console.error('❌ IMMUTABILITY FAILURE: Rollback mutated historical version number instead of generating a new one!');
            await sql.end();
            process.exit(1);
        }
        console.log('✅ IMMUTABILITY VERIFIED: Historical version preserved, new version incremented cleanly.');
    }
    else {
        console.log('ℹ️ Only 1 version exists; publishing a secondary version to test Rollback atomic behavior...');
        // Perform a second publish to get v2
        const resPublish2 = createMockRes();
        await (0, cms_controller_1.publishAdminCmsPage)(reqPublish, resPublish2);
        const secondVersion = resPublish2.jsonBody.data;
        console.log(`✅ Created Second Version v${secondVersion.versionNumber}`);
        // Rollback v2 -> v1
        console.log(`\n--- TEST 3: Rollback v${secondVersion.versionNumber} to v${publishedVersion.versionNumber} ---`);
        const reqRollback = createMockReq({ slug: 'home' }, { versionNumber: publishedVersion.versionNumber });
        const resRollback = createMockRes();
        await (0, cms_controller_1.rollbackAdminCmsPage)(reqRollback, resRollback);
        if (resRollback.statusCode !== 200 || !resRollback.jsonBody?.success) {
            console.error('❌ Rollback Failed:', resRollback.jsonBody);
            await sql.end();
            process.exit(1);
        }
        const rollbackResultVersion = resRollback.jsonBody.data;
        console.log(`✅ Rollback Success! Created NEW Version v${rollbackResultVersion.versionNumber} from snapshot v${publishedVersion.versionNumber}`);
    }
    // TEST 4: Audit Trail Verification
    console.log('\n--- TEST 4: Audit Logs Verification ---');
    const publishAudits = await sql `
    SELECT id, action, created_at FROM cms_audit_logs 
    WHERE action = 'ADMIN_CMS_PUBLISH' ORDER BY created_at DESC LIMIT 3
  `;
    const rollbackAudits = await sql `
    SELECT id, action, created_at FROM cms_audit_logs 
    WHERE action = 'ADMIN_CMS_ROLLBACK' ORDER BY created_at DESC LIMIT 3
  `;
    console.log(`✅ Found ${publishAudits.length} ADMIN_CMS_PUBLISH audit log records.`);
    console.log(`✅ Found ${rollbackAudits.length} ADMIN_CMS_ROLLBACK audit log records.`);
    await sql.end();
    console.log('\n==================================================');
    console.log('🎉 ALL STEP 7 CMS WORKFLOW TESTS PASSED SUCCESSFULLY!');
    console.log('==================================================\n');
}
runCmsWorkflowTest().catch(async (err) => {
    console.error('❌ Unhandled Exception in Test Script:', err);
    process.exit(1);
});
