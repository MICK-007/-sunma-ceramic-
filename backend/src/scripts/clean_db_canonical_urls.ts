import { getDbClient } from '../db';
import { getCmsMediaUrl } from '../utils/storage';

export async function cleanDbCanonicalUrls() {
  const sql = getDbClient();
  if (!sql) throw new Error('Database client unavailable');

  console.log('==================================================');
  console.log('CLEANING DATABASE CMS_MEDIA CANONICAL URLS');
  console.log('==================================================\n');

  const rows = await sql`SELECT id, storage_path, url FROM cms_media`;
  console.log(`Auditing total ${rows.length} cms_media records in PostgreSQL...\n`);

  let updatedCount = 0;

  for (const row of rows) {
    const filename = row.storage_path ? row.storage_path.split('/').pop() : `${row.id}.jpg`;
    const cleanStoragePath = `cms/media/${filename}`;
    const canonicalUrl = getCmsMediaUrl(cleanStoragePath);

    if (row.url !== canonicalUrl || row.url.includes('localhost')) {
      await sql`
        UPDATE cms_media
        SET storage_path = ${cleanStoragePath}, url = ${canonicalUrl}, updated_at = NOW()
        WHERE id = ${row.id}
      `;
      console.log(`[CANONICAL UPDATED] ${row.id} -> ${canonicalUrl}`);
      updatedCount++;
    } else {
      console.log(`[ALREADY CANONICAL] ${row.id} -> ${row.url}`);
    }
  }

  const finalRows = await sql`SELECT id, url FROM cms_media WHERE url LIKE '%localhost%'`;
  console.log('\n--------------------------------------------------');
  console.log(`SUMMARY: Total rows = ${rows.length}, Updated = ${updatedCount}, Localhost rows remaining = ${finalRows.length}`);
  console.log('--------------------------------------------------\n');
}

if (require.main === module) {
  cleanDbCanonicalUrls()
    .then(async () => {
      const sql = getDbClient();
      await sql?.end();
      process.exit(0);
    })
    .catch((err) => {
      console.error('Fatal error during database canonical cleanup:', err);
      process.exit(1);
    });
}
