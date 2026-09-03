import { MAX_FOLDER_DEPTH } from "./limits";

const SEGMENT = /^[A-Za-z_][A-Za-z0-9_.-]*$/;

export type CsFileExt = "cs" | "csproj" | "json" | "txt" | "md";
export const CS_EXTS: CsFileExt[] = ["cs", "csproj", "json", "txt", "md"];

export function folderDepth(folderPath: string): number {
  if (!folderPath) return 0;
  return folderPath.split("/").filter(Boolean).length;
}

export function parentDir(filePath: string): string {
  const i = filePath.lastIndexOf("/");
  return i === -1 ? "" : filePath.slice(0, i);
}

export function joinPosix(...parts: string[]): string {
  return parts.filter(Boolean).join("/");
}

export function validateSegment(name: string): string | null {
  if (!name) return "Name is required";
  if (name.includes("/") || name.includes("\\")) return "Name cannot contain slashes";
  if (name === ".." || name === ".") return "Reserved name";
  if (!SEGMENT.test(name)) return "Use letters, numbers, _ - . (start with a letter or _)";
  return null;
}

export function validateFilePath(path: string): string | null {
  if (!path || path.startsWith("/") || path.includes("\\") || path.includes("..")) {
    return "Invalid path";
  }
  if (path.includes("//")) return "Invalid path";
  const parts = path.split("/");
  const file = parts.pop() ?? "";
  for (const seg of parts) {
    const err = validateSegment(seg);
    if (err) return err;
  }
  if (folderDepth(parts.join("/")) > MAX_FOLDER_DEPTH) {
    return `Folder depth cannot exceed ${MAX_FOLDER_DEPTH}`;
  }
  if (!/\.(cs|csproj|json|txt|md)$/.test(file)) {
    return "Only .cs, .csproj, .json, .txt, .md files are allowed";
  }
  return validateSegment(stemOf(file));
}

export function fileExt(path: string): CsFileExt | null {
  for (const ext of CS_EXTS) {
    if (path.endsWith(`.${ext}`)) return ext;
  }
  return null;
}

export function stemOf(fileName: string): string {
  return fileName.replace(/\.(cs|csproj|json|txt|md)$/, "");
}
