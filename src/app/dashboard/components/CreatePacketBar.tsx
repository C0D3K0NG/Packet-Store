"use client";

import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CreatePacketBarProps {
  onCreate: (title: string, content: string) => void;
}

export default function CreatePacketBar({ onCreate }: CreatePacketBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  function handleSubmit(e?: FormEvent) {
    e?.preventDefault();
    if (!title.trim() && !content.trim()) {
      setIsExpanded(false);
      return;
    }
    onCreate(title, content);
    setTitle("");
    setContent("");
    setIsExpanded(false);
  }

  return (
    <div className="w-full max-w-xl mx-auto mb-8">
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(true)}
            className="flex items-center h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-zinc-500 cursor-text backdrop-blur-sm hover:border-white/20 transition-colors"
          >
            <span>Take a note...</span>
            <div className="ml-auto flex gap-2">
              <svg className="w-5 h-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="expanded"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            onSubmit={handleSubmit}
            className="rounded-xl border border-white/10 bg-zinc-900/80 backdrop-blur-sm overflow-hidden"
          >
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="w-full bg-transparent px-4 pt-3 pb-1 text-sm font-semibold text-white placeholder:text-zinc-500 outline-none"
              autoFocus
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  handleSubmit();
                }
              }}
              placeholder="Take a note..."
              className="w-full bg-transparent px-4 py-2 text-sm text-zinc-300 placeholder:text-zinc-600 outline-none resize-none min-h-[80px]"
              rows={3}
            />
            <div className="flex items-center justify-end gap-2 px-4 py-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  setTitle("");
                  setContent("");
                }}
                className="px-4 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg text-xs font-medium bg-teal-500/20 text-teal-400 hover:bg-teal-500/30 transition-colors cursor-pointer"
              >
                Add Packet
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
