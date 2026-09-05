import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
dotenv.config();

const SUPABASE_DB_URL = "postgresql://postgres.xacaeysrrfqhwpkdjkvm:1103703370197Aa@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";

export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  jwtSecret: process.env.JWT_SECRET || 'sunma_ceramic_jwt_secret_key_2026_super_secure',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'sunma_refresh_token_secret_key_2026_secure',
  csrfSecret: process.env.CSRF_SECRET || 'sunma_csrf_token_secret_key_2026_secure',
  bcryptRounds: process.env.BCRYPT_ROUNDS ? parseInt(process.env.BCRYPT_ROUNDS, 10) : 12,
  supabaseUrl: process.env.SUPABASE_URL || 'https://xacaeysrrfqhwpkdjkvm.supabase.co',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhY2FleXNycmZxaHdwa2Rqa3ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MjAxNTA0MDAwMH0.fake_anon_key',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhY2FleXNycmZxaHdwa2Rqa3ZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoyMDE1MDQwMDAwfQ.fake_service_role_key',
  databaseUrl: process.env.DATABASE_URL || SUPABASE_DB_URL,
};
