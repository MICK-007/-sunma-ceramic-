import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function addPageIdColumn() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL missing');
    return;
  }
  const client = postgres(connectionString, { max: 1 });
  try {
    console.log('Ensuring page_id column exists on cms_section_versions...');
    await client`
      ALTER TABLE cms_section_versions 
      ADD COLUMN IF NOT EXISTS page_id uuid REFERENCES cms_pages(id) ON DELETE CASCADE
    `;
    console.log('✅ Column page_id verified/added successfully!');
  } catch (err) {
    console.error('❌ Error altering table:', err);
  } finally {
    await client.end();
  }
}

addPageIdColumn();
