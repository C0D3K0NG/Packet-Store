"use client";

import { forwardRef, useState, useEffect, useImperativeHandle, useRef } from "react";

interface SimpleEditorProps extends React.ComponentProps<"textarea"> {
  value: string;
  fontStyle?: "sans" | "mono";
}

const SimpleEditor = forwardRef<HTMLTextAreaElement, SimpleEditorProps>(
  ({ value, fontStyle = "sans", className, ...props }, ref) => {
    const innerRef = useRef<HTMLTextAreaElement>(null);
    useImperativeHandle(ref, () => innerRef.current as HTMLTextAreaElement);

    // Sync scroll
    const handleScroll = () => {
      if (innerRef.current && highlightRef.current) {
        highlightRef.current.scrollTop = innerRef.current.scrollTop;
      }
    };

    const highlightRef = useRef<HTMLDivElement>(null);

    // Simple tokenizer for styling
    // We only support Bold (**), Italic (*), Strikethrough (~~) for now to match request
    // We render this in a pre-wrap div. 
    // CRITICAL: Everything must be inline to match textarea wrapping exactly.
    const renderHighlightedText = (text: string) => {
      // Split by syntax patterns
      // Note: This is a simple regex approach and might fail on nested/complex cases, but suffices for basic styling.
      const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|~~.*?~~)/g);

      return parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
          return <span key={i} className="font-bold text-zinc-100">{part}</span>;
        }
        if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
          return <span key={i} className="italic text-zinc-100">{part}</span>;
        }
        if (part.startsWith("~~") && part.endsWith("~~") && part.length >= 4) {
          return <span key={i} className="line-through text-zinc-400 opacity-70">{part}</span>;
        }
        // Checkbox highlighting (start of line)
        // This regex split is tricky for line starts. Let's keep it simple for now.
        return <span key={i}>{part}</span>;
      });
    };

    // We add a trailing newline character to the highlight div if the text ends with one,
    // because standard HTML divs ignore trailing newlines for height calculation, causing mismatch.
    const renderContent = () => {
      const text = value || "";
      const endsWithNewline = text.endsWith("\n");
      return (
        <>
          {renderHighlightedText(text)}
          {endsWithNewline && <br />}
        </>
      );
    }

    return (
      <div className={`relative w-full h-full group/editor ${className || ""}`}>
        {/* Highlight Layer */}
        <div
          ref={highlightRef}
          aria-hidden="true"
          className={`absolute inset-0 w-full h-full bg-transparent p-0 margin-0 border-0 outline-none resize-none overflow-hidden whitespace-pre-wrap break-words pointer-events-none z-0 text-zinc-300/80 ${fontStyle === "mono" ? "font-mono" : "font-sans"
            }`}
          style={{
            // Ensure these match the textarea EXACTLY
            padding: "0px", // we rely on the parent padding or setup, wait. 
            // Best to strip padding from here and let parent handle, OR enforce it here.
            // Looking at usage: `className` usually passes full styles.
            // Let's rely on standard box model. The user passes classes for padding/text size.
            // We need to overwrite text color.
            fontFamily: "inherit",
            fontSize: "inherit",
            lineHeight: "inherit",
          }}
        >
          {renderContent()}
        </div>

        {/* Input Layer */}
        <textarea
          ref={innerRef}
          value={value}
          onScroll={handleScroll}
          {...props}
          className={`relative z-10 w-full h-full bg-transparent text-transparent caret-zinc-100 outline-none resize-none overflow-auto whitespace-pre-wrap break-words ${fontStyle === "mono" ? "font-mono" : "font-sans"
            }`}
          style={{
            // Essential to override class styles that set color
            color: "transparent",
            background: "transparent",
            fontFamily: "inherit",
            fontSize: "inherit",
            lineHeight: "inherit",
          }}
        />
      </div>
    );
  }
);

SimpleEditor.displayName = "SimpleEditor";

export default SimpleEditor;
