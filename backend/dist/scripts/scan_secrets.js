"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const ROOT_DIR = path_1.default.resolve(__dirname, '../../..');
const BACKDOOR_TOKENS = ['admin-token-secret-2026', 'user-token-secret-2026'];
const FORBIDDEN_FRONTEND_PATTERNS = [
    'SUPABASE_SERVICE_ROLE_KEY',
    'DATABASE_URL',
    'JWT_SECRET',
    'REFRESH_TOKEN_SECRET',
    'postgresql://',
];
const HARDCODED_SECRET_PATTERNS = [
    /postgres:[a-zA-Z0-9_.-]+@/g, // Raw postgres connection strings with passwords
    /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g, // Hardcoded JWT tokens
];
function scanDir(dir, results) {
    const files = fs_1.default.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === '.git' || file === '.next' || file === 'dist' || file === 'scripts' || file.endsWith('.example'))
            continue;
        const fullPath = path_1.default.join(dir, file);
        const stat = fs_1.default.statSync(fullPath);
        if (stat.isDirectory()) {
            scanDir(fullPath, results);
        }
        else if (stat.isFile()) {
            if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.json')) {
                const content = fs_1.default.readFileSync(fullPath, 'utf8');
                for (const token of BACKDOOR_TOKENS) {
                    if (content.includes(token)) {
                        results.backdoors.push(`${fullPath}: contains ${token}`);
                    }
                }
                if (fullPath.includes(path_1.default.join('frontend', 'src'))) {
                    for (const pattern of FORBIDDEN_FRONTEND_PATTERNS) {
                        if (content.includes(pattern)) {
                            results.frontendSecrets.push(`${fullPath}: contains ${pattern}`);
                        }
                    }
                }
                // Exclude test script files from hardcoded string checks
                if (!file.includes('test_') && !file.includes('migrate_')) {
                    for (const regex of HARDCODED_SECRET_PATTERNS) {
                        if (regex.test(content)) {
                            results.hardcodedSecrets.push(`${fullPath}: contains hardcoded secret pattern ${regex}`);
                        }
                    }
                }
            }
        }
    }
}
async function runScan() {
    console.log('🔍 Scanning production source code for hardcoded backdoors, database credentials, & frontend secret leaks...\n');
    const results = { backdoors: [], frontendSecrets: [], hardcodedSecrets: [] };
    scanDir(ROOT_DIR, results);
    console.log('--- SCAN RESULTS ---');
    console.log(`Backdoor Tokens Found: ${results.backdoors.length}`);
    results.backdoors.forEach(b => console.log('  ❌', b));
    console.log(`Frontend Secret Leaks Found: ${results.frontendSecrets.length}`);
    results.frontendSecrets.forEach(s => console.log('  ❌', s));
    console.log(`Hardcoded Secrets Found: ${results.hardcodedSecrets.length}`);
    results.hardcodedSecrets.forEach(h => console.log('  ❌', h));
    if (results.backdoors.length === 0 && results.frontendSecrets.length === 0 && results.hardcodedSecrets.length === 0) {
        console.log('\n✅ NO BACKDOORS, HARDCODED SECRETS, OR FRONTEND SECRET LEAKS FOUND IN PRODUCTION SOURCE CODE!');
    }
    else {
        console.error('\n❌ SECURITY SCAN FAILED!');
        process.exit(1);
    }
}
runScan();
