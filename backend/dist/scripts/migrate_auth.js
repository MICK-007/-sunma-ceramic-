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
async function migrateAuth() {
    console.log('🔄 Connecting to Supabase PostgreSQL to upgrade profiles schema...');
    const sql = (0, postgres_1.default)(dbUrl, { max: 1, ssl: { rejectUnauthorized: false } });
    try {
        // 1. Add password column to profiles if it doesn't exist
        await sql `
      ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS password text;
    `;
        console.log('✅ Added "password" column to profiles table.');
        // 2. Update default passwords for existing profiles
        await sql `
      UPDATE profiles 
      SET password = 'admin1234' 
      WHERE email = 'admin@sunma.com' OR email = 'admin@sunmaceramic.com';
    `;
        await sql `
      UPDATE profiles 
      SET password = 'password123' 
      WHERE password IS NULL;
    `;
        console.log('✅ Updated initial user passwords in Supabase.');
        // 3. Verify all profiles in Supabase
        const profiles = await sql `
      SELECT id, email, full_name, role, password FROM profiles;
    `;
        console.log('\n📋 Current Supabase Profiles in DB:');
        console.table(profiles);
    }
    catch (err) {
        console.error('❌ Migration Error:', err);
    }
    finally {
        await sql.end();
    }
}
migrateAuth();
