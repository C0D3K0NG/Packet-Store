"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/app/context/ToastContext";
import FormattingToolbar from "./FormattingToolbar";
import { insertFormatting, FormatType } from "@/lib/textUtils";

interface Packet {
  id: string;
  title: string;
  content: string;
  color: string;
  pinned: boolean;
  createdAt: string;
  updatedAt?: string; // Optional for now as DB schema has updated_at
  isPublic?: boolean;
  shareToken?: string;
}


interface ColorOption {
  name: string;
  bg: string;
  border: string;
  pattern?: string;
  bgSize?: string;
}

const COLORS: ColorOption[] = [
  // Row 1: Solids
  { name: "default", bg: "bg-zinc-800/60", border: "border-zinc-700/50" },
  { name: "teal", bg: "bg-teal-900/30", border: "border-teal-700/30" },
  { name: "purple", bg: "bg-violet-900/30", border: "border-violet-700/30" },
  { name: "amber", bg: "bg-amber-900/30", border: "border-amber-700/30" },

  // Row 2: Solids
  { name: "rose", bg: "bg-rose-900/30", border: "border-rose-700/30" },
  { name: "blue", bg: "bg-blue-900/30", border: "border-blue-700/30" },
  { name: "red", bg: "bg-red-900/30", border: "border-red-700/30" },
  { name: "sky", bg: "bg-sky-900/30", border: "border-sky-700/30" },

  // Row 3: Patterns (Subtle)
  { name: "green", bg: "bg-green-900/30", border: "border-green-700/30", pattern: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)", bgSize: "8px 8px" }, // Dots
  { name: "orange", bg: "bg-orange-900/30", border: "border-orange-700/30", pattern: "linear-gradient(45deg, rgba(255,255,255,0.03) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.03) 50%, rgba(255,255,255,0.03) 75%, transparent 75%, transparent)", bgSize: "20px 20px" }, // Stripes
  { name: "cyan", bg: "bg-cyan-900/30", border: "border-cyan-700/30", pattern: "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)", bgSize: "16px 16px" }, // Grid
  { name: "fuchsia", bg: "bg-fuchsia-900/30", border: "border-fuchsia-700/30", pattern: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05), transparent 70%)", bgSize: "100% 100%" }, // Spotlight

  // Row 4: Patterns (More distinct)
  { name: "indigo", bg: "bg-indigo-900/30", border: "border-indigo-700/30", pattern: "repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(255,255,255,0.03) 20px)", bgSize: "100% 100%" }, // Lines
  { name: "lime", bg: "bg-lime-900/30", border: "border-lime-700/30", pattern: "radial-gradient(rgba(255,255,255,0.05) 2px, transparent 0)", bgSize: "12px 12px" }, // Larger Dots
  { name: "emerald", bg: "bg-emerald-900/30", border: "border-emerald-700/30", pattern: "repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 2px, transparent 2px, transparent 8px)", bgSize: "100% 100%" }, // Diagonals
  { name: "yellow", bg: "bg-yellow-900/30", border: "border-yellow-700/30", pattern: "linear-gradient(90deg, rgba(255,255,255,0.02) 50%, transparent 50%), linear-gradient(rgba(255,255,255,0.02) 50%, transparent 50%)", bgSize: "10px 10px" }, // Checkerboard
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
  variant?: "glass" | "solid" | "outline" | "brutal" | "ghost" | "cyber" | "neumorph" | "pixel" | "retro" | "glow" | "clay" | "paper";
  density?: "comfortable" | "compact";
}

export default function PacketCard({
  packet,
  onDelete,
  onUpdate,
  onPin,
  isBlurMode = false,
  fontStyle = "sans",
  variant = "glass",
  density = "comfortable",
}: PacketCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(packet.title);
  const [content, setContent] = useState(packet.content);
  const [showColors, setShowColors] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const toast = useToast();

  const color = getColorClasses(packet.color);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        // Clicked outside: Do nothing if editing (require explicit Save/Discard)
        // In edit mode, allow closing menus but keep edit mode open
      }
      setShowColors(false);
      setShowShare(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isEditing, title, content, onUpdate, packet.id, packet.title, packet.content]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(packet.content);
    toast.push("Copied to clipboard", "success");
  };

  const handleShareToggle = async (enable: boolean) => {
    setIsSharing(true);
    try {
      const res = await fetch("/api/packets/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: packet.id, enable }),
      });
      const data = await res.json();
      if (data.packet) {
        onUpdate(packet.id, { isPublic: data.packet.isPublic, shareToken: data.packet.shareToken });
        if (enable) {
          navigator.clipboard.writeText(`${window.location.origin}/share/${data.packet.shareToken}`);
          toast.push("Link copied to clipboard", "success");
        } else {
          toast.push("Sharing disabled", "info");
        }
      } else {
        toast.push("Failed to update share status", "error");
      }
    } catch {
      toast.push("Share error", "error");
    } finally {
      setIsSharing(false);
    }
  };

  const handleFormat = (type: FormatType) => {
    if (textareaRef.current) {
      const { text, newCursor } = insertFormatting(textareaRef.current, type);
      setContent(text);
      // Need to defer cursor update to after render
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.selectionStart = newCursor;
          textareaRef.current.selectionEnd = newCursor;
        }
      }, 0);
    }
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (title !== packet.title || content !== packet.content) {
      onUpdate(packet.id, { title, content });
    }
    setIsEditing(false);
  };

  const handleDiscard = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTitle(packet.title);
    setContent(packet.content);
    setIsEditing(false);
  };

  const timeAgo = packet.updatedAt || packet.createdAt
    ? formatDistanceToNow(new Date(packet.updatedAt || packet.createdAt), { addSuffix: true })
    : "";

  // ─── STYLE CALCULATIONS ───
  const baseClasses = "group relative rounded-xl transition-all duration-200 cursor-pointer break-inside-avoid mb-4 flex flex-col";

  // Padding & Height based on Density
  const paddingClass = density === "compact" ? "p-3" : "p-4";
  // const minHeightClass = density === "compact" ? "min-h-[80px]" : "min-h-[100px]"; // Unused

  // Variant Styles
  let variantClasses = "";
  if (variant === "glass") {
    // Current style: Border + Transparent BG
    variantClasses = `border ${color.border} ${color.bg}`;
  } else if (variant === "solid") {
    // Opaque, higher contrast
    variantClasses = `border border-transparent bg-zinc-800 text-zinc-100 hover:bg-zinc-750`;
    if (packet.color !== "default") variantClasses = `border border-transparent ${color.bg} brightness-110`;
  } else if (variant === "outline") {
    // Minimal border, no background (unless hovered)
    variantClasses = `border border-zinc-700 bg-transparent hover:border-zinc-500 hover:bg-white/5`;
    if (packet.color !== "default") variantClasses = `border ${color.border} bg-transparent hover:bg-white/5`;
  } else if (variant === "brutal") {
    // Neo-brutalism: Thick border, Hard Shadow, Full Opacity
    variantClasses = `border-2 border-zinc-950 bg-zinc-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-5`; // extra margin for shadow
    if (packet.color !== "default") variantClasses = `border-2 border-zinc-950 ${color.bg} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-5 contrast-125`;
  } else if (variant === "ghost") {
    // Low opacity until hover
    variantClasses = `border border-transparent bg-white/5 opacity-60 hover:opacity-100 hover:bg-white/10 hover:border-white/10`;
    if (packet.color !== "default") variantClasses = `border border-transparent ${color.bg} opacity-50 hover:opacity-100 hover:border-${color.border}`;
  } else if (variant === "cyber") {
    // Cyberpunk: Angled corners
    variantClasses = `border-x-2 border-zinc-800 bg-zinc-900/80 hover:border-teal-500/50 hover:shadow-[0_0_15px_rgba(20,184,166,0.3)]`;
    if (packet.color !== "default") variantClasses = `border-x-2 border-${color.border} ${color.bg} hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]`;
  } else if (variant === "neumorph") {
    // Soft 3D look
    variantClasses = `bg-zinc-800 shadow-[-5px_-5px_10px_rgba(255,255,255,0.05),5px_5px_15px_rgba(0,0,0,0.5)] border border-white/5 hover:shadow-[-2px_-2px_5px_rgba(255,255,255,0.05),2px_2px_5px_rgba(0,0,0,0.5)] hover:translate-y-[1px]`;
    if (packet.color !== "default") variantClasses = `${color.bg} shadow-[-5px_-5px_10px_rgba(255,255,255,0.1),5px_5px_15px_rgba(0,0,0,0.3)] border border-white/10`;
  } else if (variant === "pixel") {
    // Retro Gaming
    variantClasses = `rounded-none border-2 border-dashed border-zinc-600 bg-zinc-900 hover:border-zinc-400 hover:bg-zinc-800 font-mono`;
    if (packet.color !== "default") variantClasses = `rounded-none border-2 border-dashed ${color.border} ${color.bg} hover:brightness-110`;
  } else if (variant === "retro") {
    // Win95 Bevel
    variantClasses = `rounded-sm border-2 border-t-white/20 border-l-white/20 border-b-black/50 border-r-black/50 bg-zinc-800 active:border-t-black/50 active:border-l-black/50 active:border-b-white/20 active:border-r-white/20 hover:bg-zinc-700`;
    if (packet.color !== "default") variantClasses = `rounded-sm border-2 border-t-white/30 border-l-white/30 border-b-black/40 border-r-black/40 ${color.bg} hover:brightness-105 active:brightness-95`;
  } else if (variant === "glow") {
    // Strong Outer Glow
    variantClasses = `border border-zinc-700 bg-zinc-950 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:border-zinc-500`;
    if (packet.color !== "default") variantClasses = `border ${color.border} ${color.bg} shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]`;
  } else if (variant === "clay") {
    // Matte 3D
    variantClasses = `rounded-2xl border-none bg-zinc-700 shadow-[inset_-6px_-6px_12px_rgba(0,0,0,0.3),inset_6px_6px_12px_rgba(255,255,255,0.05)] hover:scale-[1.01] transition-transform`;
    if (packet.color !== "default") variantClasses = `rounded-2xl border-none ${color.bg} shadow-[inset_-8px_-8px_16px_rgba(0,0,0,0.2),inset_8px_8px_16px_rgba(255,255,255,0.1)] hover:scale-[1.01]`;
  } else if (variant === "paper") {
    // Physical Paper
    variantClasses = `rounded-lg border border-zinc-300/10 bg-zinc-100 text-zinc-900 shadow-md hover:shadow-xl hover:-rotate-1 transition-all`;
    if (packet.color !== "default") variantClasses = `rounded-lg border border-black/5 ${color.bg} text-zinc-900 shadow-md hover:shadow-xl hover:-rotate-1 brightness-125 saturate-50`;
  }

  return (
    <motion.div
      ref={cardRef}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={variant === "brutal" ? {} : { y: -2 }} // Disable float for brutal (it has its own movement)
      className={`${baseClasses} ${variantClasses} ${paddingClass} ${variant === "cyber" ? "rounded-none clip-path-polygon-[0_0,100%_0,100%_calc(100%-15px),calc(100%-15px)_100%,0_100%]" : ""}`} // Add clip-path for cyber
      onClick={() => !isEditing && setIsEditing(true)}
      style={variant === "cyber" ? { clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)" } : {}}
    >
      {/* Pattern Overlay - Clipped specifically to rounded corners */}
      {/* Less patterns for minimal styles */}
      {(color.pattern) && !["outline", "ghost", "neumorph", "clay"].includes(variant) && (
        <div
          className="absolute inset-0 pointer-events-none opacity-40 z-0 rounded-xl overflow-hidden"
          style={{
            backgroundImage: color.pattern,
            backgroundSize: color.bgSize
          }}
        />
      )}

      {/* Pin indicator */}
      {packet.pinned && (
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-teal-500 border-2 border-zinc-950 z-10" />
      )}

      {/* Content Container - Ensure z-index to stay above pattern */}
      <div className="relative z-10 flex flex-col h-full w-full">
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
        <div className={`flex-1 min-h-[100px] text-sm text-zinc-300 transition-all duration-300 ${fontStyle === "mono" ? "font-mono" : "font-sans"
          } ${isBlurMode && !isEditing ? "blur-md hover:blur-none transition-all duration-500" : ""}`}>
          {isEditing ? (
            <div className="flex flex-col h-full">
              <FormattingToolbar onFormat={handleFormat} />
              <textarea
                ref={textareaRef}
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
              <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-white/5">
                <button
                  onClick={handleDiscard}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors"
                >
                  Discard
                </button>
                <button
                  onClick={handleSave}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-teal-500/20 text-teal-400 hover:bg-teal-500/30 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:p-0 prose-pre:bg-transparent">
              {packet.content ? (
                <ReactMarkdown
                  components={{
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    code({ node, inline, className, children, style, ...props }: { node?: unknown, inline?: boolean, className?: string, children?: React.ReactNode } & React.HTMLAttributes<HTMLElement>) {
                      const match = /language-(\w+)/.exec(className || "");
                      return !inline && match ? (
                        <div className="relative group/code">
                          {match && (
                            <div className="absolute top-2 right-2 text-[10px] uppercase font-bold text-zinc-500 bg-zinc-800/80 px-1.5 py-0.5 rounded border border-white/5 opacity-0 group-hover/code:opacity-100 transition-opacity pointer-events-none select-none">
                              {match[1]}
                            </div>
                          )}
                          <SyntaxHighlighter
                            style={vscDarkPlus}
                            language={match[1]}
                            PreTag="div"
                            customStyle={{ margin: 0, borderRadius: "0.5rem", fontSize: "0.80rem", paddingTop: match ? "2rem" : "1rem" }}
                            {...props}
                          >
                            {String(children).replace(/\n$/, "")}
                          </SyntaxHighlighter>
                        </div>
                      ) : (
                        <code className={`${className} bg-white/10 px-1 py-0.5 rounded text-xs`} {...props}>
                          {children}
                        </code>
                      );
                    },
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
              {/* Share Button */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowShare(!showShare);
                    setShowColors(false);
                  }}
                  className={`p-1.5 rounded-lg text-xs transition-colors ${packet.isPublic
                    ? "text-teal-400 bg-teal-500/10"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                    }`}
                  title="Share"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>

                {/* Share Popover */}
                <AnimatePresence>
                  {showShare && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 4 }}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute bottom-10 right-0 w-64 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl p-3 z-30"
                    >
                      <h4 className="text-xs font-semibold text-zinc-300 mb-2">Share Packet</h4>
                      {packet.isPublic ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 bg-zinc-800/50 p-1.5 rounded-lg border border-white/5">
                            <input
                              readOnly
                              value={`${typeof window !== 'undefined' ? window.location.origin : ''}/share/${packet.shareToken}`}
                              className="bg-transparent text-[10px] text-zinc-400 flex-1 outline-none font-mono"
                            />
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/share/${packet.shareToken}`);
                                toast.push("Copied", "success");
                              }}
                              className="p-1 hover:text-white text-zinc-500 transition-colors"
                            >
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                          <button
                            onClick={() => handleShareToggle(false)}
                            disabled={isSharing}
                            className="w-full py-1.5 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-red-500/20"
                          >
                            {isSharing ? "Updating..." : "Disable Sharing"}
                          </button>
                        </div>
                      ) : (
                        <div>
                          <p className="text-[10px] text-zinc-500 mb-3">
                            Create a public link for this packet. Anyone with the link can view it.
                          </p>
                          <button
                            onClick={() => handleShareToggle(true)}
                            disabled={isSharing}
                            className="w-full py-1.5 text-xs bg-teal-500 text-teal-950 font-medium rounded-lg hover:bg-teal-400 transition-colors"
                          >
                            {isSharing ? "Creating Link..." : "Create Public Link"}
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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
      </div>

      {/* Color picker */}
      <AnimatePresence>
        {showColors && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute bottom-12 right-4 p-3 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl z-20 grid grid-cols-4 gap-2 w-[140px]"
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
                className={`relative w-6 h-6 rounded-full ${c.bg} border ${c.border} cursor-pointer hover:scale-110 transition-transform ${packet.color === c.name ? "ring-2 ring-white/30" : ""}`}
                title={c.name}
              >
                {c.pattern && (
                  <div
                    className="absolute inset-0 rounded-full opacity-60"
                    style={{
                      backgroundImage: c.pattern,
                      backgroundSize: "200%"
                    }}
                  />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
