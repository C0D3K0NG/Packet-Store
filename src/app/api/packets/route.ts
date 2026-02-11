import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken, COOKIE_NAME } from "@/lib/auth";

// ─── Stub API for Packets ───
// In production, these would read/write to Vercel Postgres.
// For now, they return mock responses so the UI is testable.

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await verifyAccessToken(token);
  if (!user) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // TODO: Replace with Postgres query
  // const packets = await sql`SELECT * FROM packets WHERE user_email = ${user.email} ORDER BY pinned DESC, updated_at DESC`;

  return NextResponse.json({ packets: [], email: user.email });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await verifyAccessToken(token);
  if (!user) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const { title, content, color } = await req.json();

  // TODO: Replace with Postgres insert
  // const result = await sql`
  //   INSERT INTO packets (user_email, title, content, color)
  //   VALUES (${user.email}, ${title}, ${content}, ${color || 'default'})
  //   RETURNING *
  // `;

  const mockPacket = {
    id: crypto.randomUUID(),
    title,
    content,
    color: color || "default",
    pinned: false,
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json({ packet: mockPacket }, { status: 201 });
}
