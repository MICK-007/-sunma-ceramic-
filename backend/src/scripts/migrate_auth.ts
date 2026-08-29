import postgres from 'postgres';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres.xacaeysrrfqhwpkdjkvm:1103703370197Aa@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

async function migrateAuth() {
  console.log('🔄 Connecting to Supabase PostgreSQL to upgrade profiles schema...');
  const sql = postgres(dbUrl, { max: 1, ssl: { rejectUnauthorized: false } });

  try {
    // 1. Add password column to profiles if it doesn't exist
    await sql`
      ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS password text;
    `;
    console.log('✅ Added "password" column to profiles table.');

    // 2. Update default passwords for existing profiles
    await sql`
      UPDATE profiles 
      SET password = 'admin1234' 
      WHERE email = 'admin@sunma.com' OR email = 'admin@sunmaceramic.com';
    `;

    await sql`
      UPDATE profiles 
      SET password = 'password123' 
      WHERE password IS NULL;
    `;
    console.log('✅ Updated initial user passwords in Supabase.');

    // 3. Verify all profiles in Supabase
    const profiles = await sql`
      SELECT id, email, full_name, role, password FROM profiles;
    `;
    console.log('\n📋 Current Supabase Profiles in DB:');
    console.table(profiles);

  } catch (err) {
    console.error('❌ Migration Error:', err);
  } finally {
    await sql.end();
  }
}

migrateAuth();
