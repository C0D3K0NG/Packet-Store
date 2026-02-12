import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken, COOKIE_NAME } from "@/lib/auth";
import { updateUserSettings } from "@/lib/userSettings";

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await verifyAccessToken(token);
  if (!user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const { theme, cardStyle } = await req.json();

  await updateUserSettings(user.email, { theme, cardStyle });

  return NextResponse.json({ success: true });
}
