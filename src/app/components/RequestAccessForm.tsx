"use client";

import { useState, useRef, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import LoadingOverlay from "./LoadingOverlay";

type Step = "email" | "loading" | "otp" | "verifying" | "success" | "error";

export default function RequestAccessForm() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState<Step>("email");
  const [errorMsg, setErrorMsg] = useState("");
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  // ─── Step 1: Submit email → OTP sent to admin ───
  async function handleEmailSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStep("error");
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setStep("loading");

    try {
      const res = await fetch("/api/request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");

      setStep("otp");
      setTimeout(() => otpRefs.current[0]?.focus(), 200);
    } catch (err: unknown) {
      setStep("error");
      setErrorMsg(err instanceof Error ? err.message : "Network error. Try again.");
    }
  }

  // ─── Step 2: Verify OTP ───
  async function handleOtpSubmit(e: FormEvent) {
    e.preventDefault();
    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      setStep("error");
      setErrorMsg("Please enter the complete 6-digit code.");
      return;
    }

    setStep("verifying");

    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpValue }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed.");

      setStep("success");
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err: unknown) {
      setStep("error");
      setErrorMsg(err instanceof Error ? err.message : "Verification failed.");
    }
  }

  // ─── OTP input handlers ───
  function handleOtpChange(index: number, value: string) {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (step === "error") setStep("otp");
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
  }

  async function handleResend() {
    setStep("loading");
    setOtp(["", "", "", "", "", ""]);
    try {
      const res = await fetch("/api/request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Failed to resend.");
      setStep("otp");
      setTimeout(() => otpRefs.current[0]?.focus(), 200);
    } catch {
      setStep("error");
      setErrorMsg("Failed to resend. Try again.");
    }
  }

  return (
    <div className="relative w-full max-w-md mx-auto">
      <LoadingOverlay
        isLoading={step === "loading" || step === "verifying"}
        message={step === "verifying" ? "Verifying access..." : "Sending request..."}
      />

      <AnimatePresence mode="wait">
        {/* ═══ SUCCESS ═══ */}
        {step === "success" ? (
          <motion.div key="success" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-5 py-3 text-emerald-400 text-sm font-medium mb-3">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Access granted
            </div>
            <p className="text-zinc-400 text-sm">Redirecting to your dashboard...</p>
          </motion.div>

          /* ═══ OTP INPUT ═══ */
        ) : step === "otp" || (step === "error" && otp.some((d) => d)) ? (
          <motion.div key="otp" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-center">
            <p className="text-zinc-400 text-sm mb-1">Enter the 6-digit verification code</p>
            <p className="text-zinc-500 text-xs mb-5">Check your email for the code we just sent</p>

            <form onSubmit={handleOtpSubmit} className="flex flex-col items-center gap-5">
              <div className="flex gap-2.5" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-12 h-14 rounded-xl bg-white/5 border border-white/10 text-center text-xl font-bold text-white transition-all duration-200 hover:border-white/20 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/20"
                  />
                ))}
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.03, boxShadow: "0 0 25px rgba(255,255,255,0.3), 0 0 60px rgba(255,255,255,0.1)" }}
                whileTap={{ scale: 0.97 }}
                className="w-full h-12 rounded-xl bg-white text-sm font-semibold text-zinc-950 transition-all duration-300 cursor-pointer"
                style={{ boxShadow: "0 0 15px rgba(255,255,255,0.15), 0 0 40px rgba(255,255,255,0.05)" }}
              >
                Verify &amp; Enter
              </motion.button>

              <p className="text-zinc-500 text-xs">
                Didn&apos;t get the code?{" "}
                <button type="button" onClick={handleResend} className="text-zinc-300 hover:text-white underline underline-offset-2 cursor-pointer transition-colors">
                  Resend
                </button>
              </p>
            </form>
          </motion.div>

          /* ═══ EMAIL INPUT ═══ */
        ) : (
          <motion.form key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-3 w-full">
            <div className="relative flex-1">
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (step === "error") setStep("email"); }}
                placeholder="Enter your email"
                disabled={step === "loading"}
                className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 text-sm text-white placeholder:text-zinc-500 transition-all duration-200 hover:border-white/20 focus:border-white/40 disabled:opacity-50"
              />
            </div>

            <motion.button
              type="submit"
              disabled={step === "loading"}
              whileHover={{ scale: 1.03, boxShadow: "0 0 25px rgba(255,255,255,0.3), 0 0 60px rgba(255,255,255,0.1)" }}
              whileTap={{ scale: 0.97 }}
              className="h-12 px-6 rounded-xl bg-white text-sm font-semibold text-zinc-950 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
              style={{ boxShadow: "0 0 15px rgba(255,255,255,0.15), 0 0 40px rgba(255,255,255,0.05)" }}
            >
              Request Access
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Error message */}
      <AnimatePresence>
        {step === "error" && !otp.some((d) => d) && (
          <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute -bottom-7 left-0 right-0 text-center text-xs text-red-400">
            {errorMsg}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
