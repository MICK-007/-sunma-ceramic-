import { getDbClient } from './db';

async function bindAndPublish() {
  const sql = getDbClient();
  if (!sql) {
    console.error('No DB connection');
    process.exit(1);
  }

  try {
    console.log('1. Copying binary data to legacy ID so both IDs have the real dragon image...');
    await sql`
      UPDATE cms_media
      SET 
        file_data = (SELECT file_data FROM cms_media WHERE id = '2f63ea5f-280c-468e-899d-145d48ed5198'),
        mime_type = 'image/png',
        url = '/images/tiles/dragon-ice.png',
        updated_at = NOW()
      WHERE id = 'c995cdf5-e0da-486e-aefc-c72b1d7b1460'
    `;

    await sql`
      UPDATE cms_media
      SET url = '/images/tiles/dragon-ice.png', updated_at = NOW()
      WHERE id = '2f63ea5f-280c-468e-899d-145d48ed5198'
    `;

    console.log('2. Updating draft section item for Nordic Oak Timber...');
    await sql`
      UPDATE cms_section_items
      SET 
        media_id = '2f63ea5f-280c-468e-899d-145d48ed5198',
        custom_image_url = '/images/tiles/dragon-ice.png',
        updated_at = NOW()
      WHERE title = 'Nordic Oak Timber'
    `;

    console.log('3. Fetching updated draft to build published snapshot...');
    const pageRows = await sql`SELECT id, title FROM cms_pages WHERE slug = 'home' LIMIT 1`;
    if (pageRows.length === 0) {
      console.error('Home page not found');
      process.exit(1);
    }
    const pageId = pageRows[0].id;

    const sections = await sql`
      SELECT id, page_id, section_key, section_type, title, subtitle, sort_order, is_enabled, settings, version, updated_at
      FROM cms_sections
      WHERE page_id = ${pageId}
      ORDER BY sort_order ASC
    `;
    const sectionIds = sections.map(s => s.id);

    const items = await sql`
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
        COALESCE(item.custom_image_url, m.url) as custom_image_url, 
        item.badge_tag, 
        item.sort_order, 
        item.is_enabled, 
        item.metadata
      FROM cms_section_items item
      LEFT JOIN cms_media m ON item.media_id = m.id
      WHERE item.section_id IN ${sql(sectionIds)}
      ORDER BY item.sort_order ASC
    `;

    const latestVerRow = await sql`
      SELECT COALESCE(MAX(version_number), 0) as max_ver
      FROM cms_section_versions
      WHERE page_id = ${pageId}
    `;
    const nextVersion = Number(latestVerRow[0].max_ver) + 1;

    console.log(`4. Archiving old versions and publishing version v${nextVersion}...`);
    await sql`
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

    await sql`
      INSERT INTO cms_section_versions (
        page_id,
        version_number,
        status,
        content_payload,
        created_by
      ) VALUES (
        ${pageId},
        ${nextVersion},
        'PUBLISHED',
        ${JSON.stringify(snapshotPayload)}::jsonb,
        null
      )
    `;

    console.log(`✅ SUCCESS: Published v${nextVersion} with real Dragon Ice image bound to Nordic Oak Timber!`);
  } catch (err: any) {
    console.error('Error binding and publishing:', err.message);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

bindAndPublish();
