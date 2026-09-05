"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../db");
async function inspectCuratedCollections() {
    const sql = (0, db_1.getDbClient)();
    if (!sql)
        throw new Error('DB unavailable');
    console.log('==================================================');
    console.log('1. SECTIONS FOR PAGE home (COLLECTION_GRID)');
    console.log('==================================================');
    const sections = await sql `
    SELECT s.id, s.section_key, s.section_type, s.title, s.subtitle, s.is_enabled, s.sort_order
    FROM cms_sections s
    JOIN cms_pages p ON s.page_id = p.id
    WHERE p.slug = 'home' AND s.section_type = 'COLLECTION_GRID'
  `;
    console.log('COLLECTION_GRID SECTION:', sections);
    if (sections.length > 0) {
        const secId = sections[0].id;
        console.log('\n==================================================');
        console.log('2. DRAFT CMS_SECTION_ITEMS FOR COLLECTION_GRID');
        console.log('==================================================');
        const items = await sql `
      SELECT item.id, item.title, item.media_id, item.custom_image_url, item.is_enabled, item.sort_order, m.url as m_url
      FROM cms_section_items item
      LEFT JOIN cms_media m ON item.media_id = m.id
      WHERE item.section_id = ${secId}
      ORDER BY item.sort_order ASC
    `;
        console.log(items);
    }
    console.log('\n==================================================');
    console.log('3. PUBLISHED CMS_SECTION_VERSIONS SNAPSHOT (STATUS=PUBLISHED)');
    console.log('==================================================');
    const versions = await sql `
    SELECT v.id, v.version_number, v.status, v.created_at, v.content_payload
    FROM cms_section_versions v
    JOIN cms_pages p ON v.page_id = p.id
    WHERE p.slug = 'home' AND v.status = 'PUBLISHED'
    ORDER BY v.version_number DESC
    LIMIT 1
  `;
    if (versions.length > 0) {
        const v = versions[0];
        console.log(`Published Version v${v.version_number} (ID: ${v.id}, Created: ${v.created_at})`);
        const payload = typeof v.content_payload === 'string' ? JSON.parse(v.content_payload) : v.content_payload;
        const pubItems = (payload?.items || []).filter((i) => {
            const sec = (payload?.sections || []).find((s) => s.id === i.section_id);
            return sec?.section_type === 'COLLECTION_GRID';
        });
        console.log('PUBLISHED COLLECTION_GRID ITEMS IN PAYLOAD:');
        pubItems.forEach((pi) => {
            console.log('  ->', {
                id: pi.id,
                title: pi.title,
                media_id: pi.media_id,
                custom_image_url: pi.custom_image_url,
                is_enabled: pi.is_enabled
            });
        });
    }
    console.log('\n==================================================');
    console.log('4. ALL RECORDS IN CMS_MEDIA TABLE');
    console.log('==================================================');
    const media = await sql `SELECT id, filename, original_name, mime_type, storage_path, url, created_at FROM cms_media`;
    console.log(media);
    await sql.end();
}
inspectCuratedCollections().catch(err => {
    console.error(err);
    process.exit(1);
});
