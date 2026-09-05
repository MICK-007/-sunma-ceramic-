import { getDbClient } from '../db';
import { uploadCmsMedia, getCmsMediaUrl, ALLOWED_MIME_MAP } from '../utils/storage';

/**
 * Binary magic-byte / signature detector to prevent uploading fake or corrupt binaries
 */
function detectBinaryMimeType(buffer: Buffer): string | null {
  if (!buffer || buffer.length < 4) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }

  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return 'image/png';
  }

  // GIF: GIF87a or GIF89a
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
    return 'image/gif';
  }

  // WebP: RIFF ... WEBP
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
  ) {
    return 'image/webp';
  }

  // AVIF: ftypavif or ftypisom
  if (buffer.length >= 12) {
    const ftyp = buffer.subarray(4, 8).toString('ascii');
    if (ftyp === 'ftyp') {
      const brand = buffer.subarray(8, 12).toString('ascii');
      if (brand.includes('avif') || brand.includes('mif1')) {
        return 'image/avif';
      }
    }
  }

  return null;
}

export async function runLegacyBase64Migration(): Promise<{
  total: number;
  migrated: number;
  skipped: number;
  failed: number;
}> {
  const sql = getDbClient();
  if (!sql) throw new Error('DB client null');

  console.log('==================================================');
  console.log('STEP 9 — PHASE 3: LEGACY BASE64 MEDIA MIGRATION');
  console.log('==================================================\n');

  // Query all cms_media records
  const records = await sql`
    SELECT id, filename, original_name, mime_type, size_bytes, storage_path, url 
    FROM cms_media
    ORDER BY created_at ASC
  `;

  console.log(`Found total ${records.length} cms_media records in database.`);

  let total = records.length;
  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  for (const record of records) {
    const mediaId = record.id;
    const currentUrl = record.url || '';
    const currentStoragePath = record.storage_path || '';

    // Check if already migrated to HTTPS Storage
    if (currentStoragePath.startsWith('cms/media/') && currentUrl.startsWith('http')) {
      console.log(`[SKIP] Record ${mediaId} already migrated to Supabase Storage: ${currentStoragePath}`);
      skipped++;
      continue;
    }

    // Check if it's a Base64 Data URI
    if (!currentUrl.startsWith('data:image/')) {
      console.log(`[SKIP] Record ${mediaId} is not a Base64 Data URI. URL: ${currentUrl.substring(0, 40)}`);
      skipped++;
      continue;
    }

    try {
      // Parse Base64 Data URI: data:image/png;base64,...
      const match = currentUrl.match(/^data:(image\/[a-zA-Z0-9\+\-\.]+);base64,(.+)$/);
      if (!match) {
        console.warn(`[WARN/SKIP] Record ${mediaId} has malformed/corrupt Base64 Data URI header. Skipping.`);
        skipped++;
        continue;
      }

      const declaredMime = match[1];
      const base64Data = match[2];

      let buffer: Buffer;
      try {
        buffer = Buffer.from(base64Data, 'base64');
      } catch (err) {
        console.warn(`[WARN/SKIP] Record ${mediaId} failed Base64 decoding. Skipping.`);
        skipped++;
        continue;
      }

      if (!buffer || buffer.length === 0) {
        console.warn(`[WARN/SKIP] Record ${mediaId} decoded to 0 bytes. Skipping.`);
        skipped++;
        continue;
      }

      // Detect binary magic bytes
      const detectedMime = detectBinaryMimeType(buffer) || declaredMime;
      if (!ALLOWED_MIME_MAP[detectedMime]) {
        console.warn(`[WARN/SKIP] Record ${mediaId} has disallowed MIME '${detectedMime}'. Skipping.`);
        skipped++;
        continue;
      }

      // Upload binary to Supabase Storage using same mediaId (media_id X remains X)
      const uploadRes = await uploadCmsMedia(mediaId, detectedMime, buffer);
      if (!uploadRes.success || !uploadRes.storagePath || !uploadRes.url) {
        console.error(`[FAIL] Failed to upload legacy binary for record ${mediaId}: ${uploadRes.error}`);
        failed++;
        continue;
      }

      // Update the SAME database row with storage_path and HTTPS URL
      await sql`
        UPDATE cms_media
        SET 
          storage_path = ${uploadRes.storagePath},
          url = ${uploadRes.url},
          mime_type = ${detectedMime},
          size_bytes = ${buffer.length},
          updated_at = NOW()
        WHERE id = ${mediaId}
      `;

      console.log(`[MIGRATED] Record ${mediaId} updated -> storage_path: ${uploadRes.storagePath}, url: ${uploadRes.url}`);
      migrated++;
    } catch (err: any) {
      console.error(`[FAIL] Exception migrating record ${mediaId}:`, err?.message || err);
      failed++;
    }
  }

  console.log('\n--------------------------------------------------');
  console.log(`MIGRATION SUMMARY: Total=${total}, Migrated=${migrated}, Skipped=${skipped}, Failed=${failed}`);
  console.log('--------------------------------------------------\n');

  return { total, migrated, skipped, failed };
}

// Standalone execution if run directly via CLI
if (require.main === module) {
  runLegacyBase64Migration()
    .then(async (res) => {
      const sql = getDbClient();
      await sql?.end();
      process.exit(res.failed > 0 ? 1 : 0);
    })
    .catch((err) => {
      console.error('Fatal migration error:', err);
      process.exit(1);
    });
}
