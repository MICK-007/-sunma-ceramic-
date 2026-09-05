import { getDbClient } from '../db';
import { uploadCmsMedia, getCmsMediaUrl } from '../utils/storage';
import fs from 'fs';
import path from 'path';

async function fixCatImage() {
  const sql = getDbClient();
  if (!sql) throw new Error('DB client unavailable');

  console.log('==================================================');
  console.log('FIXING CAT IMAGE PERSISTENCE & PUBLIC URL');
  console.log('==================================================\n');

  const catMediaId = '2e9c6eb9-c9ec-4459-a968-546799ad3616';
  const localFile = path.resolve(__dirname, '../../uploads/cms/media/2e9c6eb9-c9ec-4459-a968-546799ad3616.jpg');

  if (!fs.existsSync(localFile)) {
    console.error('Local file not found:', localFile);
    await sql.end();
    return;
  }

  const fileBuffer = fs.readFileSync(localFile);
  console.log(`Found local cat image binary: ${fileBuffer.length} bytes.`);

  // Upload to Supabase Storage
  const uploadRes = await uploadCmsMedia(catMediaId, 'image/jpeg', fileBuffer);
  console.log('Supabase Upload Result:', uploadRes);

  let targetUrl = uploadRes.url;

  // If URL is still relative or localhost fallback, construct valid public storage URL or public image URL
  if (!targetUrl || targetUrl.startsWith('/') || targetUrl.includes('localhost')) {
    targetUrl = `https://xacaeysrrfqhwpkdjkvm.supabase.co/storage/v1/object/public/cms/media/${catMediaId}.jpg`;
  }

  // Update cms_media record in PostgreSQL
  await sql`
    UPDATE cms_media
    SET url = ${targetUrl}, storage_path = ${`cms/media/${catMediaId}.jpg`}, updated_at = NOW()
    WHERE id = ${catMediaId}
  `;
  console.log(`Updated cms_media record ${catMediaId} -> url: ${targetUrl}`);

  // Update Published Version Snapshot v54 & Draft items
  await sql`
    UPDATE cms_section_items
    SET custom_image_url = ${targetUrl}, media_id = ${catMediaId}
    WHERE title = 'Nordic Oak Timber'
  `;

  // Fetch updated sections & items to create fresh Published Snapshot v55
  const pageRows = await sql`SELECT id FROM cms_pages WHERE slug = 'home' LIMIT 1`;
  if (pageRows.length > 0) {
    const pageId = pageRows[0].id;
    const sections = await sql`
      SELECT id, page_id, section_key, section_type, title, subtitle, sort_order, is_enabled, settings, version, updated_at
      FROM cms_sections WHERE page_id = ${pageId} ORDER BY sort_order ASC
    `;
    const sectionIds = sections.map(s => s.id);
    const items = await sql`
      SELECT 
        item.id, item.section_id, item.title, item.subtitle, item.description, item.icon_name, 
        item.link_url, item.link_label, item.media_id, COALESCE(m.url, item.custom_image_url) as custom_image_url, 
        item.badge_tag, item.sort_order, item.is_enabled, item.metadata
      FROM cms_section_items item
      LEFT JOIN cms_media m ON item.media_id = m.id
      WHERE item.section_id IN ${sql(sectionIds)}
      ORDER BY item.sort_order ASC
    `;

    const latestVerRow = await sql`SELECT COALESCE(MAX(version_number), 0) as max_ver FROM cms_section_versions WHERE page_id = ${pageId}`;
    const nextVer = Number(latestVerRow[0].max_ver) + 1;

    await sql`UPDATE cms_section_versions SET status = 'ARCHIVED' WHERE page_id = ${pageId} AND status = 'PUBLISHED'`;

    const snapshotPayload = { page: pageRows[0], sections, items, publishedAt: new Date().toISOString() };
    const newVerRow = await sql`
      INSERT INTO cms_section_versions (page_id, version_number, status, content_payload)
      VALUES (${pageId}, ${nextVer}, 'PUBLISHED', ${JSON.stringify(snapshotPayload)}::jsonb)
      RETURNING id, version_number
    `;
    console.log(`[PUBLISHED LIVE] Version v${newVerRow[0].version_number} (ID: ${newVerRow[0].id})`);
  }

  await sql.end();
}

fixCatImage().catch(err => {
  console.error('Error fixing cat image:', err);
  process.exit(1);
});
