"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../db");
async function fixCuratedTileCollectionsFinal() {
    const sql = (0, db_1.getDbClient)();
    if (!sql)
        throw new Error('DB client unavailable');
    console.log('==================================================');
    console.log('FIXING CURATED TILE COLLECTIONS MEDIA & SNAPSHOT');
    console.log('==================================================\n');
    const catCdnUrl = 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80';
    // 1. Update all cms_media records for cat image to point to direct public CDN URL
    await sql `
    UPDATE cms_media
    SET url = ${catCdnUrl}, updated_at = NOW()
    WHERE original_name ILIKE '%Cat%' OR url LIKE '%/api/cms/public/media/file/%'
  `;
    console.log('[1] Updated cms_media records to direct public CDN URL:', catCdnUrl);
    // 2. Update cms_section_items for Nordic Oak Timber
    await sql `
    UPDATE cms_section_items
    SET custom_image_url = ${catCdnUrl}, updated_at = NOW()
    WHERE title = 'Nordic Oak Timber'
  `;
    console.log('[2] Updated cms_section_items for Nordic Oak Timber -> custom_image_url set.');
    // 3. Cleanup unused duplicate cms_media rows if unreferenced
    await sql `
    DELETE FROM cms_media
    WHERE url LIKE '%/api/cms/public/media/file/%'
      AND id NOT IN (SELECT media_id FROM cms_section_items WHERE media_id IS NOT NULL)
  `;
    console.log('[3] Cleaned up unused legacy cms_media rows.');
    // 4. Create new Published Snapshot Version v58 for page home
    const pageRows = await sql `SELECT id FROM cms_pages WHERE slug = 'home' LIMIT 1`;
    if (pageRows.length > 0) {
        const pageId = pageRows[0].id;
        const sections = await sql `
      SELECT id, page_id, section_key, section_type, title, subtitle, sort_order, is_enabled, settings, version, updated_at
      FROM cms_sections WHERE page_id = ${pageId} ORDER BY sort_order ASC
    `;
        const sectionIds = sections.map(s => s.id);
        const items = await sql `
      SELECT 
        item.id, item.section_id, item.title, item.subtitle, item.description, item.icon_name, 
        item.link_url, item.link_label, item.media_id, COALESCE(m.url, item.custom_image_url) as custom_image_url, 
        item.badge_tag, item.sort_order, item.is_enabled, item.metadata
      FROM cms_section_items item
      LEFT JOIN cms_media m ON item.media_id = m.id
      WHERE item.section_id IN ${sql(sectionIds)}
      ORDER BY item.sort_order ASC
    `;
        const latestVerRow = await sql `SELECT COALESCE(MAX(version_number), 0) as max_ver FROM cms_section_versions WHERE page_id = ${pageId}`;
        const nextVer = Number(latestVerRow[0].max_ver) + 1;
        await sql `UPDATE cms_section_versions SET status = 'ARCHIVED' WHERE page_id = ${pageId} AND status = 'PUBLISHED'`;
        const snapshotPayload = { page: pageRows[0], sections, items, publishedAt: new Date().toISOString() };
        const newVerRow = await sql `
      INSERT INTO cms_section_versions (page_id, version_number, status, content_payload)
      VALUES (${pageId}, ${nextVer}, 'PUBLISHED', ${JSON.stringify(snapshotPayload)}::jsonb)
      RETURNING id, version_number, status
    `;
        console.log(`\n[4] [SUCCESSFULLY PUBLISHED SNAPSHOT] Version v${newVerRow[0].version_number} (ID: ${newVerRow[0].id})`);
        console.log('Published Items in COLLECTION_GRID section:');
        items.filter((i) => {
            const sec = sections.find((s) => s.id === i.section_id);
            return sec?.section_type === 'COLLECTION_GRID';
        }).forEach((i) => {
            console.log('  ->', {
                title: i.title,
                media_id: i.media_id,
                custom_image_url: i.custom_image_url
            });
        });
    }
    await sql.end();
}
fixCuratedTileCollectionsFinal().catch(err => {
    console.error('Fatal error during fix:', err);
    process.exit(1);
});
