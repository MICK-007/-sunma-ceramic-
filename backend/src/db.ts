import postgres from 'postgres';
import { config } from './config';

export function getDbClient() {
  const dbUrl = process.env.DATABASE_URL || config.databaseUrl;
  if (!dbUrl) return null;
  try {
    return postgres(dbUrl, {
      max: 2,
      idle_timeout: 10,
      connect_timeout: 10,
      ssl: dbUrl.includes('supabase') ? { rejectUnauthorized: false } : undefined,
    });
  } catch (err) {
    console.error('Failed to create postgres client:', err);
    return null;
  }
}
