import postgres from 'postgres';
import { config } from './config';

const FALLBACK_DATABASE_URL = "postgresql://postgres.xacaeysrrfqhwpkdjkvm:1103703370197Aa@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";

export function getDbClient() {
  const dbUrl = process.env.DATABASE_URL || config.databaseUrl || FALLBACK_DATABASE_URL;
  try {
    return postgres(dbUrl, {
      max: 3,
      idle_timeout: 10,
      connect_timeout: 10,
      ssl: { rejectUnauthorized: false },
    });
  } catch (err) {
    console.error('Failed to create postgres client:', err);
    return null;
  }
}
