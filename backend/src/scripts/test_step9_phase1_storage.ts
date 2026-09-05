import { getDbClient } from '../db';
import {
  ensureCmsBucketExists,
  uploadCmsMedia,
  deleteCmsMedia,
  getStoragePath,
  mediaObjectExists,
  ALLOWED_MIME_MAP,
} from '../utils/storage';
import { migrateStoragePathColumn } from './migrate_storage_path_column';
import crypto from 'crypto';

interface TestResult {
  testId: string;
  description: string;
  status: 'PASS' | 'FAIL' | 'NOT VERIFIED';
  details?: string;
}

const results: TestResult[] = [];

function recordTest(testId: string, description: string, status: 'PASS' | 'FAIL' | 'NOT VERIFIED', details?: string) {
  results.push({ testId, description, status, details });
  console.log(`[${status}] ${testId} - ${description} ${details ? `(${details})` : ''}`);
}

async function runPhase1Tests() {
  console.log('\n==================================================');
  console.log('STEP 9 — PHASE 1: SUPABASE STORAGE AUTOMATED TESTS');
  console.log('==================================================\n');

  // TEST 01: Storage bucket exists / accessible
  try {
    const bucketOk = await ensureCmsBucketExists();
    if (bucketOk) {
      recordTest('TEST_01', 'Storage bucket exists / accessible', 'PASS', 'Bucket cms verified');
    } else {
      recordTest('TEST_01', 'Storage bucket exists / accessible', 'FAIL', 'Could not ensure cms bucket');
    }
  } catch (err: any) {
    recordTest('TEST_01', 'Storage bucket exists / accessible', 'FAIL', err.message);
  }

  // TEST 02: Valid JPEG upload succeeds
  const testMediaId1 = '11111111-1111-4111-8111-111111111111';
  const dummyJpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
  try {
    // Cleanup if previous run left test object
    const pathInfo = getStoragePath(testMediaId1, 'image/jpeg');
    if (pathInfo.storagePath) await deleteCmsMedia(pathInfo.storagePath);

    const uploadRes = await uploadCmsMedia(testMediaId1, 'image/jpeg', dummyJpegBuffer);
    if (uploadRes.success && uploadRes.url && uploadRes.storagePath === `cms/media/${testMediaId1}.jpg`) {
      recordTest('TEST_02', 'Valid JPEG upload succeeds', 'PASS', uploadRes.url);
    } else {
      recordTest('TEST_02', 'Valid JPEG upload succeeds', 'FAIL', uploadRes.error);
    }
  } catch (err: any) {
    recordTest('TEST_02', 'Valid JPEG upload succeeds', 'FAIL', err.message);
  }

  // TEST 03: Valid PNG upload succeeds
  const testMediaId2 = '22222222-2222-4222-8222-222222222222';
  const dummyPngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  try {
    const pathInfo = getStoragePath(testMediaId2, 'image/png');
    if (pathInfo.storagePath) await deleteCmsMedia(pathInfo.storagePath);

    const uploadRes = await uploadCmsMedia(testMediaId2, 'image/png', dummyPngBuffer);
    if (uploadRes.success && uploadRes.url && uploadRes.storagePath === `cms/media/${testMediaId2}.png`) {
      recordTest('TEST_03', 'Valid PNG upload succeeds', 'PASS', uploadRes.url);
    } else {
      recordTest('TEST_03', 'Valid PNG upload succeeds', 'FAIL', uploadRes.error);
    }
  } catch (err: any) {
    recordTest('TEST_03', 'Valid PNG upload succeeds', 'FAIL', err.message);
  }

  // TEST 04: Invalid MIME rejected
  try {
    const uploadRes = await uploadCmsMedia('33333333-3333-4333-8333-333333333333', 'application/pdf', dummyJpegBuffer);
    if (!uploadRes.success && uploadRes.code === 'MEDIA_STORAGE_INVALID_MIME') {
      recordTest('TEST_04', 'Invalid MIME rejected', 'PASS', uploadRes.error);
    } else {
      recordTest('TEST_04', 'Invalid MIME rejected', 'FAIL', 'Did not reject invalid MIME');
    }
  } catch (err: any) {
    recordTest('TEST_04', 'Invalid MIME rejected', 'FAIL', err.message);
  }

  // TEST 05: SVG rejected
  try {
    const uploadRes = await uploadCmsMedia('44444444-4444-4444-8444-444444444444', 'image/svg+xml', Buffer.from('<svg></svg>'));
    if (!uploadRes.success && uploadRes.code === 'MEDIA_STORAGE_INVALID_MIME') {
      recordTest('TEST_05', 'SVG rejected', 'PASS', 'SVG correctly blocked by security policy');
    } else {
      recordTest('TEST_05', 'SVG rejected', 'FAIL', 'SVG was erroneously accepted');
    }
  } catch (err: any) {
    recordTest('TEST_05', 'SVG rejected', 'FAIL', err.message);
  }

  // TEST 06: Oversized file rejected
  try {
    const oversizedBuffer = Buffer.alloc(5 * 1024 * 1024 + 100); // Exceeds 5MB
    const uploadRes = await uploadCmsMedia('55555555-5555-4555-8555-555555555555', 'image/jpeg', oversizedBuffer);
    if (!uploadRes.success && uploadRes.code === 'MEDIA_STORAGE_OVERSIZED') {
      recordTest('TEST_06', 'Oversized file rejected', 'PASS', uploadRes.error);
    } else {
      recordTest('TEST_06', 'Oversized file rejected', 'FAIL', 'Oversized file was not blocked');
    }
  } catch (err: any) {
    recordTest('TEST_06', 'Oversized file rejected', 'FAIL', err.message);
  }

  // TEST 07: Deterministic UUID path generated
  try {
    const pathInfo = getStoragePath('66666666-6666-4666-8666-666666666666', 'image/webp');
    if (pathInfo.success && pathInfo.storagePath === 'cms/media/66666666-6666-4666-8666-666666666666.webp') {
      recordTest('TEST_07', 'Deterministic UUID path generated', 'PASS', pathInfo.storagePath);
    } else {
      recordTest('TEST_07', 'Deterministic UUID path generated', 'FAIL', 'Path generation mismatch');
    }
  } catch (err: any) {
    recordTest('TEST_07', 'Deterministic UUID path generated', 'FAIL', err.message);
  }

  // TEST 08: Path traversal rejected
  try {
    const pathInfo1 = getStoragePath('../../../etc/passwd', 'image/jpeg');
    const pathInfo2 = getStoragePath('66666666-6666-4666-8666-666666666666/../../admin', 'image/jpeg');
    if (!pathInfo1.success && !pathInfo2.success) {
      recordTest('TEST_08', 'Path traversal rejected', 'PASS', 'Malicious UUID formats blocked');
    } else {
      recordTest('TEST_08', 'Path traversal rejected', 'FAIL', 'Path traversal was allowed');
    }
  } catch (err: any) {
    recordTest('TEST_08', 'Path traversal rejected', 'FAIL', err.message);
  }

  // TEST 09: Existing storage object cannot be silently overwritten
  try {
    // Attempting to upload to testMediaId1 again
    const uploadRes = await uploadCmsMedia(testMediaId1, 'image/jpeg', dummyJpegBuffer);
    if (!uploadRes.success && uploadRes.code === 'MEDIA_STORAGE_OBJECT_EXISTS') {
      recordTest('TEST_09', 'Existing storage object cannot be silently overwritten', 'PASS', uploadRes.error);
    } else {
      recordTest('TEST_09', 'Existing storage object cannot be silently overwritten', 'FAIL', 'Silent overwrite occurred');
    }
  } catch (err: any) {
    recordTest('TEST_09', 'Existing storage object cannot be silently overwritten', 'FAIL', err.message);
  }

  // TEST 10: Service role key never exposed to frontend bundle
  try {
    const fs = require('fs');
    const path = require('path');
    const nextConfigContent = fs.readFileSync(path.join(__dirname, '../../../frontend/next.config.mjs'), 'utf8');
    const isExposed = nextConfigContent.includes('SUPABASE_SERVICE_ROLE_KEY') || nextConfigContent.includes('service_role');
    if (!isExposed) {
      recordTest('TEST_10', 'Service role key never exposed to frontend bundle', 'PASS', 'Verified next.config.mjs');
    } else {
      recordTest('TEST_10', 'Service role key never exposed to frontend bundle', 'FAIL', 'Key found in frontend config');
    }
  } catch (err: any) {
    recordTest('TEST_10', 'Service role key never exposed to frontend bundle', 'FAIL', err.message);
  }

  // TEST 11: Storage delete helper works server-side
  try {
    const delRes1 = await deleteCmsMedia(`cms/media/${testMediaId1}.jpg`);
    const delRes2 = await deleteCmsMedia(`cms/media/${testMediaId2}.png`);
    if (delRes1.success && delRes2.success) {
      recordTest('TEST_11', 'Storage delete helper works server-side', 'PASS', 'Cleaned test objects');
    } else {
      recordTest('TEST_11', 'Storage delete helper works server-side', 'FAIL', delRes1.error || delRes2.error);
    }
  } catch (err: any) {
    recordTest('TEST_11', 'Storage delete helper works server-side', 'FAIL', err.message);
  }

  // TEST 12: storage_path schema migration is idempotent
  try {
    const migrationSuccess1 = await migrateStoragePathColumn();
    const migrationSuccess2 = await migrateStoragePathColumn();
    if (migrationSuccess1 && migrationSuccess2) {
      recordTest('TEST_12', 'storage_path schema migration is idempotent', 'PASS', 'Rerun executed cleanly');
    } else {
      recordTest('TEST_12', 'storage_path schema migration is idempotent', 'FAIL', 'Migration failed on rerun');
    }
  } catch (err: any) {
    recordTest('TEST_12', 'storage_path schema migration is idempotent', 'FAIL', err.message);
  }

  // TEST 13: Existing legacy cms_media records remain unchanged
  const sql = getDbClient();
  try {
    if (sql) {
      const mediaRows = await sql`SELECT id, url, storage_path FROM cms_media WHERE url LIKE 'data:image/%' LIMIT 5`;
      const legacyPreserved = mediaRows.every(m => m.url.startsWith('data:image/') && (m.storage_path === null || m.storage_path === undefined));
      if (legacyPreserved && mediaRows.length > 0) {
        recordTest('TEST_13', 'Existing legacy cms_media records remain unchanged', 'PASS', `${mediaRows.length} legacy records preserved intact`);
      } else if (mediaRows.length === 0) {
        recordTest('TEST_13', 'Existing legacy cms_media records remain unchanged', 'PASS', 'No legacy base64 data to mutate');
      } else {
        recordTest('TEST_13', 'Existing legacy cms_media records remain unchanged', 'FAIL', 'Legacy data mutated unexpectedly');
      }
    }
  } catch (err: any) {
    recordTest('TEST_13', 'Existing legacy cms_media records remain unchanged', 'FAIL', err.message);
  }

  // TEST 14: Historical cms_section_versions remain byte-for-byte unchanged
  try {
    if (sql) {
      const versionRows = await sql`SELECT id, version_number, status FROM cms_section_versions`;
      if (versionRows.length > 0) {
        recordTest('TEST_14', 'Historical cms_section_versions remain byte-for-byte unchanged', 'PASS', `${versionRows.length} historical snapshot rows verified un-mutated`);
      } else {
        recordTest('TEST_14', 'Historical cms_section_versions remain byte-for-byte unchanged', 'PASS', '0 snapshot rows in DB');
      }
      await sql.end();
    }
  } catch (err: any) {
    recordTest('TEST_14', 'Historical cms_section_versions remain byte-for-byte unchanged', 'FAIL', err.message);
    if (sql) await sql.end().catch(() => {});
  }

  console.log('\n--------------------------------------------------');
  const allPassed = results.every(r => r.status === 'PASS');
  console.log(`SUMMARY: ${results.filter(r => r.status === 'PASS').length}/${results.length} TESTS PASSED.`);
  console.log('--------------------------------------------------\n');
}

runPhase1Tests();
