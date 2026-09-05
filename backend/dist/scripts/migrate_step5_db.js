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
async function migrateStep5Database() {
    console.log('🔄 Executing Non-Destructive STEP 5 Database Schema Migration...\n');
    const sql = (0, postgres_1.default)(dbUrl, { max: 1, ssl: { rejectUnauthorized: false } });
    try {
        // 1. Add idempotency_key and payload_hash columns to orders table if not exist
        await sql `
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(255),
      ADD COLUMN IF NOT EXISTS payload_hash VARCHAR(64);
    `;
        console.log('  ✅ Added idempotency_key and payload_hash columns to orders table');
        // 2. Add user-scoped UNIQUE constraint orders_user_id_idempotency_key_key if not exists
        await sql `
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'orders_user_id_idempotency_key_key'
        ) THEN
          ALTER TABLE orders 
          ADD CONSTRAINT orders_user_id_idempotency_key_key UNIQUE (user_id, idempotency_key);
        END IF;
      END $$;
    `;
        console.log('  ✅ Enforced UNIQUE(user_id, idempotency_key) constraint on orders table');
        // 3. Add CHECK constraints on products table
        await sql `
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_price_per_piece_check') THEN
          ALTER TABLE products ADD CONSTRAINT products_price_per_piece_check CHECK (price_per_piece >= 0);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_stock_pieces_check') THEN
          ALTER TABLE products ADD CONSTRAINT products_stock_pieces_check CHECK (stock_pieces >= 0);
        END IF;
      END $$;
    `;
        console.log('  ✅ Enforced CHECK constraints on products table (price >= 0, stock >= 0)');
        // 4. Add columns to promotions table for coupon engine
        await sql `
      ALTER TABLE promotions
      ADD COLUMN IF NOT EXISTS code VARCHAR(50),
      ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0 NOT NULL,
      ADD COLUMN IF NOT EXISTS usage_limit INTEGER,
      ADD COLUMN IF NOT EXISTS min_purchase_amount NUMERIC(10, 2) DEFAULT 0.00,
      ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10, 2) DEFAULT 0.00,
      ADD COLUMN IF NOT EXISTS max_discount_amount NUMERIC(10, 2) DEFAULT 0.00;
    `;
        console.log('  ✅ Added code, usage_count, usage_limit, min_purchase_amount, discount_amount to promotions table');
        // 5. Add unique constraint on promotions.code
        await sql `
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'promotions_code_key') THEN
          ALTER TABLE promotions ADD CONSTRAINT promotions_code_key UNIQUE (code);
        END IF;
      END $$;
    `;
        console.log('  ✅ Enforced UNIQUE constraint on promotions.code');
        console.log('\n🎉 STEP 5 Database Schema Migration Completed Successfully!');
    }
    catch (err) {
        console.error('❌ Migration Error:', err.message || err);
        process.exit(1);
    }
    finally {
        await sql.end();
    }
}
migrateStep5Database();
