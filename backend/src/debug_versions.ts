import { getDbClient } from './db';

async function listVersions() {
  const sql = getDbClient();
  if (!sql) process.exit(1);

  const rows = await sql`
    SELECT id, version_number, status, created_at, content_payload 
    FROM cms_section_versions 
    WHERE page_id = (SELECT id FROM cms_pages WHERE slug = 'home') 
    ORDER BY version_number DESC 
    LIMIT 10
  `;
  console.log('--- RECENT VERSIONS ---');
  for (const r of rows) {
    let p = typeof r.content_payload === 'string' ? JSON.parse(r.content_payload) : r.content_payload;
    console.log(`v${r.version_number} | status: ${r.status} | created: ${r.created_at} | sections: ${p?.sections?.length || 0} | items: ${p?.items?.length || 0}`);
    if (r.status === 'PUBLISHED') {
      const nordic = p?.items?.find((i: any) => i.title?.includes('Nordic'));
      console.log('   Nordic item in this version:', nordic?.title, nordic?.custom_image_url);
    }
  }

  process.exit(0);
}

listVersions().catch(e => { console.error(e); process.exit(1); });
