import { getDbClient } from '../db';

export async function migrateStoragePathColumn() {
  const sql = getDbClient();
  if (!sql) {
    console.error('Failed to get database client');
    return false;
  }

  try {
    console.log('--- DB MIGRATION: Ensure storage_path column exists in cms_media ---');
    await sql`
      ALTER TABLE cms_media 
      ADD COLUMN IF NOT EXISTS storage_path TEXT
    `;
    console.log('✅ Column cms_media.storage_path checked/added successfully.');
    await sql.end();
    return true;
  } catch (err: any) {
    console.error('❌ Error executing DB migration:', err?.message || err);
    if (sql) await sql.end().catch(() => {});
    return false;
  }
}

if (require.main === module) {
  migrateStoragePathColumn().then(success => {
    process.exit(success ? 0 : 1);
  });
}
