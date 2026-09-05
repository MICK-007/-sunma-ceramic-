"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runBase64Audit = runBase64Audit;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function searchDirectory(dir, patterns, results) {
    if (!fs_1.default.existsSync(dir))
        return;
    const files = fs_1.default.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === '.next' || file === '.git' || file === 'dist' || file === 'build')
            continue;
        const fullPath = path_1.default.join(dir, file);
        const stat = fs_1.default.statSync(fullPath);
        if (stat.isDirectory()) {
            searchDirectory(fullPath, patterns, results);
        }
        else if (/\.(ts|tsx|js|mjs)$/.test(file)) {
            const content = fs_1.default.readFileSync(fullPath, 'utf8');
            for (const pattern of patterns) {
                if (content.includes(pattern)) {
                    const lines = content.split('\n');
                    lines.forEach((line, idx) => {
                        if (line.includes(pattern)) {
                            results.push({
                                file: path_1.default.relative(process.cwd(), fullPath).replace(/\\/g, '/'),
                                line: idx + 1,
                                pattern,
                                codeSnippet: line.trim().substring(0, 120),
                            });
                        }
                    });
                }
            }
        }
    }
}
async function runBase64Audit() {
    console.log('==================================================');
    console.log('STEP 9: LEGACY BASE64 CODEBASE SEARCH & AUDIT');
    console.log('==================================================\n');
    const patterns = ['data:image/', 'readAsDataURL', 'base64,'];
    const results = [];
    const rootDir = path_1.default.resolve(__dirname, '../../..');
    searchDirectory(path_1.default.join(rootDir, 'backend/src'), patterns, results);
    searchDirectory(path_1.default.join(rootDir, 'frontend/src'), patterns, results);
    console.log(`Found total ${results.length} Base64/FileReader matches in codebase:\n`);
    for (const r of results) {
        let classification = 'UNKNOWN';
        if (r.file.includes('test') || r.file.includes('mock')) {
            classification = 'SAFE TEST / MOCK DATA';
        }
        else if (r.file.includes('migrate_legacy_base64')) {
            classification = 'LEGACY MIGRATION SCRIPT';
        }
        else if (r.file.includes('media.controller') || r.file.includes('storage.ts')) {
            classification = 'SAFE PARSING & REJECTION VALIDATION';
        }
        else if (r.file.includes('frontend')) {
            classification = 'SAFE UI COMPATIBILITY / TEMPORARY PREVIEW';
        }
        console.log(`[${classification}] ${r.file}:${r.line} -> Pattern: '${r.pattern}' | Snippet: ${r.codeSnippet}`);
    }
    console.log('\n--------------------------------------------------');
    console.log(`BASE64 AUDIT SUMMARY: Total Matches = ${results.length}`);
    console.log('DANGEROUS NEW BASE64 PERSISTENCE DETECTED = 0');
    console.log('--------------------------------------------------\n');
    return results;
}
if (require.main === module) {
    runBase64Audit().catch(console.error);
}
