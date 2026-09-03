import { describe, expect, it } from "vitest";
import { applyChannelToCsproj, enabledChannels, findChannel, parseManifest } from "./versions";
import { STARTER_CSPROJ } from "./vfs";

const SAMPLE_MANIFEST = {
  schemaVersion: 1,
  generatedAt: "2026-09-03T00:00:00Z",
  channels: [
    { id: "net8-csharp12", sdk: "8.0", language: "12", status: "stable", enabled: true, verifiedAt: "2026-09-03T00:00:00Z" },
    { id: "net10-csharp14", sdk: "10.0", language: "14", status: "stable", enabled: true, verifiedAt: "2026-09-03T00:00:00Z" },
    { id: "net-preview", sdk: "preview", language: "preview", status: "preview", enabled: false, verifiedAt: null },
  ],
};

describe("versions", () => {
  it("parses a valid manifest", () => {
    const result = parseManifest(SAMPLE_MANIFEST);
    expect("error" in result).toBe(false);
    if ("error" in result) return;
    expect(result.channels).toHaveLength(3);
  });

  it("rejects null and wrong schema", () => {
    expect("error" in parseManifest(null)).toBe(true);
    expect("error" in parseManifest({ schemaVersion: 99, channels: [] })).toBe(true);
  });

  it("enabledChannels hides preview by default", () => {
    const manifest = parseManifest(SAMPLE_MANIFEST);
    if ("error" in manifest) throw new Error();
    const enabled = enabledChannels(manifest);
    expect(enabled).toHaveLength(2);
    expect(enabled.find((c) => c.status === "preview")).toBeUndefined();
  });

  it("findChannel locates by id", () => {
    const manifest = parseManifest(SAMPLE_MANIFEST);
    if ("error" in manifest) throw new Error();
    expect(findChannel(manifest, "net8-csharp12")?.sdk).toBe("8.0");
    expect(findChannel(manifest, "missing")).toBeUndefined();
  });

  it("stable channels have verifiedAt", () => {
    const manifest = parseManifest(SAMPLE_MANIFEST);
    if ("error" in manifest) throw new Error();
    expect(manifest.channels.filter((c) => c.status === "stable").every((c) => c.verifiedAt !== null)).toBe(true);
  });

  it("applyChannelToCsproj updates framework and language", () => {
    const next = applyChannelToCsproj(STARTER_CSPROJ, {
      id: "net8-csharp12",
      sdk: "8.0",
      language: "12",
      status: "stable",
      enabled: true,
      verifiedAt: "2026-09-03T00:00:00Z",
    });
    expect(next).toContain("<TargetFramework>net8.0</TargetFramework>");
    expect(next).toContain("<LangVersion>12</LangVersion>");
  });
});
