import postgres from 'postgres';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres.xacaeysrrfqhwpkdjkvm:1103703370197Aa@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

async function checkUserWishlist() {
  console.log('🔍 Checking profile and wishlist for dil1...\n');
  const sql = postgres(dbUrl, { max: 1, ssl: { rejectUnauthorized: false } });

  try {
    const profiles = await sql`
      SELECT id, email, username FROM profiles WHERE username = 'dil1' OR email LIKE '%prachakchai%';
    `;
    console.log('User Profiles:', profiles);

    if (profiles.length > 0) {
      const user = profiles[0];
      const wishlists = await sql`
        SELECT * FROM wishlists WHERE user_id = ${user.id};
      `;
      console.log('Wishlists for dil1:', wishlists);

      if (wishlists.length > 0) {
        const items = await sql`
          SELECT * FROM wishlist_items WHERE wishlist_id = ${wishlists[0].id};
        `;
        console.log('Wishlist Items for dil1:', items);
      }
    }
  } catch (err: any) {
    console.error('❌ SQL Error:', err.message || err);
  } finally {
    await sql.end();
  }
}

checkUserWishlist();
