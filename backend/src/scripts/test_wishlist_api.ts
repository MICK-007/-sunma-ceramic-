import postgres from 'postgres';
import dotenv from 'dotenv';
import path from 'path';
import jwt from 'jsonwebtoken';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres.xacaeysrrfqhwpkdjkvm:1103703370197Aa@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';
const jwtSecret = process.env.JWT_SECRET || 'sunma_ceramic_jwt_secret_key_2026_super_secure';

async function testWishlistApi() {
  console.log('🧪 Testing Wishlist Controller SQL Execution directly...\n');
  const sql = postgres(dbUrl, { max: 1, ssl: { rejectUnauthorized: false } });

  try {
    // Find first profile
    const profiles = await sql`SELECT id, email, username FROM profiles LIMIT 1;`;
    if (!profiles || profiles.length === 0) {
      console.log('No profiles found!');
      return;
    }
    const user = profiles[0];
    console.log('Using profile:', user);

    // Test 1: Ensure wishlist record exists for user
    let wishlistRows = await sql`
      SELECT id FROM wishlists WHERE user_id = ${user.id} LIMIT 1;
    `;

    let wishlistId: string;
    if (!wishlistRows || wishlistRows.length === 0) {
      const newWishlist = await sql`
        INSERT INTO wishlists (user_id) VALUES (${user.id}) RETURNING id;
      `;
      wishlistId = newWishlist[0].id;
    } else {
      wishlistId = wishlistRows[0].id;
    }
    console.log('✅ Wishlist ID for user:', wishlistId);

    // Test 2: Insert item into wishlist_items
    const productId = 'prod-1';
    await sql`
      INSERT INTO wishlist_items (wishlist_id, product_id)
      VALUES (${wishlistId}, ${productId})
      ON CONFLICT (wishlist_id, product_id) DO NOTHING;
    `;
    console.log('✅ Successfully inserted product into wishlist_items!');

    // Test 3: Select updated wishlist items
    const updatedRows = await sql`
      SELECT product_id as "productId" FROM wishlist_items WHERE wishlist_id = ${wishlistId};
    `;
    console.log('📋 Updated Wishlist Product IDs:', updatedRows.map((r: any) => r.productId));

  } catch (err: any) {
    console.error('❌ Error executing wishlist DB logic:', err.message || err);
  } finally {
    await sql.end();
  }
}

testWishlistApi();
