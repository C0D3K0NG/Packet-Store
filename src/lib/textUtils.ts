export type FormatType = "bold" | "italic" | "strikethrough" | "checkbox";

export function insertFormatting(
  textarea: HTMLTextAreaElement,
  type: FormatType
): { text: string; newCursor: number } {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;
  const selected = text.substring(start, end);

  let formatted = "";
  let newCursor = end;

  switch (type) {
    case "bold":
      formatted = `**${selected}**`;
      newCursor += 4; // ** + **
      break;
    case "italic":
      formatted = `*${selected}*`;
      newCursor += 2; // * + *
      break;
    case "strikethrough":
      formatted = `~~${selected}~~`;
      newCursor += 4; // ~~ + ~~
      break;
    case "checkbox":
      // Checkbox is logically different: usually applied to the start of the line(s)
      // If we are in the middle of a line, we should find the start of the line.
      // For simplicity, let's just insert "- [ ] " at the cursor or start of selection if multiline?
      // Better UX: Insert at start of the *current line*.

      // Find start of line
      let lineStart = text.lastIndexOf("\n", start - 1) + 1;
      if (lineStart === -1) lineStart = 0;

      const beforeLine = text.substring(0, lineStart);
      const afterLine = text.substring(lineStart);

      return {
        text: beforeLine + "- [ ] " + afterLine,
        newCursor: start + 6
      };
  }

  const newText = text.substring(0, start) + formatted + text.substring(end);

  // Adjust cursor to be inside the formatting if formatting an empty selection
  if (start === end) {
    newCursor = start + (formatted.length / 2);
  }

  return { text: newText, newCursor };
}
