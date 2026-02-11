import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // ─── In production, this would:
    // 1. Insert into access_requests table in Vercel Postgres
    // 2. Generate a unique approval token
    // 3. Send email to admin via Resend with approval link
    //
    // For now, we log and return success so the UI is fully testable.
    // ───

    console.log(`[Request Access] Email: ${email}`);
    console.log(
      `[Request Access] In production, an email would be sent to ADMIN_EMAIL with an approval link.`
    );

    // TODO: Uncomment when Resend + Postgres are configured
    // const token = crypto.randomUUID();
    // await sql`INSERT INTO access_requests (email, token) VALUES (${email}, ${token})`;
    //
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: "Packet Store <onboarding@resend.dev>",
    //   to: process.env.ADMIN_EMAIL!,
    //   subject: `Access Request: ${email}`,
    //   html: `
    //     <p>${email} wants access to Packet Store.</p>
    //     <a href="${process.env.NEXT_PUBLIC_BASE_URL}/api/verify?email=${email}&token=${token}">
    //       ✅ Approve Access
    //     </a>
    //   `,
    // });

    return NextResponse.json({ message: "Access request submitted." });
  } catch {
    return NextResponse.json(
      { error: "Server error. Please try again." },
      { status: 500 }
    );
  }
}
