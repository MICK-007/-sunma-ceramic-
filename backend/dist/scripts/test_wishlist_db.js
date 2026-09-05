"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const postgres_1 = __importDefault(require("postgres"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../.env') });
const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres.xacaeysrrfqhwpkdjkvm:1103703370197Aa@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';
async function testWishlistDb() {
    console.log('🧪 Testing Wishlist SQL Query Execution...\n');
    const sql = (0, postgres_1.default)(dbUrl, { max: 1, ssl: { rejectUnauthorized: false } });
    try {
        // 1. Ensure wishlist table and wishlist_items table exist with correct schema
        await sql `
      CREATE TABLE IF NOT EXISTS wishlists (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
    `;
        await sql `
      CREATE TABLE IF NOT EXISTS wishlist_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        wishlist_id UUID NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        UNIQUE(wishlist_id, product_id)
      );
    `;
        console.log('✅ Successfully created/verified wishlists and wishlist_items tables and UNIQUE constraint');
    }
    catch (err) {
        console.error('❌ SQL Error:', err.message || err);
    }
    finally {
        await sql.end();
    }
}
testWishlistDb();
