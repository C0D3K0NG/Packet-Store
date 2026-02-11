import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken, COOKIE_NAME } from "@/lib/auth";

/**
 * Returns the authenticated user's email from the JWT cookie.
 */
export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ email: null }, { status: 401 });
  }

  const payload = await verifyAccessToken(token);

  if (!payload) {
    return NextResponse.json({ email: null }, { status: 401 });
  }

  return NextResponse.json({ email: payload.email });
}
