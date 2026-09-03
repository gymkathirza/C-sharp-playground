import { describe, expect, it } from "vitest";
import { MAX_FILE_CHARS } from "./limits";
import { addFile, addFolder, childrenOf, fileCount, removeFile, renameFile, starterVfs, writeFile } from "./vfs";

describe("vfs", () => {
  it("starter vfs has Program.cs and .csproj", () => {
    const vfs = starterVfs();
    expect(vfs.files["Program.cs"]).toBeDefined();
    expect(vfs.files["MyProject.csproj"]).toBeDefined();
  });

  it("creates .cs and .json files", () => {
    const vfs = starterVfs();
    const cs = addFile(vfs, "", "Animal", "cs");
    expect("error" in cs).toBe(false);
    const json = addFile(vfs, "", "appsettings", "json");
    expect("error" in json).toBe(false);
  });

  it("rejects empty file names and slashes in the name", () => {
    expect("error" in addFile(starterVfs(), "", "", "cs")).toBe(true);
    expect("error" in addFile(starterVfs(), "", "Models/User", "cs")).toBe(true);
    expect(starterVfs().files["Models/User.cs"]).toBeUndefined();
  });

  it("rejects duplicate file", () => {
    expect("error" in addFile(starterVfs(), "", "Program", "cs")).toBe(true);
  });

  it("renames file", () => {
    const result = renameFile(starterVfs(), "Program.cs", "Main.cs");
    expect("error" in result).toBe(false);
    if ("error" in result) return;
    expect(result.files["Main.cs"]).toBeDefined();
    expect(result.files["Program.cs"]).toBeUndefined();
  });

  it("rename rejects path traversal", () => {
    expect("error" in renameFile(starterVfs(), "Program.cs", "../evil.cs")).toBe(true);
  });

  it("removes file", () => {
    expect(removeFile(starterVfs(), "Program.cs").files["Program.cs"]).toBeUndefined();
  });

  it("rejects oversize file content", () => {
    expect("error" in writeFile(starterVfs(), "Program.cs", "x".repeat(MAX_FILE_CHARS + 1))).toBe(true);
  });

  it("rejects control characters in content", () => {
    expect("error" in writeFile(starterVfs(), "Program.cs", "hello\x00world")).toBe(true);
  });

  it("creates nested folder and file", () => {
    const folder = addFolder(starterVfs(), "", "Models");
    expect("error" in folder).toBe(false);
    if ("error" in folder) return;
    expect("error" in addFile(folder, "Models", "User", "cs")).toBe(false);
  });

  it("rejects 6th folder depth", () => {
    let vfs = starterVfs();
    const names = ["a", "b", "c", "d", "e"];
    for (let i = 0; i < names.length; i++) {
      const parent = names.slice(0, i).join("/");
      const r = addFolder(vfs, parent, names[i]!);
      expect("error" in r).toBe(false);
      if ("error" in r) return;
      vfs = r;
    }
    expect("error" in addFolder(vfs, "a/b/c/d/e", "f")).toBe(true);
  });

  it("fileCount and childrenOf report starter files", () => {
    const vfs = starterVfs();
    expect(fileCount(vfs)).toBe(2);
    const { files } = childrenOf(vfs, "");
    expect(files).toContain("Program.cs");
    expect(files).toContain("MyProject.csproj");
  });
});
