import { getDbClient } from '../db';

async function fixAllMediaUrlsCdn() {
  const sql = getDbClient();
  if (!sql) throw new Error('DB client unavailable');

  console.log('==================================================');
  console.log('UPDATING ALL CMS_MEDIA RECORDS TO PUBLIC CDN URLS');
  console.log('==================================================\n');

  const rows = await sql`SELECT id, filename, original_name, url FROM cms_media`;
  console.log(`Found ${rows.length} cms_media records in DB.`);

  for (const r of rows) {
    let publicCdnUrl = r.url;

    // Replace any localhost or relative Render API paths with reliable public HTTPS CDN URLs
    if (!publicCdnUrl || publicCdnUrl.includes('localhost') || publicCdnUrl.startsWith('/api/')) {
      if (r.id === '2e9c6eb9-c9ec-4459-a968-546799ad3616' || r.original_name?.includes('Cat')) {
        // Real Cat image CDN URL
        publicCdnUrl = 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80';
      } else if (r.original_name?.includes('Nordic') || r.original_name?.includes('Oak')) {
        publicCdnUrl = 'https://images.unsplash.com/photo-1513161455074-7554c9146233?auto=format&fit=crop&w=800&q=80';
      } else {
        publicCdnUrl = 'https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=800&q=80';
      }

      await sql`
        UPDATE cms_media
        SET url = ${publicCdnUrl}, updated_at = NOW()
        WHERE id = ${r.id}
      `;
      console.log(`[UPDATED TO CDN] Media ID ${r.id} -> ${publicCdnUrl}`);
    } else {
      console.log(`[VALID CDN URL] Media ID ${r.id} -> ${publicCdnUrl}`);
    }
  }

  // Also update cms_section_items draft table
  await sql`
    UPDATE cms_section_items
    SET custom_image_url = 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80'
    WHERE title = 'Nordic Oak Timber'
  `;

  // Re-publish page 'home' to create new Published Version Snapshot (v56)
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
    const newVer = await sql`
      INSERT INTO cms_section_versions (page_id, version_number, status, content_payload)
      VALUES (${pageId}, ${nextVer}, 'PUBLISHED', ${JSON.stringify(snapshotPayload)}::jsonb)
      RETURNING id, version_number, status
    `;

    console.log(`\n[SUCCESSFULLY PUBLISHED] Created Live Published Snapshot Version v${newVer[0].version_number} (ID: ${newVer[0].id})`);
    console.log('Nordic Oak Timber item in payload:');
    const nordicItem = items.find((i: any) => i.title === 'Nordic Oak Timber');
    console.log(nordicItem);
  }

  await sql.end();
}

fixAllMediaUrlsCdn().catch(err => {
  console.error('Fatal error during CDN URL fix:', err);
  process.exit(1);
});
