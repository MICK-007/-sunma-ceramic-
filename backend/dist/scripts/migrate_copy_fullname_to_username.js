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
async function migrateCopyFullnameToUsername() {
    console.log('🔄 Executing Migration: Copying full_name values directly into username column...\n');
    const sql = (0, postgres_1.default)(dbUrl, { max: 1, ssl: { rejectUnauthorized: false } });
    try {
        const rows = await sql `
      SELECT id, email, username, full_name as "fullName"
      FROM profiles;
    `;
        console.log(`Found ${rows.length} profile rows in database.`);
        for (const row of rows) {
            if (!row.fullName)
                continue;
            // Convert spaces or special chars into clean username slug e.g. "dii1" -> "dii1", "Test User" -> "test_user"
            let newUsername = String(row.fullName)
                .trim()
                .toLowerCase()
                .replace(/[^a-z0-9_.-]/g, '_');
            if (!newUsername) {
                newUsername = row.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_.-]/g, '_');
            }
            console.log(`  Updating ID ${row.id}: full_name "${row.fullName}" ➔ username "${newUsername}"`);
            await sql `
        UPDATE profiles
        SET username = ${newUsername}
        WHERE id = ${row.id};
      `;
        }
        console.log('\n🎉 Successfully copied full_name values into username column across all profiles!');
    }
    catch (err) {
        console.error('❌ Migration Error:', err.message || err);
        process.exit(1);
    }
    finally {
        await sql.end();
    }
}
migrateCopyFullnameToUsername();
