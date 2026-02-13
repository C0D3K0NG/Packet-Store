import { Pool } from "@neondatabase/serverless";

let pool: Pool | null = null;

export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }
  return pool;
}

/**
 * Execute a parameterized SQL query.
 */
export async function query(text: string, params?: unknown[]) {
  const pool = getPool();
  const result = await pool.query(text, params);
  return result;
}

/**
 * Initialize database tables if they don't exist.
 */
export async function initDb() {
  await query(`
    CREATE TABLE IF NOT EXISTS access_requests (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      token UUID NOT NULL UNIQUE,
      status VARCHAR(20) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS authorized_users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      authorized_at TIMESTAMP DEFAULT NOW(),
      theme VARCHAR(20) DEFAULT 'aurora',
      card_style VARCHAR(20) DEFAULT 'glass'
    )
  `);

  // Migration for existing tables (safe to run every time)
  await query(`ALTER TABLE authorized_users ADD COLUMN IF NOT EXISTS theme VARCHAR(20) DEFAULT 'aurora'`);
  await query(`ALTER TABLE authorized_users ADD COLUMN IF NOT EXISTS card_style VARCHAR(20) DEFAULT 'glass'`);

  await query(`
    CREATE TABLE IF NOT EXISTS packets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_email VARCHAR(255) NOT NULL,
      title VARCHAR(255) DEFAULT '',
      content TEXT DEFAULT '',
      color VARCHAR(20) DEFAULT 'default',
      pinned BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS otp_codes (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      otp VARCHAR(6) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      expires_at TIMESTAMP NOT NULL
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS user_preferences (
      email VARCHAR(255) PRIMARY KEY,
      theme VARCHAR(20) DEFAULT 'aurora',
      card_style VARCHAR(20) DEFAULT 'glass',
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Migration for sharing
  await query(`ALTER TABLE packets ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE`);
  await query(`ALTER TABLE packets ADD COLUMN IF NOT EXISTS share_token UUID DEFAULT NULL`);
  await query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_packets_share_token ON packets(share_token) WHERE share_token IS NOT NULL`);
}
