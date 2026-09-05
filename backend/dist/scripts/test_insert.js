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
async function testInsert() {
    const sql = (0, postgres_1.default)(dbUrl, { max: 1, ssl: { rejectUnauthorized: false } });
    const testEmail = `realtest_${Date.now()}@gmail.com`;
    try {
        console.log('🔄 Attempting INSERT INTO profiles in Supabase DB...');
        await sql `
      INSERT INTO profiles (email, full_name, phone, role, password)
      VALUES (${testEmail}, 'Real Test User', '0812345678', 'USER'::user_role, 'password123')
      ON CONFLICT (email) DO UPDATE SET password = 'password123', full_name = 'Real Test User';
    `;
        console.log('✅ Success! Inserted:', testEmail);
        const rows = await sql `SELECT id, email, full_name FROM profiles WHERE email = ${testEmail};`;
        console.log('QueryResult:', rows);
        // Clean up test user
        await sql `DELETE FROM profiles WHERE email = ${testEmail};`;
        console.log('🧹 Cleaned up test user.');
    }
    catch (err) {
        console.error('❌ Insert Failed Error:', err.message || err);
    }
    finally {
        await sql.end();
    }
}
testInsert();
