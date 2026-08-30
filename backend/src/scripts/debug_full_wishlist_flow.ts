import postgres from 'postgres';
import dotenv from 'dotenv';
import path from 'path';
import jwt from 'jsonwebtoken';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres.xacaeysrrfqhwpkdjkvm:1103703370197Aa@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

async function debugFullWishlistFlow() {
  console.log('🔍 Debugging Full Wishlist DB Flow for dil1...\n');
  const sql = postgres(dbUrl, { max: 1, ssl: { rejectUnauthorized: false } });

  try {
    // 1. Get user profile dil1
    const profiles = await sql`
      SELECT id, email, username FROM profiles WHERE username = 'dil1' OR email LIKE '%prachakchai%';
    `;
    console.log('User Profile dil1:', profiles);

    if (!profiles || profiles.length === 0) {
      console.log('User dil1 not found in database!');
      return;
    }

    const userId = profiles[0].id;

    // 2. Query wishlists table for user
    let wishlistRows = await sql`
      SELECT id FROM wishlists WHERE user_id = ${userId} LIMIT 1;
    `;

    console.log('Existing Wishlist row for dil1:', wishlistRows);

    let wishlistId: string;
    if (!wishlistRows || wishlistRows.length === 0) {
      const newWishlist = await sql`
        INSERT INTO wishlists (user_id) VALUES (${userId}) RETURNING id;
      `;
      wishlistId = newWishlist[0].id;
      console.log('Created NEW Wishlist for dil1:', wishlistId);
    } else {
      wishlistId = wishlistRows[0].id;
      console.log('Using existing Wishlist for dil1:', wishlistId);
    }

    // 3. Insert prod-1 into wishlist_items
    const productId = 'prod-1';
    await sql`
      INSERT INTO wishlist_items (wishlist_id, product_id)
      VALUES (${wishlistId}, ${productId})
      ON CONFLICT (wishlist_id, product_id) DO NOTHING;
    `;
    console.log(`Inserted "${productId}" into wishlist_items!`);

    // 4. Query wishlist_items for dil1
    const items = await sql`
      SELECT product_id as "productId" FROM wishlist_items WHERE wishlist_id = ${wishlistId};
    `;
    console.log('Wishlist items found in DB for dil1:', items);

  } catch (err: any) {
    console.error('❌ Error during debug wishlist flow:', err.message || err);
  } finally {
    await sql.end();
  }
}

debugFullWishlistFlow();
