import postgres from 'postgres';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres.xacaeysrrfqhwpkdjkvm:1103703370197Aa@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

async function queryEmail() {
  const sql = postgres(dbUrl, { max: 1, ssl: { rejectUnauthorized: false } });
  const cleanEmail = 'prachakchai.srimala@gmail.com';

  try {
    console.log(`🔍 Querying SELECT id FROM profiles WHERE LOWER(email) = '${cleanEmail}'...`);
    const existing = await sql`
      SELECT id, email, full_name FROM profiles 
      WHERE LOWER(email) = ${cleanEmail}
      LIMIT 1
    `;
    console.log('SQL Result length:', existing.length);
    console.log('SQL Result data:', existing);
  } catch (err: any) {
    console.error('Error:', err);
  } finally {
    await sql.end();
  }
}

queryEmail();
