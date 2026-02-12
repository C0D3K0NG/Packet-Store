/**
 * In-memory packet storage.
 * Packets are stored per-user (keyed by email).
 * Persists while the server is running — resets on restart.
 */

export interface Packet {
  id: string;
  title: string;
  content: string;
  color: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

// user email → packets
const store: Map<string, Packet[]> = new Map();

function getUserPackets(email: string): Packet[] {
  if (!store.has(email)) {
    store.set(email, []);
  }
  return store.get(email)!;
}

/**
 * Get all packets for a user, sorted: pinned first, then by updatedAt desc.
 */
export function getPackets(email: string): Packet[] {
  const packets = getUserPackets(email);
  return [...packets].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

/**
 * Create a new packet.
 */
export function addPacket(email: string, title: string, content: string, color: string): Packet {
  const packets = getUserPackets(email);
  const now = new Date().toISOString();
  const packet: Packet = {
    id: crypto.randomUUID(),
    title,
    content,
    color,
    pinned: false,
    createdAt: now,
    updatedAt: now,
  };
  packets.unshift(packet);
  return packet;
}

/**
 * Update a packet by id.
 */
export function updatePacket(
  email: string,
  id: string,
  data: Partial<Pick<Packet, "title" | "content" | "color" | "pinned">>
): Packet | null {
  const packets = getUserPackets(email);
  const packet = packets.find((p) => p.id === id);
  if (!packet) return null;

  if (data.title !== undefined) packet.title = data.title;
  if (data.content !== undefined) packet.content = data.content;
  if (data.color !== undefined) packet.color = data.color;
  if (data.pinned !== undefined) packet.pinned = data.pinned;
  packet.updatedAt = new Date().toISOString();

  return packet;
}

/**
 * Delete a packet by id.
 */
export function deletePacket(email: string, id: string): boolean {
  const packets = getUserPackets(email);
  const idx = packets.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  packets.splice(idx, 1);
  return true;
}
