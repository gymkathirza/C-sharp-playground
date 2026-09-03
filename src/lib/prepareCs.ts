const USING = /^\s*using\s+[\w.]+(\s*=\s*[\w.]+)?\s*;\s*$/;
const HAS_MAIN = /\bstatic\s+(?:async\s+)?(?:void|Task(?:\s*<\s*int\s*>)?)\s+Main\s*\(/;
const DEFAULT_USINGS = ["using System;", "using System.Collections.Generic;", "using System.Linq;"];

export function csFiles(files: Record<string, string>): [string, string][] {
  return Object.entries(files)
    .filter(([path]) => path.endsWith(".cs"))
    .sort(([a], [b]) => a.localeCompare(b));
}

export function splitUsings(source: string): { usings: string[]; body: string } {
  const usings: string[] = [];
  const other: string[] = [];
  for (const line of source.split(/\r?\n/)) {
    if (USING.test(line)) usings.push(line.trim());
    else other.push(line);
  }
  return { usings, body: other.join("\n").trim() };
}

export function hasEntryPoint(source: string): boolean {
  return HAS_MAIN.test(source);
}

/** Merge playground .cs files into one compilation unit the browser Roslyn host can run. */
export function prepareConsoleSource(files: Record<string, string>): string | { error: string } {
  const list = csFiles(files);
  if (list.length === 0) return { error: "Add a .cs file to run" };

  const usings = new Set(DEFAULT_USINGS);
  const parts: string[] = [];
  let programBody: string | null = null;
  let sawMain = false;

  for (const [path, source] of list) {
    const split = splitUsings(source);
    for (const u of split.usings) usings.add(u);
    if (hasEntryPoint(split.body)) {
      sawMain = true;
      parts.push(split.body);
      continue;
    }
    if (path === "Program.cs" || path.endsWith("/Program.cs")) {
      programBody = split.body;
      continue;
    }
    if (split.body) parts.push(split.body);
  }

  const header = [...usings].sort().join("\n");
  if (sawMain) {
    return `${header}\n\n${parts.join("\n\n")}\n`;
  }
  if (programBody === null) {
    return { error: "Add Program.cs with top-level statements, or a static Main entry point" };
  }
  return `${header}

public class Program
{
    public static void Main()
    {
${indent(programBody, 8)}
    }
}

${parts.join("\n\n")}
`;
}

function indent(text: string, spaces: number): string {
  const pad = " ".repeat(spaces);
  return text
    .split("\n")
    .map((line) => (line.length ? pad + line : line))
    .join("\n");
}
