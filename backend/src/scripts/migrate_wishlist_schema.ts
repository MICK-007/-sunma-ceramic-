import postgres from 'postgres';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres.xacaeysrrfqhwpkdjkvm:1103703370197Aa@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

async function migrateWishlistSchema() {
  console.log('🔄 Executing Migration: Creating robust wishlists and wishlist_items tables in Supabase PostgreSQL...\n');
  const sql = postgres(dbUrl, { max: 1, ssl: { rejectUnauthorized: false } });

  try {
    // 1. Drop old table if product_id was UUID type
    await sql`
      DROP TABLE IF EXISTS wishlist_items CASCADE;
    `;
    console.log('  ✅ Cleaned up old wishlist_items table schema');

    // 2. Create wishlists table
    await sql`
      CREATE TABLE IF NOT EXISTS wishlists (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
    `;
    console.log('  ✅ Ensured wishlists table exists');

    // 3. Create wishlist_items table with VARCHAR(255) for product_id
    await sql`
      CREATE TABLE IF NOT EXISTS wishlist_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        wishlist_id UUID NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
        product_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        UNIQUE(wishlist_id, product_id)
      );
    `;
    console.log('  ✅ Created wishlist_items table with VARCHAR(255) product_id and UNIQUE constraint');

    console.log('\n🎉 Wishlist Schema Migration Completed Successfully!');
  } catch (err: any) {
    console.error('❌ Migration Error:', err.message || err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

migrateWishlistSchema();
