import postgres from 'postgres';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres.xacaeysrrfqhwpkdjkvm:1103703370197Aa@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

async function checkProfiles() {
  const sql = postgres(dbUrl, { max: 1, ssl: { rejectUnauthorized: false } });
  try {
    const rows = await sql`SELECT id, email, full_name FROM profiles ORDER BY created_at DESC;`;
    console.log('\n🔍 REAL LIVE SUPABASE PROFILES TABLE ROWS:');
    console.table(rows);
  } catch (err) {
    console.error('Err:', err);
  } finally {
    await sql.end();
  }
}

checkProfiles();
