import postgres from 'postgres';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres.xacaeysrrfqhwpkdjkvm:1103703370197Aa@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

async function migrateUsernameSync() {
  console.log('🔄 Executing Username Sync Migration in Supabase PostgreSQL...\n');
  const sql = postgres(dbUrl, { max: 1, ssl: { rejectUnauthorized: false } });

  try {
    // 1. Sync any NULL or empty username in profiles table to use full_name or email prefix
    await sql`
      UPDATE profiles
      SET username = COALESCE(
        NULLIF(username, ''),
        NULLIF(LOWER(REGEXP_REPLACE(full_name, '[^a-zA-Z0-9_.-]', '_', 'g')), ''),
        LOWER(SPLIT_PART(email, '@', 1))
      )
      WHERE username IS NULL OR username = '';
    `;
    console.log('  ✅ Synchronized empty/null usernames with full_name / email prefix');

    // 2. Also set full_name to match username if full_name is empty
    await sql`
      UPDATE profiles
      SET full_name = username
      WHERE full_name IS NULL OR full_name = '';
    `;
    console.log('  ✅ Synchronized empty full_names to match username');

    console.log('\n🎉 Username Sync Migration Completed Successfully!');
  } catch (err: any) {
    console.error('❌ Migration Error:', err.message || err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

migrateUsernameSync();
