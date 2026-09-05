"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncMediaFilesAndUrls = syncMediaFilesAndUrls;
const db_1 = require("../db");
const storage_1 = require("../utils/storage");
async function syncMediaFilesAndUrls() {
    const sql = (0, db_1.getDbClient)();
    if (!sql)
        throw new Error('DB client unavailable');
    console.log('==================================================');
    console.log('SYNCING CMS MEDIA FILES AND PUBLIC URLS');
    console.log('==================================================\n');
    const rows = await sql `SELECT id, storage_path, url, filename FROM cms_media`;
    console.log(`Found ${rows.length} cms_media records.`);
    for (const row of rows) {
        const filename = row.storage_path ? row.storage_path.split('/').pop() : `${row.id}.jpg`;
        const cleanStoragePath = `cms/media/${filename}`;
        const cleanUrl = (0, storage_1.getCmsMediaUrl)(cleanStoragePath);
        await sql `
      UPDATE cms_media
      SET storage_path = ${cleanStoragePath}, url = ${cleanUrl}, updated_at = NOW()
      WHERE id = ${row.id}
    `;
        console.log(`[SYNCED] ID ${row.id} -> storage_path: ${cleanStoragePath}, url: ${cleanUrl}`);
    }
    console.log('\nMedia URLs synced successfully.');
}
if (require.main === module) {
    syncMediaFilesAndUrls()
        .then(async () => {
        const sql = (0, db_1.getDbClient)();
        await sql?.end();
        process.exit(0);
    })
        .catch((err) => {
        console.error('Error syncing media files:', err);
        process.exit(1);
    });
}
