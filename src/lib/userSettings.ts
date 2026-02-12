
import { query, initDb } from "./db";

let dbReady: Promise<void> | null = null;
function ensureDb() {
  if (!dbReady) dbReady = initDb();
  return dbReady;
}

export interface UserSettings {
  theme: string;
  cardStyle: string;
}

/**
 * Get user settings/preferences.
 */
export async function getUserSettings(email: string): Promise<UserSettings> {
  await ensureDb();
  const result = await query(
    `SELECT theme, card_style FROM authorized_users WHERE email = $1`,
    [email]
  );

  if (result.rows.length === 0) {
    return { theme: "aurora", cardStyle: "glass" };
  }

  const row = result.rows[0];
  return {
    theme: row.theme || "aurora",
    cardStyle: row.card_style || "glass"
  };
}

/**
 * Update user settings.
 */
export async function updateUserSettings(email: string, settings: Partial<UserSettings>): Promise<void> {
  await ensureDb();

  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (settings.theme) {
    fields.push(`theme = $${idx++}`);
    values.push(settings.theme);
  }
  if (settings.cardStyle) {
    fields.push(`card_style = $${idx++}`);
    values.push(settings.cardStyle);
  }

  if (fields.length === 0) return;

  // We only update existing users because they must be authorized to login
  await query(
    `UPDATE authorized_users SET ${fields.join(", ")} WHERE email = $${idx}`,
    [...values, email]
  );
}
