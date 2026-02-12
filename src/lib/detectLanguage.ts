export function detectLanguage(code: string): string | null {
  if (!code || code.length < 10 || !code.includes("\n")) return null; // Too short or single line

  const lines = code.split("\n");
  const firstLine = lines[0].trim();

  // Python
  if (
    code.includes("def ") &&
    code.includes(":") &&
    (code.includes("import ") || code.includes("print("))
  ) {
    return "python";
  }

  // JavaScript / TypeScript
  if (
    (code.includes("const ") || code.includes("let ") || code.includes("var ") || code.includes("function ") || code.includes("=>")) &&
    (code.includes(";") || code.includes("{") || code.includes("console.log"))
  ) {
    if (code.includes("interface ") || code.includes("type ") || code.includes(": string") || code.includes(": number")) {
      return "typescript";
    }
    return "javascript";
  }

  // HTML
  if (code.includes("<") && code.includes(">") && (code.includes("</div>") || code.includes("</body>") || code.includes("<html>"))) {
    return "html";
  }

  // CSS
  if (code.includes("{") && code.includes("}") && (code.includes("color:") || code.includes("margin:") || code.includes("display:"))) {
    return "css";
  }

  // SQL
  if (
    (code.includes("SELECT ") || code.includes("INSERT INTO ") || code.includes("UPDATE ")) &&
    (code.includes("FROM ") || code.includes("WHERE "))
  ) {
    return "sql";
  }

  // JSON
  if (firstLine.startsWith("{") && code.trim().endsWith("}") && code.includes(":")) {
    try {
      JSON.parse(code);
      return "json";
    } catch (e) {
      // loose check
    }
  }

  // Shell / Bash
  if (code.includes("npm install") || code.includes("git commit") || code.includes("echo ") || firstLine.startsWith("#!/bin/bash")) {
    return "bash";
  }

  return null;
}
