"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";

interface Packet {
  id: string;
  title: string;
  content: string;
  color: string;
  pinned: boolean;
  createdAt: string;
}

const COLORS = [
  { name: "default", bg: "bg-zinc-800/60", border: "border-zinc-700/50" },
  { name: "teal", bg: "bg-teal-900/30", border: "border-teal-700/30" },
  { name: "purple", bg: "bg-violet-900/30", border: "border-violet-700/30" },
  { name: "amber", bg: "bg-amber-900/30", border: "border-amber-700/30" },
  { name: "rose", bg: "bg-rose-900/30", border: "border-rose-700/30" },
  { name: "blue", bg: "bg-blue-900/30", border: "border-blue-700/30" },
];

function getColorClasses(colorName: string) {
  return COLORS.find((c) => c.name === colorName) || COLORS[0];
}

interface PacketCardProps {
  packet: Packet;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<Packet>) => void;
  onPin: (id: string) => void;
}

export default function PacketCard({
  packet,
  onDelete,
  onUpdate,
  onPin,
}: PacketCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(packet.title);
  const [content, setContent] = useState(packet.content);
  const [showColors, setShowColors] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const color = getColorClasses(packet.color);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        if (isEditing) {
          onUpdate(packet.id, { title, content });
          setIsEditing(false);
        }
        setShowColors(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isEditing, title, content, onUpdate, packet.id]);

  return (
    <motion.div
      ref={cardRef}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -2 }}
      className={`group relative rounded-xl border ${color.border} ${color.bg} p-4 backdrop-blur-sm transition-colors duration-200 cursor-pointer break-inside-avoid mb-4`}
      onClick={() => !isEditing && setIsEditing(true)}
    >
      {/* Pin indicator */}
      {packet.pinned && (
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-teal-500 border-2 border-zinc-950" />
      )}

      {/* Title */}
      {isEditing ? (
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full bg-transparent text-sm font-semibold text-white placeholder:text-zinc-500 outline-none mb-2"
          autoFocus
        />
      ) : (
        packet.title && (
          <h3 className="text-sm font-semibold text-zinc-100 mb-2 line-clamp-1">
            {packet.title}
          </h3>
        )
      )}

      {/* Content */}
      {isEditing ? (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Take a note..."
          className="w-full bg-transparent text-sm text-zinc-300 placeholder:text-zinc-500 outline-none resize-none min-h-[60px]"
          rows={4}
        />
      ) : (
        <p className="text-sm text-zinc-400 leading-relaxed line-clamp-6 whitespace-pre-wrap">
          {packet.content || "Empty packet"}
        </p>
      )}

      {/* Action bar */}
      <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPin(packet.id);
          }}
          className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${packet.pinned
              ? "text-teal-400 bg-teal-500/10"
              : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
            }`}
          title={packet.pinned ? "Unpin" : "Pin"}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowColors(!showColors);
          }}
          className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors text-xs cursor-pointer"
          title="Change color"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(packet.id);
          }}
          className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors text-xs ml-auto cursor-pointer"
          title="Delete"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Color picker */}
      <AnimatePresence>
        {showColors && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="flex gap-1.5 mt-2 pt-2 border-t border-white/5"
          >
            {COLORS.map((c) => (
              <button
                key={c.name}
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdate(packet.id, { color: c.name });
                  setShowColors(false);
                }}
                className={`w-6 h-6 rounded-full ${c.bg} border ${c.border} cursor-pointer transition-transform hover:scale-110 ${packet.color === c.name ? "ring-2 ring-white/30" : ""
                  }`}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
