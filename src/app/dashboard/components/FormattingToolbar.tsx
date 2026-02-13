import { FormatType } from "@/lib/textUtils";

interface FormattingToolbarProps {
  onFormat: (type: FormatType) => void;
}

export default function FormattingToolbar({ onFormat }: FormattingToolbarProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-zinc-800/50 rounded-lg border border-white/5 mb-2 w-fit">
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); onFormat("bold"); }}
        className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
        title="Bold"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12h8a4 4 0 100-8H6v8zm0 0h8a4 4 0 110 8H6v-8z" />
        </svg>
      </button>
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); onFormat("italic"); }}
        className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
        title="Italic"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" transform="scale(0.8) translate(3,3)" />{/* Fallback icon or custom */}
          {/* Better Italic Icon */}
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 4h-2l-4 16h2M9 4H7m8 16h2" />
          {/* Actually let's use a standard "I" */}
        </svg>
      </button>
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); onFormat("strikethrough"); }}
        className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
        title="Strikethrough"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" /> {/* Simple strikethrough line */}
        </svg>
      </button>
      <div className="w-px h-4 bg-white/10 mx-1" />
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); onFormat("checkbox"); }}
        className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
        title="Checkbox"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    </div>
  );
}
