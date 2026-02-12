import { NextRequest, NextResponse } from "next/server";
import { verifyOtp } from "@/lib/store";
import { createAccessToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required." }, { status: 400 });
    }

    const result = await verifyOtp(email, otp.toString().trim());

    if (!result.valid) {
      return NextResponse.json({ error: result.error }, { status: 403 });
    }

    console.log(`[Verify OTP] ✅ Access granted for: ${email}`);

    const jwt = await createAccessToken(email);

    const response = NextResponse.json({ success: true, redirect: "/dashboard" });
    response.cookies.set(COOKIE_NAME, jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("[Verify OTP] Error:", err);
    return NextResponse.json({ error: "Verification failed." }, { status: 500 });
  }
}
