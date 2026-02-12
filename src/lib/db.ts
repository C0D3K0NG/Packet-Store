import { Pool } from "pg";

let pool: Pool | null = null;

export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
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
      authorized_at TIMESTAMP DEFAULT NOW()
    )
  `);

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
}
