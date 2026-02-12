"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import PacketCard from "./components/PacketCard";
import CreatePacketBar from "./components/CreatePacketBar";
import AuraBackground from "../components/AuraBackground";
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
  const [showAppearance, setShowAppearance] = useState(false);
  const [loading, setLoading] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);
  const appearanceRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  /* VIEW STATE */
  const [searchQuery, setSearchQuery] = useState("");
  const [isGridView, setIsGridView] = useState(true);
  const [isBlurMode, setIsBlurMode] = useState(false);
  const [fontStyle, setFontStyle] = useState<'sans' | 'mono'>('sans');

  /* APPEARANCE STATE */
  const [theme, setTheme] = useState<"aurora" | "neon" | "velvet" | "ocean" | "sunset" | "matrix" | "monochrome" | "cosmic" | "serenity" | "terminal" | "glitch" | "quantum">("aurora");
  const [cardVariant, setCardVariant] = useState<"glass" | "solid" | "outline" | "brutal" | "ghost" | "cyber" | "neumorph" | "pixel" | "retro" | "glow" | "clay" | "paper">("glass");
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");

  // Light Mode detection for Serenity theme (and potentially Paper style if we want force light mode, but let's stick to theme driving it)
  const isLightMode = theme === "serenity";

  // ─── Fetch packets & settings on mount ───
  useEffect(() => {
    fetch("/api/packets")
      .then((r) => r.json())
      .then((data) => {
        if (data.packets) setPackets(data.packets);
        if (data.email) setUserEmail(data.email);
        if (data.settings) {
          if (data.settings.theme) setTheme(data.settings.theme);
          if (data.settings.cardStyle) setCardVariant(data.settings.cardStyle);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        toast.push("Failed to load data", "error");
      });
  }, [toast]);

  // ─── Persist Settings ───
  const persistSettings = useCallback((newTheme?: string, newStyle?: string) => {
    fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        theme: newTheme,
        cardStyle: newStyle
      }),
    }).catch(err => console.error("Failed to save settings", err));
  }, []);

  const handleThemeChange = (newTheme: typeof theme) => {
    setTheme(newTheme);
    persistSettings(newTheme, undefined);
  };

  const handleStyleChange = (newStyle: typeof cardVariant) => {
    setCardVariant(newStyle);
    persistSettings(undefined, newStyle);
  };

  // Close menus on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
      if (appearanceRef.current && !appearanceRef.current.contains(e.target as Node)) {
        setShowAppearance(false);
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

  // Dynamic Base BG Color
  const getBaseBgColor = () => {
    if (theme === "neon") return "bg-[#050505]";
    if (theme === "velvet") return "bg-[#0a0505]";
    if (theme === "ocean") return "bg-[#000810]";
    if (theme === "sunset") return "bg-[#0f0505]";
    if (theme === "matrix") return "bg-[#000500]";
    if (theme === "monochrome") return "bg-black";
    if (theme === "cosmic") return "bg-[#0b0014]";
    if (theme === "serenity") return "bg-[#f0f2f0]"; // Light!
    if (theme === "terminal") return "bg-[#1a1200]";
    if (theme === "glitch") return "bg-[#050505]";
    if (theme === "quantum") return "bg-[#050014]";
    return "bg-zinc-950"; // Aurora
  };

  // Text Color helpers
  const textPrimary = isLightMode ? "text-zinc-800" : "text-zinc-200";
  const textSecondary = isLightMode ? "text-zinc-500" : "text-zinc-400";
  const borderLight = isLightMode ? "border-black/5" : "border-white/5";
  const bgSurface = isLightMode ? "bg-white/50" : "bg-zinc-950/80";

  return (
    <div className={`min-h-screen transition-colors duration-500 ${getBaseBgColor()} ${isLightMode ? 'light-mode-active' : ''}`}>
      {/* Dynamic Background */}
      <AuraBackground theme={theme} />

      {/* Navbar */}
      <nav className={`sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b ${borderLight} ${bgSurface} backdrop-blur-xl gap-4`}>
        <div className="flex items-center gap-3 shrink-0">
          <Image
            src="/icon.svg"
            alt="Packet Store"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <span className={`text-sm font-semibold tracking-tight hidden sm:block ${textPrimary}`}>
            Packet Store
          </span>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-lg">
          <div className="relative group">
            <div className={`absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none transition-colors ${theme === "neon" ? "text-fuchsia-500" :
              theme === "matrix" ? "text-green-500" :
                theme === "terminal" ? "text-amber-500" :
                  isLightMode ? "text-zinc-400 group-focus-within:text-teal-600" :
                    "text-zinc-500 group-focus-within:text-teal-500"
              }`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full bg-transparent border rounded-xl py-2 pl-10 pr-4 text-sm transition-all outline-none ${isLightMode
                ? "border-black/10 text-zinc-800 placeholder:text-zinc-400 focus:bg-white/50 focus:border-teal-500/50"
                : "bg-white/5 border-white/10 text-zinc-200 placeholder:text-zinc-600 focus:bg-zinc-900"
                } ${theme === "neon" ? "focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/20" :
                  theme === "matrix" ? "focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20" :
                    theme === "terminal" ? "focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20" :
                      "focus:border-white/20 focus:ring-1 focus:ring-white/10"
                }`}
            />
          </div>
        </div>

        {/* Appearance & User Menu */}
        <div className="flex items-center gap-2">
          {/* Appearance Menu Toggle */}
          <div className="relative" ref={appearanceRef}>
            <button
              onClick={() => setShowAppearance(!showAppearance)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isLightMode ? "text-zinc-500 hover:text-zinc-800 hover:bg-black/5" : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                }`}
              title="Appearance"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </button>

            <AnimatePresence>
              {showAppearance && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 4 }}
                  className={`absolute right-0 top-10 w-72 rounded-xl border shadow-2xl p-4 z-50 glass-panel ${isLightMode ? "bg-white/90 border-black/10 text-zinc-800" : "bg-zinc-900 border-white/10"
                    }`}
                >
                  <div className="space-y-5">
                    {/* Theme Section */}
                    <div>
                      <h4 className={`text-[10px] uppercase font-bold mb-2 ${isLightMode ? "text-zinc-400" : "text-zinc-600"}`}>Theme</h4>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { id: "aurora", bg: "bg-teal-500" },
                          { id: "neon", bg: "bg-fuchsia-600" },
                          { id: "velvet", bg: "bg-rose-900" },
                          { id: "ocean", bg: "bg-blue-600" },
                          { id: "sunset", bg: "bg-orange-500" },
                          { id: "matrix", bg: "bg-green-600" },
                          { id: "monochrome", bg: "bg-zinc-400" },
                          { id: "cosmic", bg: "bg-purple-600" },
                          { id: "serenity", bg: "bg-[#d1e8e2] border-gray-300" }, // Light Mode
                          { id: "terminal", bg: "bg-amber-600" },
                          { id: "glitch", bg: "bg-red-600" },
                          { id: "quantum", bg: "bg-violet-600" },
                        ].map(t => (
                          <button
                            key={t.id}
                            onClick={() => handleThemeChange(t.id as any)}
                            className={`h-8 rounded-lg border flex items-center justify-center transition-all ${theme === t.id
                              ? "border-white/40 ring-2 ring-white/10 scale-110"
                              : "border-transparent opacity-60 hover:opacity-100 hover:scale-105"
                              } ${t.bg}`}
                            title={t.id}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Card Style */}
                    <div>
                      <h4 className={`text-[10px] uppercase font-bold mb-2 ${isLightMode ? "text-zinc-400" : "text-zinc-600"}`}>Card Style</h4>
                      <div className={`grid grid-cols-3 gap-1 rounded-lg p-1 border ${isLightMode ? "bg-zinc-100 border-black/5" : "bg-zinc-950 border-white/5"}`}>
                        {["glass", "solid", "outline", "brutal", "ghost", "cyber", "neumorph", "pixel", "retro", "glow", "clay", "paper"].map(v => (
                          <button
                            key={v}
                            onClick={() => handleStyleChange(v as any)}
                            className={`py-1.5 text-[10px] sm:text-xs rounded-md capitalize transition-all ${cardVariant === v
                              ? (isLightMode ? "bg-white text-zinc-900 shadow-sm" : "bg-white/10 text-white shadow-sm")
                              : (isLightMode ? "text-zinc-500 hover:text-zinc-900" : "text-zinc-500 hover:text-zinc-300")
                              }`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Density */}
                    <div>
                      <h4 className={`text-[10px] uppercase font-bold mb-2 ${isLightMode ? "text-zinc-400" : "text-zinc-600"}`}>Density</h4>
                      <div className={`flex rounded-lg p-1 border ${isLightMode ? "bg-zinc-100 border-black/5" : "bg-zinc-950 border-white/5"}`}>
                        {[
                          { id: "comfortable", icon: "M4 6h16M4 12h16M4 18h16" },
                          { id: "compact", icon: "M4 10h16M4 14h16M4 18h16" }
                        ].map(d => (
                          <button
                            key={d.id}
                            onClick={() => setDensity(d.id as any)}
                            className={`flex-1 py-1 text-xs rounded-md flex items-center justify-center transition-all ${density === d.id
                              ? (isLightMode ? "bg-white text-zinc-900 shadow-sm" : "bg-white/10 text-white")
                              : (isLightMode ? "text-zinc-500 hover:text-zinc-900" : "text-zinc-500 hover:text-zinc-300")
                              }`}
                            title={d.id}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d={d.icon} />
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Avatar */}
          <div className="relative shrink-0" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-zinc-950 cursor-pointer hover:shadow-lg transition-shadow ${theme === "neon" ? "bg-gradient-to-br from-fuchsia-500 to-cyan-500 shadow-fuchsia-500/20" :
                theme === "velvet" ? "bg-gradient-to-br from-rose-500 to-indigo-500 shadow-rose-500/20" :
                  theme === "matrix" ? "bg-gradient-to-br from-green-500 to-emerald-500 shadow-green-500/20" :
                    theme === "monochrome" ? "bg-gradient-to-br from-zinc-300 to-zinc-500 shadow-white/10" :
                      theme === "cosmic" ? "bg-gradient-to-br from-purple-500 to-pink-500 shadow-purple-500/20" :
                        theme === "serenity" ? "bg-gradient-to-br from-[#d1e8e2] to-[#e8d1d1] text-zinc-700 shadow-black/5" :
                          theme === "terminal" ? "bg-amber-500/90 text-amber-950 shadow-amber-500/20" :
                            theme === "glitch" ? "bg-white text-black shadow-white/20" :
                              theme === "quantum" ? "bg-gradient-to-br from-violet-600 to-cyan-500 shadow-violet-500/20" :
                                "bg-gradient-to-br from-teal-500 to-cyan-500 shadow-teal-500/20"
                }`}
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
                  className="absolute right-0 top-10 w-56 rounded-xl bg-zinc-900 border border-white/10 shadow-2xl shadow-black/40 overflow-hidden z-50"
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
                        variant={cardVariant}
                        density={density}
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
                        variant={cardVariant}
                        density={density}
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
