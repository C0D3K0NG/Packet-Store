"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import PacketCard from "./components/PacketCard";
import CreatePacketBar from "./components/CreatePacketBar";

interface Packet {
  id: string;
  title: string;
  content: string;
  color: string;
  pinned: boolean;
  createdAt: string;
}

// Mock data for development
const MOCK_PACKETS: Packet[] = [
  {
    id: "1",
    title: "Welcome to Packet Store",
    content:
      "Your private space for thoughts. Pin important notes, color-code them, organize your mind.",
    color: "teal",
    pinned: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Project Ideas",
    content:
      "- ESP32 weather station\n- Home automation dashboard\n- AI-powered recipe generator\n- Custom keyboard firmware",
    color: "purple",
    pinned: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Quick Note",
    content: "Remember to push the latest changes before the demo.",
    color: "amber",
    pinned: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    title: "",
    content:
      "The best way to predict the future is to invent it. — Alan Kay",
    color: "default",
    pinned: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "5",
    title: "API Endpoints",
    content:
      "POST /api/request-access\nGET /api/verify\nGET /api/packets\nPOST /api/packets",
    color: "blue",
    pinned: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "6",
    title: "Design Tokens",
    content:
      "Background: zinc-950\nAccent: teal-500\nText: zinc-100 / zinc-400\nBorder: white/10",
    color: "rose",
    pinned: false,
    createdAt: new Date().toISOString(),
  },
];

export default function DashboardPage() {
  const [packets, setPackets] = useState<Packet[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPackets(MOCK_PACKETS);

    // Fetch real email from JWT
    fetch("/api/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.email) setUserEmail(data.email);
      })
      .catch(() => { });
  }, []);

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleCreate = useCallback((title: string, content: string) => {
    const newPacket: Packet = {
      id: crypto.randomUUID(),
      title,
      content,
      color: "default",
      pinned: false,
      createdAt: new Date().toISOString(),
    };
    setPackets((prev) => [newPacket, ...prev]);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setPackets((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const handleUpdate = useCallback(
    (id: string, data: Partial<Packet>) => {
      setPackets((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...data } : p))
      );
    },
    []
  );

  const handlePin = useCallback((id: string) => {
    setPackets((prev) =>
      prev.map((p) => (p.id === id ? { ...p, pinned: !p.pinned } : p))
    );
  }, []);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/";
  };

  const pinned = packets.filter((p) => p.pinned);
  const unpinned = packets.filter((p) => !p.pinned);

  // Get user initial for avatar
  const initial = userEmail ? userEmail.charAt(0).toUpperCase() : "?";

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Subtle background */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[300px] w-[500px] rounded-full bg-teal-500/5 blur-[100px]" />
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Image
            src="/icon.svg"
            alt="Packet Store"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <span className="text-sm font-semibold text-zinc-200 tracking-tight">
            Packet Store
          </span>
        </div>

        {/* Avatar with dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-sm font-bold text-zinc-950 cursor-pointer hover:shadow-lg hover:shadow-teal-500/20 transition-shadow"
            title={userEmail}
          >
            {initial}
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-10 w-56 rounded-xl bg-zinc-900 border border-white/10 shadow-2xl shadow-black/40 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-white/5">
                  <p className="text-xs text-zinc-500">Signed in as</p>
                  <p className="text-sm text-zinc-200 truncate font-medium mt-0.5">
                    {userEmail || "Loading..."}
                  </p>
                </div>
                <div className="p-1.5">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-8">
        <CreatePacketBar onCreate={handleCreate} />

        {/* Pinned section */}
        {pinned.length > 0 && (
          <div className="mb-8">
            <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-widest mb-3 px-1">
              Pinned
            </p>
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
              <AnimatePresence>
                {pinned.map((packet) => (
                  <PacketCard
                    key={packet.id}
                    packet={packet}
                    onDelete={handleDelete}
                    onUpdate={handleUpdate}
                    onPin={handlePin}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Others */}
        {unpinned.length > 0 && (
          <div>
            {pinned.length > 0 && (
              <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-widest mb-3 px-1">
                Others
              </p>
            )}
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
              <AnimatePresence>
                {unpinned.map((packet) => (
                  <PacketCard
                    key={packet.id}
                    packet={packet}
                    onDelete={handleDelete}
                    onUpdate={handleUpdate}
                    onPin={handlePin}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {packets.length === 0 && (
          <div className="text-center py-20">
            <p className="text-zinc-600 text-sm">
              No packets yet. Start by taking a note above.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
