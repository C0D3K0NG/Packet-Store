import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken, COOKIE_NAME } from "@/lib/auth";
import { togglePacketShare } from "@/lib/packets";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await verifyAccessToken(token);
  if (!user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  try {
    const { id, enable } = await req.json();

    if (!id || typeof enable !== 'boolean') {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const packet = await togglePacketShare(user.email, id, enable);

    if (!packet) {
      return NextResponse.json({ error: "Packet not found or update failed" }, { status: 404 });
    }

    return NextResponse.json({ packet });
  } catch (err) {
    console.error("Share toggle error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
