import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function makeSectionIdNullable() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL missing');
    return;
  }
  const client = postgres(connectionString, { max: 1 });
  try {
    console.log('Altering cms_section_versions section_id column to DROP NOT NULL...');
    await client`
      ALTER TABLE cms_section_versions 
      ALTER COLUMN section_id DROP NOT NULL
    `;
    console.log('✅ Column section_id updated to nullable successfully!');
  } catch (err) {
    console.error('❌ Error altering table:', err);
  } finally {
    await client.end();
  }
}

makeSectionIdNullable();
