import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function addVersionUniqueConstraint() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL missing');
    return;
  }
  const client = postgres(connectionString, { max: 1 });
  try {
    console.log('Adding UNIQUE constraint (page_id, version_number) to cms_section_versions...');
    await client`
      ALTER TABLE cms_section_versions 
      ADD CONSTRAINT cms_section_versions_page_version_unique UNIQUE (page_id, version_number)
    `;
    console.log('✅ Unique constraint cms_section_versions_page_version_unique added successfully!');
  } catch (err: any) {
    if (err.code === '42710') {
      console.log('ℹ️ Unique constraint cms_section_versions_page_version_unique already exists.');
    } else {
      console.error('❌ Error adding constraint:', err);
    }
  } finally {
    await client.end();
  }
}

addVersionUniqueConstraint();
