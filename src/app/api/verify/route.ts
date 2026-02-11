import { NextRequest, NextResponse } from "next/server";
import { createAccessToken, COOKIE_NAME } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  if (!email || !token) {
    return NextResponse.json(
      { error: "Missing email or token." },
      { status: 400 }
    );
  }

  // ─── In production, this would:
  // 1. Look up the token in access_requests table
  // 2. Validate it matches the email and is still pending
  // 3. Insert email into authorized_users table
  // 4. Update request status to 'approved'
  //
  // For now (stub), we accept any email + token and set the cookie.
  // ───

  console.log(`[Verify] Approving access for: ${email} (token: ${token})`);

  // TODO: Uncomment when Postgres is configured
  // const result = await sql`
  //   SELECT * FROM access_requests
  //   WHERE email = ${email} AND token = ${token} AND status = 'pending'
  // `;
  // if (result.rowCount === 0) {
  //   return NextResponse.json({ error: "Invalid or expired link." }, { status: 403 });
  // }
  // await sql`INSERT INTO authorized_users (email) VALUES (${email}) ON CONFLICT DO NOTHING`;
  // await sql`UPDATE access_requests SET status = 'approved' WHERE token = ${token}`;

  // Create JWT and set cookie
  const jwt = await createAccessToken(email);

  const response = NextResponse.redirect(new URL("/dashboard", req.url));
  response.cookies.set(COOKIE_NAME, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });

  return response;
}
