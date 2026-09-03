import { describe, expect, it } from "vitest";
import { harvestIdentifiers } from "./completions";

describe("completions", () => {
  it("harvests PascalCase identifiers from project files", () => {
    const found = harvestIdentifiers({
      "Program.cs": "var cat = new Animal();\nConsole.WriteLine(cat.Speak());",
    });
    const labels = found.map((c) => c.label);
    expect(labels).toContain("Animal");
    expect(labels).toContain("Console");
    expect(labels).toContain("WriteLine");
    expect(labels).toContain("Speak");
  });
});
