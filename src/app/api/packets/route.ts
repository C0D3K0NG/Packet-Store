import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken, COOKIE_NAME } from "@/lib/auth";
import { getPackets, addPacket, updatePacket, deletePacket } from "@/lib/packets";
import { getUserSettings } from "@/lib/userSettings";

/**
 * GET /api/packets — Fetch all packets for the authenticated user.
 */
export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await verifyAccessToken(token);
  if (!user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const [packets, settings] = await Promise.all([
    getPackets(user.email),
    getUserSettings(user.email)
  ]);

  return NextResponse.json({ packets, email: user.email, settings });
}

/**
 * POST /api/packets — Create a new packet.
 */
export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await verifyAccessToken(token);
  if (!user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const { title, content, color } = await req.json();
  const packet = await addPacket(user.email, title || "", content || "", color || "default");
  return NextResponse.json({ packet }, { status: 201 });
}

/**
 * PATCH /api/packets — Update an existing packet.
 */
export async function PATCH(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await verifyAccessToken(token);
  if (!user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const { id, ...data } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing packet id" }, { status: 400 });

  const packet = await updatePacket(user.email, id, data);
  if (!packet) return NextResponse.json({ error: "Packet not found" }, { status: 404 });

  return NextResponse.json({ packet });
}

/**
 * DELETE /api/packets — Delete a packet.
 */
export async function DELETE(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await verifyAccessToken(token);
  if (!user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing packet id" }, { status: 400 });

  const success = await deletePacket(user.email, id);
  if (!success) return NextResponse.json({ error: "Packet not found" }, { status: 404 });

  return NextResponse.json({ deleted: true });
}
