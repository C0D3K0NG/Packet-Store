"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import PacketCard from "./components/PacketCard";
import CreatePacketBar from "./components/CreatePacketBar";
import { useToast } from "@/app/context/ToastContext";

interface Packet {
  id: string;
  title: string;
  content: string;
  color: string;
  pinned: boolean;
  createdAt: string;
  updatedAt?: string;
}

export default function DashboardPage() {
  const [packets, setPackets] = useState<Packet[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  /* VIEW STATE */
  const [searchQuery, setSearchQuery] = useState("");
  const [isGridView, setIsGridView] = useState(true);
  const [isBlurMode, setIsBlurMode] = useState(false);
  const [fontStyle, setFontStyle] = useState<'sans' | 'mono'>('sans');

  // ─── Fetch packets from API on mount ───
  useEffect(() => {
    fetch("/api/packets")
      .then((r) => r.json())
      .then((data) => {
        if (data.packets) setPackets(data.packets);
        if (data.email) setUserEmail(data.email);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        toast.push("Failed to load packets", "error");
      });
  }, [toast]);

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

  // ─── CREATE ───
  const handleCreate = useCallback(async (title: string, content: string) => {
    try {
      const res = await fetch("/api/packets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, color: "default" }),
      });
      const data = await res.json();
      if (data.packet) {
        setPackets((prev) => [data.packet, ...prev]);
        toast.push("Packet created", "success");
      }
    } catch (err) {
      console.error("Failed to create packet:", err);
      toast.push("Failed to create packet", "error");
    }
  }, [toast]);

  // ─── DELETE ───
  const handleDelete = useCallback(async (id: string) => {
    // Optimistic delete
    const oldPackets = [...packets];
    setPackets((prev) => prev.filter((p) => p.id !== id));
    toast.push("Packet deleted", "info");

    try {
      await fetch("/api/packets", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch (err) {
      console.error("Failed to delete packet:", err);
      setPackets(oldPackets); // Revert
      toast.push("Failed to delete packet", "error");
    }
  }, [packets, toast]);

  // ─── UPDATE ───
  const handleUpdate = useCallback(async (id: string, data: Partial<Packet>) => {
    setPackets((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data } : p))
    );
    try {
      await fetch("/api/packets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...data }),
      });
    } catch (err) {
      console.error("Failed to update packet:", err);
      toast.push("Failed to update packet", "error");
    }
  }, [toast]);

  // ─── PIN/UNPIN ───
  const handlePin = useCallback(async (id: string) => {
    const packet = packets.find((p) => p.id === id);
    if (!packet) return;

    const newPinned = !packet.pinned;
    setPackets((prev) =>
      prev.map((p) => (p.id === id ? { ...p, pinned: newPinned } : p))
    );

    try {
      await fetch("/api/packets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, pinned: newPinned }),
      });
    } catch (err) {
      console.error("Failed to pin packet:", err);
      toast.push("Failed to update pin status", "error");
    }
  }, [packets, toast]);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/";
  };

  // Filter packets
  const filteredPackets = packets.filter((p) =>
    (p.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (p.content?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  // Extract tags from all packets
  const allTags = Array.from(new Set(packets.flatMap(p => p.content.match(/#[a-zA-Z0-9_]+/g) || []))).sort();

  const pinned = filteredPackets.filter((p) => p.pinned);
  const unpinned = filteredPackets.filter((p) => !p.pinned);
  const initial = userEmail ? userEmail.charAt(0).toUpperCase() : "?";

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Subtle background */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[300px] w-[500px] rounded-full bg-teal-500/5 blur-[100px]" />
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <Image
            src="/icon.svg"
            alt="Packet Store"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <span className="text-sm font-semibold text-zinc-200 tracking-tight hidden sm:block">
            Packet Store
          </span>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-lg">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-500 group-focus-within:text-teal-500 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:bg-zinc-900 focus:border-white/20 focus:text-white transition-all outline-none focus:ring-1 focus:ring-white/10"
            />
          </div>
        </div>

        {/* Avatar with dropdown */}
        <div className="relative shrink-0" ref={menuRef}>
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
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
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
      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <CreatePacketBar onCreate={handleCreate} />

        {/* View Options & Tags Toolbar */}
        {!loading && packets.length > 0 && (
          <div className="flex flex-col gap-4 mb-6">

            <div className="flex items-center justify-between flex-wrap gap-4">
              {/* Tags List */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 max-w-full sm:max-w-[60%] mask-linear-fade">
                {allTags.length > 0 && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors whitespace-nowrap ${searchQuery === ""
                        ? "bg-white/10 text-white border-white/20"
                        : "bg-white/5 text-zinc-500 border-white/5 hover:bg-white/10 hover:text-zinc-300"
                      }`}
                  >
                    All
                  </button>
                )}
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors whitespace-nowrap cursor-pointer ${searchQuery === tag
                        ? "bg-teal-500/20 text-teal-300 border-teal-500/30"
                        : "bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10 hover:text-zinc-200"
                      }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* View Toggles (Right Aligned) */}
              <div className="flex items-center gap-2 ml-auto">
                {/* Layout Toggle */}
                <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/5">
                  <button
                    onClick={() => setIsGridView(true)}
                    className={`p-1.5 rounded-md transition-all ${isGridView ? "bg-white/10 text-teal-400" : "text-zinc-500 hover:text-zinc-300"}`}
                    title="Grid View"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setIsGridView(false)}
                    className={`p-1.5 rounded-md transition-all ${!isGridView ? "bg-white/10 text-teal-400" : "text-zinc-500 hover:text-zinc-300"}`}
                    title="List View"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>

                <div className="w-px h-4 bg-white/10 mx-1" />

                {/* Font Toggle */}
                <button
                  onClick={() => setFontStyle(f => f === "sans" ? "mono" : "sans")}
                  className={`p-1.5 rounded-lg border border-white/5 transition-all text-xs font-medium w-8 h-8 flex items-center justify-center ${fontStyle === "mono" ? "bg-white/10 text-teal-400 border-teal-500/20" : "bg-white/5 text-zinc-400 hover:text-zinc-200"}`}
                  title="Toggle Font"
                >
                  {fontStyle === "sans" ? "Aa" : "{}"}
                </button>

                {/* Blur Toggle */}
                <button
                  onClick={() => setIsBlurMode(!isBlurMode)}
                  className={`p-1.5 rounded-lg border border-white/5 transition-all ${isBlurMode ? "bg-white/10 text-teal-400 border-teal-500/20" : "bg-white/5 text-zinc-400 hover:text-zinc-200"}`}
                  title="Privacy Mode (Blur)"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    {isBlurMode ? (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    )}
                    {!isBlurMode && <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />}
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center gap-2 text-zinc-500 text-sm">
              <motion.div
                className="w-4 h-4 border-2 border-zinc-600 border-t-teal-500 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              Loading your packets...
            </div>
          </div>
        ) : (
          <>
            {/* Pinned section */}
            {pinned.length > 0 && (
              <div className="mb-12">
                <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-widest mb-4 px-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                  Pinned
                </p>
                <div className={isGridView ? "columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4" : "max-w-2xl mx-auto space-y-4"}>
                  <AnimatePresence>
                    {pinned.map((packet) => (
                      <PacketCard
                        key={packet.id}
                        packet={packet}
                        onDelete={handleDelete}
                        onUpdate={handleUpdate}
                        onPin={handlePin}
                        isBlurMode={isBlurMode}
                        fontStyle={fontStyle}
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
                  <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-widest mb-4 px-1 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                    Others
                  </p>
                )}
                <div className={isGridView ? "columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4" : "max-w-2xl mx-auto space-y-4"}>
                  <AnimatePresence>
                    {unpinned.map((packet) => (
                      <PacketCard
                        key={packet.id}
                        packet={packet}
                        onDelete={handleDelete}
                        onUpdate={handleUpdate}
                        onPin={handlePin}
                        isBlurMode={isBlurMode}
                        fontStyle={fontStyle}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {packets.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-24 h-24 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center mb-6">
                  <svg className="w-10 h-10 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-zinc-200 mb-2">No packets yet</h3>
                <p className="text-zinc-500 text-sm max-w-xs mb-8">
                  Your digital space is empty. Create your first packet to verify that everything works.
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
