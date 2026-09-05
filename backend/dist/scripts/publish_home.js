"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../db");
async function publishHomeScript() {
    const sql = (0, db_1.getDbClient)();
    if (!sql)
        throw new Error('Database client unavailable');
    console.log('==================================================');
    console.log('PUBLISHING HOME PAGE DRAFT SNAPSHOT TO LIVE');
    console.log('==================================================\n');
    const pageRows = await sql `SELECT id, title FROM cms_pages WHERE slug = 'home' LIMIT 1`;
    if (!pageRows || pageRows.length === 0) {
        console.error('Home page not found');
        await sql.end();
        return;
    }
    const pageId = pageRows[0].id;
    const sections = await sql `
    SELECT id, page_id, section_key, section_type, title, subtitle, sort_order, is_enabled, settings, version, updated_at
    FROM cms_sections
    WHERE page_id = ${pageId}
    ORDER BY sort_order ASC
  `;
    const sectionIds = sections.map(s => s.id);
    let items = [];
    if (sectionIds.length > 0) {
        items = await sql `
      SELECT 
        item.id, 
        item.section_id, 
        item.title, 
        item.subtitle, 
        item.description, 
        item.icon_name, 
        item.link_url, 
        item.link_label, 
        item.media_id, 
        COALESCE(m.url, item.custom_image_url) as custom_image_url, 
        item.badge_tag, 
        item.sort_order, 
        item.is_enabled, 
        item.metadata
      FROM cms_section_items item
      LEFT JOIN cms_media m ON item.media_id = m.id
      WHERE item.section_id IN ${sql(sectionIds)}
      ORDER BY item.sort_order ASC
    `;
    }
    const latestVerRow = await sql `
    SELECT COALESCE(MAX(version_number), 0) as max_ver
    FROM cms_section_versions
    WHERE page_id = ${pageId}
  `;
    const nextVersionNumber = Number(latestVerRow[0].max_ver) + 1;
    await sql `
    UPDATE cms_section_versions
    SET status = 'ARCHIVED'
    WHERE page_id = ${pageId} AND status = 'PUBLISHED'
  `;
    const snapshotPayload = {
        page: pageRows[0],
        sections,
        items,
        publishedAt: new Date().toISOString(),
    };
    const newVer = await sql `
    INSERT INTO cms_section_versions (page_id, version_number, status, content_payload)
    VALUES (${pageId}, ${nextVersionNumber}, 'PUBLISHED', ${JSON.stringify(snapshotPayload)}::jsonb)
    RETURNING id, version_number, status, created_at
  `;
    console.log(`[PUBLISHED LIVE] Created Version v${newVer[0].version_number} (ID: ${newVer[0].id})`);
    console.log('Items in published payload:');
    items.forEach(i => {
        if (i.title === 'Nordic Oak Timber') {
            console.log('  -> Nordic Oak Timber:', {
                media_id: i.media_id,
                custom_image_url: i.custom_image_url,
            });
        }
    });
    await sql.end();
}
publishHomeScript().catch(err => {
    console.error('Fatal publish error:', err);
    process.exit(1);
});
