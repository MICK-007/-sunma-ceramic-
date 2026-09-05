"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateStoragePathColumn = migrateStoragePathColumn;
const db_1 = require("../db");
async function migrateStoragePathColumn() {
    const sql = (0, db_1.getDbClient)();
    if (!sql) {
        console.error('Failed to get database client');
        return false;
    }
    try {
        console.log('--- DB MIGRATION: Ensure storage_path column exists in cms_media ---');
        await sql `
      ALTER TABLE cms_media 
      ADD COLUMN IF NOT EXISTS storage_path TEXT
    `;
        console.log('✅ Column cms_media.storage_path checked/added successfully.');
        await sql.end();
        return true;
    }
    catch (err) {
        console.error('❌ Error executing DB migration:', err?.message || err);
        if (sql)
            await sql.end().catch(() => { });
        return false;
    }
}
if (require.main === module) {
    migrateStoragePathColumn().then(success => {
        process.exit(success ? 0 : 1);
    });
}
