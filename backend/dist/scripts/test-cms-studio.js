"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
function makeRequest(options, body) {
    return new Promise((resolve, reject) => {
        const req = http_1.default.request(options, res => {
            let data = '';
            res.on('data', chunk => (data += chunk));
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode || 0, body: JSON.parse(data) });
                }
                catch {
                    resolve({ status: res.statusCode || 0, body: data });
                }
            });
        });
        req.on('error', reject);
        if (body)
            req.write(JSON.stringify(body));
        req.end();
    });
}
async function runCmsStudioTest() {
    console.log('🧪 Starting STEP 6: Admin CMS Studio Verification Test...\n');
    try {
        // 1. Reorder Endpoint Schema check
        console.log('Step 1: Test Reorder Section schema validation (PUT /api/cms/admin/sections/reorder without auth)');
        const res1 = await makeRequest({
            hostname: 'localhost',
            port: 5000,
            path: '/api/cms/admin/sections/reorder',
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
        }, { pageSlug: 'home', sectionOrders: [] });
        console.log('  Status Code:', res1.status);
        console.log('  Message:', res1.body?.message);
        if (res1.status === 401 || res1.status === 403) {
            console.log('  ✅ SECURITY VERIFIED: Reorder section API strictly rejected unauthorized request!\n');
        }
        else {
            throw new Error(`Test 1 Failed: Server allowed unauthorized section reordering`);
        }
        // 2. Section Update Endpoint Schema check
        console.log('Step 2: Test Section Update without Auth');
        const res2 = await makeRequest({
            hostname: 'localhost',
            port: 5000,
            path: '/api/cms/admin/sections/00000000-0000-0000-0000-000000000000',
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
        }, { title: 'Hacked Title' });
        console.log('  Status Code:', res2.status);
        if (res2.status === 401 || res2.status === 403) {
            console.log('  ✅ SECURITY VERIFIED: Section Update API strictly rejected unauthorized request!\n');
        }
        else {
            throw new Error(`Test 2 Failed: Server allowed unauthorized section update`);
        }
        console.log('🎉 ALL STEP 6 ADMIN CMS STUDIO API TESTS PASSED!');
    }
    catch (err) {
        console.error('❌ Test Error:', err.message);
        process.exit(1);
    }
}
runCmsStudioTest();
