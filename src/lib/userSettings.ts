
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
    `SELECT theme, card_style FROM user_preferences WHERE email = $1`,
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
 * Update user settings (Upsert).
 */
export async function updateUserSettings(email: string, settings: Partial<UserSettings>): Promise<void> {
  await ensureDb();

  // We need to handle upsert carefully.
  // Since we might be updating one field or both, and the row might not exist.

  const current = await getUserSettings(email);
  const newTheme = settings.theme !== undefined ? settings.theme : current.theme;
  const newStyle = settings.cardStyle !== undefined ? settings.cardStyle : current.cardStyle;

  await query(
    `INSERT INTO user_preferences (email, theme, card_style, updated_at)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (email)
     DO UPDATE SET theme = $2, card_style = $3, updated_at = NOW()`,
    [email, newTheme, newStyle]
  );
}
