"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/app/context/ToastContext";

interface Packet {
  id: string;
  title: string;
  content: string;
  color: string;
  pinned: boolean;
  createdAt: string;
  updatedAt?: string; // Optional for now as DB schema has updated_at
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
  isBlurMode?: boolean;
  fontStyle?: "sans" | "mono";
}

export default function PacketCard({
  packet,
  onDelete,
  onUpdate,
  onPin,
  isBlurMode = false,
  fontStyle = "sans",
}: PacketCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(packet.title);
  const [content, setContent] = useState(packet.content);
  const [showColors, setShowColors] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  const color = getColorClasses(packet.color);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        if (isEditing) {
          if (title !== packet.title || content !== packet.content) {
            onUpdate(packet.id, { title, content });
          }
          setIsEditing(false);
        }
        setShowColors(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isEditing, title, content, onUpdate, packet.id, packet.title, packet.content]); // fixed dep array

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(packet.content);
    toast.push("Copied to clipboard", "success");
  };

  const timeAgo = packet.updatedAt || packet.createdAt
    ? formatDistanceToNow(new Date(packet.updatedAt || packet.createdAt), { addSuffix: true })
    : "";

  return (
    <motion.div
      ref={cardRef}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -2 }}
      className={`group relative rounded-xl border ${color.border} ${color.bg} p-4 transition-colors duration-200 cursor-pointer break-inside-avoid mb-4 flex flex-col`}
      onClick={() => !isEditing && setIsEditing(true)}
    >
      {/* Pin indicator */}
      {packet.pinned && (
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-teal-500 border-2 border-zinc-950 z-10" />
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
      <div className={`flex-1 min-h-[60px] text-sm text-zinc-300 transition-all duration-300 ${fontStyle === "mono" ? "font-mono" : "font-sans"
        } ${isBlurMode && !isEditing ? "blur-md hover:blur-none transition-all duration-500" : ""}`}>
        {isEditing ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onPaste={(e) => {
              const text = e.clipboardData.getData("text");
              import("@/lib/detectLanguage").then(({ detectLanguage }) => {
                const lang = detectLanguage(text);
                if (lang) {
                  e.preventDefault();
                  const formatted = "```" + lang + "\n" + text + "\n```";
                  const textarea = e.currentTarget;
                  const start = textarea.selectionStart;
                  const end = textarea.selectionEnd;
                  const newContent = content.substring(0, start) + formatted + content.substring(end);
                  setContent(newContent);
                  setTimeout(() => {
                    textarea.selectionStart = textarea.selectionEnd = start + formatted.length;
                  }, 0);
                }
              });
            }}
            placeholder="Take a note..."
            className={`w-full h-full bg-transparent text-zinc-300 placeholder:text-zinc-500 outline-none resize-none text-xs ${fontStyle === "mono" ? "font-mono" : "font-sans"}`}
            rows={6}
          />
        ) : (
          <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:p-0 prose-pre:bg-transparent">
            {packet.content ? (
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{ margin: 0, borderRadius: "0.5rem", fontSize: "0.80rem" }}
                        {...props}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={`${className} bg-white/10 px-1 py-0.5 rounded text-xs`} {...props}>
                        {children}
                      </code>
                    );
                  },
                  a: ({ node, ...props }) => (
                    <a className="text-teal-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} onClick={(e) => e.stopPropagation()} />
                  ),
                }}
              >
                {packet.content}
              </ReactMarkdown>
            ) : (
              <span className="text-zinc-500 italic">Empty packet</span>
            )}
          </div>
        )}
      </div>

      {/* Footer info (Time) */}
      {!isEditing && (
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between opacity-60 group-hover:opacity-100 transition-opacity">
          <span className="text-[10px] text-zinc-500">{timeAgo}</span>

          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors text-xs"
              title="Copy to clipboard"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onPin(packet.id);
              }}
              className={`p-1.5 rounded-lg text-xs transition-colors ${packet.pinned
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
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors text-xs"
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
              className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors text-xs ml-1"
              title="Delete"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Color picker */}
      <AnimatePresence>
        {showColors && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute bottom-12 right-4 p-2 bg-zinc-900 border border-white/10 rounded-xl shadow-xl flex gap-1.5 z-20"
            onClick={(e) => e.stopPropagation()}
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
