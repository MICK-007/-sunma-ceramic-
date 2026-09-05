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
async function inspectWishlistRows() {
    console.log('🔍 Inspecting wishlists and wishlist_items rows in Supabase PostgreSQL...\n');
    const sql = (0, postgres_1.default)(dbUrl, { max: 1, ssl: { rejectUnauthorized: false } });
    try {
        const wishlists = await sql `SELECT * FROM wishlists;`;
        console.log('📋 Wishlists Table:', wishlists);
        const wishlistItems = await sql `SELECT * FROM wishlist_items;`;
        console.log('📋 Wishlist Items Table:', wishlistItems);
    }
    catch (err) {
        console.error('❌ SQL Error:', err.message || err);
    }
    finally {
        await sql.end();
    }
}
inspectWishlistRows();
