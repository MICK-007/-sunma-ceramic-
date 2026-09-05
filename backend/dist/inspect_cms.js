"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./db");
async function run() {
    const sql = (0, db_1.getDbClient)();
    if (!sql) {
        console.log('No DB client');
        process.exit(1);
    }
    try {
        const items = await sql `SELECT id, section_id, title, media_id, custom_image_url FROM cms_section_items WHERE title ILIKE '%Nordic%'`;
        console.log('--- DRAFT SECTION ITEMS ---');
        console.log(items);
        const media = await sql `SELECT id, filename, mime_type, length(file_data) as file_size, url, storage_path, created_at FROM cms_media ORDER BY created_at DESC LIMIT 15`;
        console.log('--- RECENT CMS MEDIA ---');
        console.log(media);
        const versions = await sql `
      SELECT id, version_number, status, created_at, content_payload 
      FROM cms_section_versions 
      WHERE page_id = (SELECT id FROM cms_pages WHERE slug = 'home') 
        AND status = 'PUBLISHED'
      ORDER BY version_number DESC 
      LIMIT 1
    `;
        console.log('--- LATEST PUBLISHED VERSION ---');
        if (versions.length > 0) {
            const v = versions[0];
            const p = typeof v.content_payload === 'string' ? JSON.parse(v.content_payload) : v.content_payload;
            const nordic = p?.items?.find((i) => i.title?.includes('Nordic'));
            console.log('Nordic in v' + v.version_number + ':', JSON.stringify(nordic, null, 2));
        }
    }
    catch (err) {
        console.error('Inspection error:', err);
    }
    finally {
        await sql.end();
        process.exit(0);
    }
}
run();
