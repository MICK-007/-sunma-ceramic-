import { getDbClient } from './db';
import fs from 'fs';
import path from 'path';

async function extract() {
  const sql = getDbClient();
  if (!sql) process.exit(1);

  try {
    const rows = await sql`
      SELECT id, filename, mime_type, file_data 
      FROM cms_media 
      WHERE id = '2f63ea5f-280c-468e-899d-145d48ed5198'
    `;
    if (rows.length > 0 && rows[0].file_data) {
      console.log('Found media row:', rows[0].id, rows[0].filename, rows[0].mime_type, 'size:', rows[0].file_data.length);
      const targetPath = path.resolve(__dirname, '../../frontend/public/admin-uploaded-nordic.png');
      fs.writeFileSync(targetPath, rows[0].file_data);
      console.log('Successfully saved to:', targetPath);
    } else {
      console.log('No file_data found for 2f63ea5f');
    }
  } catch (e: any) {
    console.error('Error extracting image:', e.message);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

extract();
