import { describe, expect, it } from "vitest";
import JSZip from "jszip";
import { addFile, addFolder, starterVfs } from "./vfs";
import { vfsToZip } from "./zip";

describe("zip export", () => {
  it("produces a blob from starter vfs", async () => {
    const blob = await vfsToZip(starterVfs());
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(0);
  });

  it("zip contains Program.cs and csproj with Hello World", async () => {
    const zip = await JSZip.loadAsync(await (await vfsToZip(starterVfs())).arrayBuffer());
    expect(zip.files["Program.cs"]).toBeDefined();
    expect(zip.files["MyProject.csproj"]).toBeDefined();
    expect(await zip.files["Program.cs"]!.async("string")).toContain("Hello, World!");
  });

  it("zip includes nested files", async () => {
    const folder = addFolder(starterVfs(), "", "Models");
    if ("error" in folder) throw new Error();
    const withFile = addFile(folder, "Models", "User", "cs", "public class User {}");
    if ("error" in withFile) throw new Error();
    const zip = await JSZip.loadAsync(await (await vfsToZip(withFile)).arrayBuffer());
    expect(zip.files["Models/User.cs"]).toBeDefined();
  });
});
