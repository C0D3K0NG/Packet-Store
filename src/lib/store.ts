/**
 * OTP store — PostgreSQL-backed.
 * OTPs are persisted in the otp_codes table with a 10-minute expiry.
 */

import { query, initDb } from "./db";

let dbReady: Promise<void> | null = null;
function ensureDb() {
  if (!dbReady) dbReady = initDb();
  return dbReady;
}

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Save an OTP for the given email (upsert). Expires in 10 minutes.
 * Also cleans up any expired OTPs.
 */
export async function saveOtp(email: string, otp: string): Promise<void> {
  await ensureDb();

  // Clean up expired OTPs
  await query(`DELETE FROM otp_codes WHERE expires_at < NOW()`);

  // Upsert — replace any existing OTP for this email
  await query(
    `INSERT INTO otp_codes (email, otp, created_at, expires_at)
     VALUES ($1, $2, NOW(), NOW() + INTERVAL '10 minutes')
     ON CONFLICT (email)
     DO UPDATE SET otp = $2, created_at = NOW(), expires_at = NOW() + INTERVAL '10 minutes'`,
    [email, otp]
  );
}

/**
 * Verify an OTP for the given email.
 * Returns valid:true if the OTP matches and hasn't expired.
 */
export async function verifyOtp(
  email: string,
  otp: string
): Promise<{ valid: boolean; error?: string }> {
  await ensureDb();

  const result = await query(
    `SELECT * FROM otp_codes WHERE email = $1 AND expires_at > NOW()`,
    [email]
  );

  if (result.rows.length === 0) {
    return { valid: false, error: "No OTP found or it has expired. Please request a new code." };
  }

  const entry = result.rows[0];
  if (entry.otp !== otp) {
    return { valid: false, error: "Invalid OTP. Please try again." };
  }

  // OTP is valid — delete it so it can't be reused
  await query(`DELETE FROM otp_codes WHERE email = $1`, [email]);

  return { valid: true };
}
