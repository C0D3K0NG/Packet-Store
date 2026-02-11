<div align="center">

# 📦 Packet Store

**Your private space for thoughts, notes, and fragments.**

A sleek, invite-only note-keeping app with OTP-based gatekeeper authentication,
animated dark UI, and a masonry dashboard.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![Deployed on Vercel](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel)](https://vercel.com)

</div>

---

## ✨ Features

### 🔐 OTP Gatekeeper
- User requests access by entering their email
- A **6-digit OTP** is sent to the admin's email via [Resend](https://resend.com)
- Admin shares the code only with trusted users
- Correct OTP → JWT cookie set → dashboard access granted

### 🎨 Premium Dark UI
- Animated **circuit-board traces** across the landing page (canvas-based)
- Atmospheric **aura glow** background effects
- **Lottie-powered** loading overlay during authentication
- Smooth **Framer Motion** transitions between all states

### 📝 Packet Dashboard
- Create, edit, pin, delete, and color-code notes
- **Masonry grid** layout with responsive columns
- **Inline editing** — click any card to edit
- **6 color themes** per card (default, teal, purple, amber, rose, blue)
- **Avatar dropdown** with sign-out

---

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Fonts | Geist Sans & Geist Mono |
| Animation | Framer Motion, Lottie, Canvas API |
| Auth | JWT (jose) + OTP via Resend |
| Email | Resend API |
| Deployment | Vercel |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Resend](https://resend.com) API key
- (Optional) A [Neon](https://neon.tech) Postgres database

### Setup

```bash
# Clone the repo
git clone https://github.com/C0D3K0NG/Packet-Store.git
cd Packet-Store

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your actual keys

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Environment Variables

| Variable | Description |
|----------|-------------|
| `RESEND_API_KEY` | Your Resend API key for sending OTP emails |
| `ADMIN_EMAIL` | Email that receives OTP codes |
| `JWT_SECRET` | Secret for signing auth cookies |
| `NEXT_PUBLIC_BASE_URL` | Base URL (e.g. `http://localhost:3000`) |
| `DATABASE_URL` | *(Optional)* Neon Postgres connection string |

---

## 🔒 Auth Flow

```
User enters email → Request sent to server
                         ↓
              6-digit OTP generated
                         ↓
           OTP emailed to admin via Resend
                         ↓
           Admin shares code with user
                         ↓
             User enters OTP on site
                         ↓
           OTP verified → JWT cookie set
                         ↓
              Redirected to Dashboard
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── request-access/   # Generates OTP, emails admin
│   │   ├── verify-otp/       # Validates OTP, sets JWT
│   │   ├── me/               # Returns user email from JWT
│   │   └── logout/           # Clears auth cookie
│   ├── components/
│   │   ├── AuraBackground    # Animated atmospheric glow
│   │   ├── MovingLights      # Circuit-board canvas traces
│   │   ├── RequestAccessForm # Multi-step email → OTP form
│   │   └── LoadingOverlay    # Fullscreen Lottie loader
│   ├── dashboard/
│   │   ├── page.tsx          # Main dashboard with masonry grid
│   │   └── components/
│   │       ├── PacketCard    # Note card with edit/pin/delete/color
│   │       └── CreatePacketBar # Quick note input bar
│   └── page.tsx              # Landing page
├── lib/
│   ├── auth.ts               # JWT creation & verification
│   └── store.ts              # In-memory OTP store
└── middleware.ts              # Route protection
```

---

## 🌐 Deployment

This app is optimized for **Vercel**:

1. Push to GitHub
2. Import project in [Vercel Dashboard](https://vercel.com/new)
3. Add environment variables in Vercel project settings
4. Deploy — that's it!

---

<div align="center">

**Built with 🖤 by [C0D3K0NG](https://github.com/C0D3K0NG)**

</div>
