import { describe, expect, it } from "vitest";
import { defaultSession, parseSession, serializeSession } from "./session";

describe("session", () => {
  it("defaultSession has starter tabs and no autoRun flag", () => {
    const s = defaultSession();
    expect(s.version).toBe(1);
    expect(s.activeTab).toBe("Program.cs");
    expect(s.openTabs).toContain("Program.cs");
    expect(s.vfs.files["Program.cs"]).toBeDefined();
    expect(Object.keys(s)).not.toContain("autoRun");
  });

  it("serializeSession produces valid JSON", () => {
    const result = serializeSession(defaultSession());
    expect("error" in result).toBe(false);
    if ("error" in result) return;
    expect(() => JSON.parse(result.json)).not.toThrow();
  });

  it("parseSession round-trips correctly", () => {
    const result = serializeSession(defaultSession());
    if ("error" in result) throw new Error("serialize failed");
    const parsed = parseSession(result.json);
    expect(parsed?.version).toBe(1);
    expect(parsed?.activeTab).toBe("Program.cs");
  });

  it("parseSession returns null for invalid JSON", () => {
    expect(parseSession("not-json")).toBeNull();
    expect(parseSession("{}")).toBeNull();
  });

  it("parseSession drops tabs that no longer exist", () => {
    const s = defaultSession();
    s.openTabs = ["Program.cs", "NonExistent.cs"];
    const result = serializeSession(s);
    if ("error" in result) throw new Error();
    expect(parseSession(result.json)?.openTabs).not.toContain("NonExistent.cs");
  });
});
