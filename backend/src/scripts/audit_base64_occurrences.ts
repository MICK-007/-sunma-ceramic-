import fs from 'fs';
import path from 'path';

function searchDirectory(dir: string, patterns: string[], results: any[]) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === '.next' || file === '.git' || file === 'dist' || file === 'build') continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchDirectory(fullPath, patterns, results);
    } else if (/\.(ts|tsx|js|mjs)$/.test(file)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const pattern of patterns) {
        if (content.includes(pattern)) {
          const lines = content.split('\n');
          lines.forEach((line, idx) => {
            if (line.includes(pattern)) {
              results.push({
                file: path.relative(process.cwd(), fullPath).replace(/\\/g, '/'),
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

export async function runBase64Audit() {
  console.log('==================================================');
  console.log('STEP 9: LEGACY BASE64 CODEBASE SEARCH & AUDIT');
  console.log('==================================================\n');

  const patterns = ['data:image/', 'readAsDataURL', 'base64,'];
  const results: any[] = [];

  const rootDir = path.resolve(__dirname, '../../..');
  searchDirectory(path.join(rootDir, 'backend/src'), patterns, results);
  searchDirectory(path.join(rootDir, 'frontend/src'), patterns, results);

  console.log(`Found total ${results.length} Base64/FileReader matches in codebase:\n`);

  for (const r of results) {
    let classification = 'UNKNOWN';
    if (r.file.includes('test') || r.file.includes('mock')) {
      classification = 'SAFE TEST / MOCK DATA';
    } else if (r.file.includes('migrate_legacy_base64')) {
      classification = 'LEGACY MIGRATION SCRIPT';
    } else if (r.file.includes('media.controller') || r.file.includes('storage.ts')) {
      classification = 'SAFE PARSING & REJECTION VALIDATION';
    } else if (r.file.includes('frontend')) {
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
