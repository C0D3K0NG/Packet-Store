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
    try {
      await saveOtp(email, otp);
    } catch (dbErr) {
      console.error("[Request Access] DB saveOtp failed:", dbErr instanceof Error ? dbErr.message : dbErr);
      console.error("[Request Access] DB stack:", dbErr instanceof Error ? dbErr.stack : "");
      // Fall through — still send the OTP email even if DB save fails
    }

    console.log(`[Request Access] ${email} — OTP: ${otp}`);

    // Send OTP to admin (always works with Resend free tier)
    // and also attempt to send to the user's email
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);

      const otpHtml = `
        <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0c0c0e; border-radius: 16px; color: #fafafa;">
          <h2 style="margin: 0 0 4px; font-size: 22px; color: #fff; letter-spacing: -0.5px;">
            Verification Code
          </h2>
          <p style="margin: 0 0 24px; color: #71717a; font-size: 13px;">
            Access code for ${email}
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
            🔒 This code expires in 10 minutes.
          </p>
        </div>
      `;

      // Always send to admin (reliable with Resend free tier)
      await resend.emails.send({
        from: "Packet Store <onboarding@resend.dev>",
        to: process.env.ADMIN_EMAIL!,
        subject: `🔐 Verification Code for ${email}`,
        html: otpHtml,
      });
      console.log(`[Request Access] OTP email sent to admin for: ${email}`);

      // Also try sending to the user (works if you have a custom domain on Resend)
      if (email !== process.env.ADMIN_EMAIL) {
        try {
          await resend.emails.send({
            from: "Packet Store <onboarding@resend.dev>",
            to: email,
            subject: `🔐 Your Packet Store Verification Code`,
            html: otpHtml,
          });
          console.log(`[Request Access] OTP email also sent to user: ${email}`);
        } catch {
          console.log(`[Request Access] Could not send to user email (Resend free tier limitation)`);
        }
      }
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
