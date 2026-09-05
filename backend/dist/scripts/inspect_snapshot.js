"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../db");
async function inspectPayloadDetail() {
    const sql = (0, db_1.getDbClient)();
    if (!sql)
        return;
    try {
        const versions = await sql `
      SELECT id, version_number, status, content_payload
      FROM cms_section_versions
      ORDER BY version_number DESC
    `;
        for (const v of versions) {
            let payload = v.content_payload;
            if (typeof payload === 'string') {
                try {
                    payload = JSON.parse(payload);
                }
                catch (e) { }
            }
            const sections = payload?.sections || [];
            const items = payload?.items || [];
            if (items.length > 0) {
                console.log(`\n--- VERSION v${v.version_number} (${v.status}) ---`);
                console.log(`Sections: ${sections.length}, Items: ${items.length}`);
                items.forEach((item, i) => {
                    console.log(`  Item #${i + 1}:`, {
                        id: item.id,
                        section_id: item.section_id,
                        title: item.title,
                        media_id: item.media_id,
                        custom_image_url_prefix: item.custom_image_url ? String(item.custom_image_url).substring(0, 60) : null,
                        custom_image_url_length: item.custom_image_url ? String(item.custom_image_url).length : 0,
                    });
                });
            }
        }
        const liveItems = await sql `
      SELECT item.id, item.section_id, item.title, item.media_id, item.custom_image_url, m.url as media_url
      FROM cms_section_items item
      LEFT JOIN cms_media m ON item.media_id = m.id
    `;
        console.log('\n--- LIVE DRAFT cms_section_items ---');
        liveItems.forEach((i, idx) => {
            console.log(`  Live Item #${idx + 1}:`, {
                id: i.id,
                title: i.title,
                media_id: i.media_id,
                custom_image_url: i.custom_image_url ? String(i.custom_image_url).substring(0, 40) : null,
                media_url_prefix: i.media_url ? String(i.media_url).substring(0, 40) : null,
            });
        });
        await sql.end();
    }
    catch (err) {
        console.error('Error in script:', err);
        if (sql)
            await sql.end().catch(() => { });
    }
}
inspectPayloadDetail();
