import { MAX_FILES, assertSafeSource } from "./limits";
import { folderDepth, joinPosix, parentDir, validateFilePath, validateSegment, type CsFileExt } from "./paths";

export type { CsFileExt };

export type Vfs = {
  files: Record<string, string>;
  folders: string[];
};

export const STARTER_PROGRAM = `// C# top-level statements (C# 9+)
using System;

Console.WriteLine("Hello, World!");
Console.WriteLine("Welcome to the C# Playground!");
`;

export const STARTER_CSPROJ = `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net10.0</TargetFramework>
    <LangVersion>14</LangVersion>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>
</Project>
`;

export function emptyVfs(): Vfs {
  return { files: {}, folders: [] };
}

export function starterVfs(): Vfs {
  return {
    folders: [],
    files: {
      "Program.cs": STARTER_PROGRAM,
      "MyProject.csproj": STARTER_CSPROJ,
    },
  };
}

export function listFolders(vfs: Vfs): string[] {
  return [...vfs.folders].sort();
}

export function fileCount(vfs: Vfs): number {
  return Object.keys(vfs.files).length;
}

export function addFolder(vfs: Vfs, parent: string, name: string): Vfs | { error: string } {
  const err = validateSegment(name);
  if (err) return { error: err };
  const path = joinPosix(parent, name);
  if (folderDepth(path) > 5) return { error: "Folder depth cannot exceed 5" };
  if (vfs.folders.includes(path) || vfs.files[path]) return { error: "Already exists" };
  if (parent && !vfs.folders.includes(parent)) return { error: "Parent folder missing" };
  return { ...vfs, folders: [...vfs.folders, path] };
}

export function addFile(
  vfs: Vfs,
  parent: string,
  name: string,
  ext: CsFileExt,
  content = "",
): Vfs | { error: string } {
  if (fileCount(vfs) >= MAX_FILES) return { error: `At most ${MAX_FILES} files` };
  const path = joinPosix(parent, `${name}.${ext}`);
  const pathErr = validateFilePath(path);
  if (pathErr) return { error: pathErr };
  if (vfs.files[path] !== undefined) return { error: "File already exists" };
  if (parent && !vfs.folders.includes(parent)) return { error: "Parent folder missing" };
  const srcErr = assertSafeSource(content);
  if (srcErr) return { error: srcErr };
  return { ...vfs, files: { ...vfs.files, [path]: content } };
}

export function writeFile(vfs: Vfs, path: string, content: string): Vfs | { error: string } {
  if (vfs.files[path] === undefined) return { error: "File not found" };
  const srcErr = assertSafeSource(content);
  if (srcErr) return { error: srcErr };
  return { ...vfs, files: { ...vfs.files, [path]: content } };
}

export function renameFile(vfs: Vfs, path: string, newName: string): Vfs | { error: string } {
  const content = vfs.files[path];
  if (content === undefined) return { error: "File not found" };
  const dir = parentDir(path);
  const next = joinPosix(dir, newName);
  const pathErr = validateFilePath(next);
  if (pathErr) return { error: pathErr };
  if (next !== path && vfs.files[next] !== undefined) return { error: "File already exists" };
  const files = { ...vfs.files };
  delete files[path];
  files[next] = content;
  return { ...vfs, files };
}

export function removeFile(vfs: Vfs, path: string): Vfs {
  const files = { ...vfs.files };
  delete files[path];
  return { ...vfs, files };
}

export function removeFolder(vfs: Vfs, folder: string): Vfs {
  const prefix = folder + "/";
  const folders = vfs.folders.filter((f) => f !== folder && !f.startsWith(prefix));
  const files = Object.fromEntries(
    Object.entries(vfs.files).filter(([p]) => !p.startsWith(prefix) && p !== folder),
  );
  return { files, folders };
}

export function childrenOf(vfs: Vfs, parent: string): { folders: string[]; files: string[] } {
  const folders = vfs.folders
    .filter((f) => parentDir(f) === parent)
    .sort((a, b) => a.localeCompare(b));
  const files = Object.keys(vfs.files)
    .filter((f) => parentDir(f) === parent)
    .sort((a, b) => a.localeCompare(b));
  return { folders, files };
}
