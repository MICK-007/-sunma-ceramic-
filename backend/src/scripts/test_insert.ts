import postgres from 'postgres';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres.xacaeysrrfqhwpkdjkvm:1103703370197Aa@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

async function testInsert() {
  const sql = postgres(dbUrl, { max: 1, ssl: { rejectUnauthorized: false } });
  const testEmail = `realtest_${Date.now()}@gmail.com`;

  try {
    console.log('🔄 Attempting INSERT INTO profiles in Supabase DB...');
    await sql`
      INSERT INTO profiles (email, full_name, phone, role, password)
      VALUES (${testEmail}, 'Real Test User', '0812345678', 'USER'::user_role, 'password123')
      ON CONFLICT (email) DO UPDATE SET password = 'password123', full_name = 'Real Test User';
    `;
    console.log('✅ Success! Inserted:', testEmail);

    const rows = await sql`SELECT id, email, full_name FROM profiles WHERE email = ${testEmail};`;
    console.log('QueryResult:', rows);

    // Clean up test user
    await sql`DELETE FROM profiles WHERE email = ${testEmail};`;
    console.log('🧹 Cleaned up test user.');
  } catch (err: any) {
    console.error('❌ Insert Failed Error:', err.message || err);
  } finally {
    await sql.end();
  }
}

testInsert();
