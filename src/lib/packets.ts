/**
 * Packet storage — PostgreSQL-backed.
 * All packets are scoped to user_email so each email sees only their own data.
 */

import { query, initDb } from "./db";

export interface Packet {
  id: string;
  title: string;
  content: string;
  color: string;
  pinned: boolean;
  isPublic: boolean;
  shareToken?: string;
  createdAt: string;
  updatedAt: string;
}

// Ensure tables exist on first import
let dbReady: Promise<void> | null = null;
function ensureDb() {
  if (!dbReady) dbReady = initDb();
  return dbReady;
}

/** Map a DB row to a Packet object. */
function rowToPacket(row: Record<string, unknown>): Packet {
  return {
    id: row.id as string,
    title: (row.title as string) || "",
    content: (row.content as string) || "",
    color: (row.color as string) || "default",
    pinned: row.pinned as boolean,
    isPublic: row.is_public as boolean,
    shareToken: (row.share_token as string) || undefined,
    createdAt: (row.created_at as Date).toISOString(),
    updatedAt: (row.updated_at as Date).toISOString(),
  };
}

/**
 * Get all packets for a user, sorted: pinned first, then by updated_at desc.
 */
export async function getPackets(email: string): Promise<Packet[]> {
  await ensureDb();
  const result = await query(
    `SELECT * FROM packets
     WHERE user_email = $1
     ORDER BY pinned DESC, updated_at DESC`,
    [email]
  );
  return result.rows.map(rowToPacket);
}

/**
 * Create a new packet.
 */
export async function addPacket(
  email: string,
  title: string,
  content: string,
  color: string
): Promise<Packet> {
  await ensureDb();
  const result = await query(
    `INSERT INTO packets (user_email, title, content, color)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [email, title, content, color]
  );
  return rowToPacket(result.rows[0]);
}

/**
 * Update a packet by id (only if it belongs to the user).
 */
export async function updatePacket(
  email: string,
  id: string,
  data: Partial<Pick<Packet, "title" | "content" | "color" | "pinned">>
): Promise<Packet | null> {
  await ensureDb();

  // Build dynamic SET clause
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (data.title !== undefined) {
    fields.push(`title = $${idx++}`);
    values.push(data.title);
  }
  if (data.content !== undefined) {
    fields.push(`content = $${idx++}`);
    values.push(data.content);
  }
  if (data.color !== undefined) {
    fields.push(`color = $${idx++}`);
    values.push(data.color);
  }
  if (data.pinned !== undefined) {
    fields.push(`pinned = $${idx++}`);
    values.push(data.pinned);
  }

  if (fields.length === 0) return null;

  fields.push(`updated_at = NOW()`);

  const result = await query(
    `UPDATE packets SET ${fields.join(", ")}
     WHERE id = $${idx++} AND user_email = $${idx}
     RETURNING *`,
    [...values, id, email]
  );

  if (result.rows.length === 0) return null;
  return rowToPacket(result.rows[0]);
}

/**
 * Delete a packet by id (only if it belongs to the user).
 */
export async function deletePacket(email: string, id: string): Promise<boolean> {
  await ensureDb();
  const result = await query(
    `DELETE FROM packets WHERE id = $1 AND user_email = $2`,
    [id, email]
  );
  return (result.rowCount ?? 0) > 0;
}

/**
 * Get a packet by its share token (public access).
 */
export async function getPacketByShareToken(token: string): Promise<Packet | null> {
  await ensureDb();
  const result = await query(
    `SELECT * FROM packets
     WHERE share_token = $1 AND is_public = TRUE`,
    [token]
  );
  if (result.rows.length === 0) return null;
  return rowToPacket(result.rows[0]);
}

/**
 * Toggle share status.
 */
export async function togglePacketShare(
  email: string,
  id: string,
  enable: boolean
): Promise<Packet | null> {
  await ensureDb();

  if (enable) {
    // Enable: Ensure it has a token and is_public=true
    const result = await query(
      `UPDATE packets 
       SET is_public = TRUE, 
           share_token = COALESCE(share_token, gen_random_uuid()),
           updated_at = NOW()
       WHERE id = $1 AND user_email = $2
       RETURNING *`,
      [id, email]
    );
    if (result.rows.length === 0) return null;
    return rowToPacket(result.rows[0]);
  } else {
    // Disable: Set is_public=false
    const result = await query(
      `UPDATE packets 
       SET is_public = FALSE,
           updated_at = NOW()
       WHERE id = $1 AND user_email = $2
       RETURNING *`,
      [id, email]
    );
    if (result.rows.length === 0) return null;
    return rowToPacket(result.rows[0]);
  }
}
