import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { generateOtp, saveOtp } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    const otp = generateOtp();
    await saveOtp(email, otp);

    console.log(`[Request Access] ${email} — OTP: ${otp}`);

    // Send OTP directly to the requesting user's email
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: "Packet Store <onboarding@resend.dev>",
        to: email,
        subject: `🔐 Your Packet Store Verification Code`,
        html: `
          <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0c0c0e; border-radius: 16px; color: #fafafa;">
            <h2 style="margin: 0 0 4px; font-size: 22px; color: #fff; letter-spacing: -0.5px;">
              Your Verification Code
            </h2>
            <p style="margin: 0 0 24px; color: #71717a; font-size: 13px;">
              Use this code to access Packet Store
            </p>

            <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 1px;">
                One-Time Verification Code
              </p>
              <span style="font-size: 40px; font-weight: 800; letter-spacing: 10px; color: #fff; font-family: 'Courier New', monospace;">
                ${otp}
              </span>
            </div>

            <p style="margin: 0; font-size: 11px; color: #3f3f46; line-height: 1.5;">
              🔒 This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.
            </p>
          </div>
        `,
      });

      console.log(`[Request Access] OTP email sent to: ${email}`);
    } catch (emailErr) {
      console.error("[Request Access] Email failed:", emailErr);
      console.log(`[Request Access] Manual OTP: ${otp}`);
    }

    return NextResponse.json({ message: "Verification code sent to your email.", otpSent: true });
  } catch (err) {
    console.error("[Request Access] Error:", err);
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}
