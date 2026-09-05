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
async function migrateStep2Sessions() {
    console.log('🚀 Starting STEP 2 DB Migration: Creating "sessions" & "security_events" tables...\n');
    const sql = (0, postgres_1.default)(dbUrl, { max: 1, ssl: { rejectUnauthorized: false } });
    try {
        // 1. Create sessions table
        console.log('📌 Creating "sessions" table...');
        await sql `
      CREATE TABLE IF NOT EXISTS sessions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        jti uuid NOT NULL UNIQUE,
        refresh_token_hash text NOT NULL,
        ip_address varchar(45),
        user_agent text,
        expires_at timestamp NOT NULL,
        revoked_at timestamp,
        created_at timestamp NOT NULL DEFAULT now(),
        updated_at timestamp NOT NULL DEFAULT now(),
        last_used_at timestamp NOT NULL DEFAULT now()
      );
    `;
        console.log('✅ "sessions" table created.');
        // Create Indexes
        await sql `CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);`;
        await sql `CREATE INDEX IF NOT EXISTS idx_sessions_jti ON sessions(jti);`;
        await sql `CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(refresh_token_hash);`;
        console.log('✅ Indexes on "sessions" table created.');
        // 2. Create security_events table
        console.log('📌 Creating "security_events" table...');
        await sql `
      CREATE TABLE IF NOT EXISTS security_events (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
        event_type varchar(100) NOT NULL,
        details jsonb,
        ip_address varchar(45),
        user_agent text,
        created_at timestamp NOT NULL DEFAULT now()
      );
    `;
        await sql `CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);`;
        await sql `CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON security_events(event_type);`;
        console.log('✅ "security_events" table and indexes created.');
        console.log('\n🎉 STEP 2 DATABASE MIGRATION COMPLETED SUCCESSFULLY!');
    }
    catch (err) {
        console.error('❌ Migration Error:', err.message || err);
        process.exit(1);
    }
    finally {
        await sql.end();
    }
}
migrateStep2Sessions();
