import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

export default {
  schema: './schema/index.ts',
  out: './migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/sunma_ceramic',
  },
} satisfies Config;
