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
async function queryEmail() {
    const sql = (0, postgres_1.default)(dbUrl, { max: 1, ssl: { rejectUnauthorized: false } });
    const cleanEmail = 'prachakchai.srimala@gmail.com';
    try {
        console.log(`🔍 Querying SELECT id FROM profiles WHERE LOWER(email) = '${cleanEmail}'...`);
        const existing = await sql `
      SELECT id, email, full_name FROM profiles 
      WHERE LOWER(email) = ${cleanEmail}
      LIMIT 1
    `;
        console.log('SQL Result length:', existing.length);
        console.log('SQL Result data:', existing);
    }
    catch (err) {
        console.error('Error:', err);
    }
    finally {
        await sql.end();
    }
}
queryEmail();
