import postgres from 'postgres';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres.xacaeysrrfqhwpkdjkvm:1103703370197Aa@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

async function inspectWishlistRows() {
  console.log('🔍 Inspecting wishlists and wishlist_items rows in Supabase PostgreSQL...\n');
  const sql = postgres(dbUrl, { max: 1, ssl: { rejectUnauthorized: false } });

  try {
    const wishlists = await sql`SELECT * FROM wishlists;`;
    console.log('📋 Wishlists Table:', wishlists);

    const wishlistItems = await sql`SELECT * FROM wishlist_items;`;
    console.log('📋 Wishlist Items Table:', wishlistItems);
  } catch (err: any) {
    console.error('❌ SQL Error:', err.message || err);
  } finally {
    await sql.end();
  }
}

inspectWishlistRows();
