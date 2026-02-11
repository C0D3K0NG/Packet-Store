/**
 * In-memory OTP store.
 * Admin receives OTP → shares it with user → user enters it → access granted.
 */

interface OtpEntry {
  email: string;
  otp: string;
  createdAt: number;
}

const otpStore: OtpEntry[] = [];

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function saveOtp(email: string, otp: string) {
  // Replace any existing OTP for this email
  const idx = otpStore.findIndex((e) => e.email === email);
  if (idx !== -1) otpStore.splice(idx, 1);
  otpStore.push({ email, otp, createdAt: Date.now() });
}

export function verifyOtp(email: string, otp: string): { valid: boolean; error?: string } {
  const entry = otpStore.find((e) => e.email === email);
  if (!entry) return { valid: false, error: "No OTP found. Please request access first." };
  if (entry.otp !== otp) return { valid: false, error: "Invalid OTP. Please try again." };
  return { valid: true };
}
