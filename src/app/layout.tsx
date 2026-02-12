import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "./context/ToastContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Packet Store — Your packets, secured.",
  description:
    "A private, invite-only space to store your thoughts. Request access to get started.",
  manifest: "/site.webmanifest",
};

export const viewport = {
  themeColor: "#0c0c0e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased text-[#fafafa] bg-[#0c0c0e] selection:bg-teal-500/30 selection:text-teal-200`}
      >
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
