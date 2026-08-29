import fs from 'fs';
import path from 'path';

const ROOT_DIR = path.resolve(__dirname, '../../..');

const BACKDOOR_TOKENS = ['admin-token-secret-2026', 'user-token-secret-2026'];
const FORBIDDEN_FRONTEND_SECRETS = ['SUPABASE_SERVICE_ROLE_KEY', 'JWT_SECRET'];

function scanDir(dir: string, results: { backdoors: string[]; frontendSecrets: string[] }) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    if (file === 'node_modules' || file === '.git' || file === '.next' || file === 'dist' || file === 'scripts') continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      scanDir(fullPath, results);
    } else if (stat.isFile()) {
      if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.json')) {
        const content = fs.readFileSync(fullPath, 'utf8');

        for (const token of BACKDOOR_TOKENS) {
          if (content.includes(token)) {
            results.backdoors.push(`${fullPath}: contains ${token}`);
          }
        }

        if (fullPath.includes(path.join('frontend', 'src'))) {
          for (const secret of FORBIDDEN_FRONTEND_SECRETS) {
            if (content.includes(secret) && !file.includes('.example')) {
              results.frontendSecrets.push(`${fullPath}: contains ${secret}`);
            }
          }
        }
      }
    }
  }
}

async function runScan() {
  console.log('🔍 Scanning production source code for hardcoded backdoors & frontend secret leaks...\n');
  const results = { backdoors: [], frontendSecrets: [] };
  scanDir(ROOT_DIR, results);

  console.log('--- SCAN RESULTS ---');
  console.log(`Backdoor Tokens Found in Source Code: ${results.backdoors.length}`);
  results.backdoors.forEach(b => console.log('  ❌', b));

  console.log(`Frontend Secret Leaks Found: ${results.frontendSecrets.length}`);
  results.frontendSecrets.forEach(s => console.log('  ❌', s));

  if (results.backdoors.length === 0 && results.frontendSecrets.length === 0) {
    console.log('\n✅ NO BACKDOORS OR FRONTEND SECRET LEAKS FOUND IN PRODUCTION SOURCE CODE!');
  } else {
    console.error('\n❌ SECURITY SCAN FAILED!');
    process.exit(1);
  }
}

runScan();
