import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { generateOtp, saveOtp } from "@/lib/store";

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    const otp = generateOtp();
    saveOtp(email, otp);

    console.log(`[Request Access] ${email} — OTP: ${otp}`);

    // Send OTP to admin
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: "Packet Store <onboarding@resend.dev>",
        to: process.env.ADMIN_EMAIL!,
        subject: `🔐 Access Code for ${email}`,
        html: `
          <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0c0c0e; border-radius: 16px; color: #fafafa;">
            <h2 style="margin: 0 0 4px; font-size: 22px; color: #fff; letter-spacing: -0.5px;">
              Access Code Request
            </h2>
            <p style="margin: 0 0 24px; color: #71717a; font-size: 13px;">
              Share this code only if you trust the requester
            </p>

            <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
              <p style="margin: 0; font-size: 14px; color: #d4d4d8;">
                <strong style="color: #fff;">Requesting Email:</strong><br/>
                <span style="font-size: 16px; color: #fff;">${email}</span>
              </p>
            </div>

            <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 1px;">
                One-Time Access Code
              </p>
              <span style="font-size: 40px; font-weight: 800; letter-spacing: 10px; color: #fff; font-family: 'Courier New', monospace;">
                ${otp}
              </span>
            </div>

            <p style="margin: 0; font-size: 11px; color: #3f3f46; line-height: 1.5;">
              🔒 The user needs this code to access Packet Store. Only share it if you approve their request.
            </p>
          </div>
        `,
      });

      console.log(`[Request Access] OTP email sent to admin for: ${email}`);
    } catch (emailErr) {
      console.error("[Request Access] Email failed:", emailErr);
      console.log(`[Request Access] Manual OTP: ${otp}`);
    }

    return NextResponse.json({ message: "Code sent to admin.", otpSent: true });
  } catch (err) {
    console.error("[Request Access] Error:", err);
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}
