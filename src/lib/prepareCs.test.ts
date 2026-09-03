import { describe, expect, it } from "vitest";
import { hasEntryPoint, prepareConsoleSource, splitUsings } from "./prepareCs";
import { STARTER_PROGRAM } from "./vfs";

describe("prepareCs", () => {
  it("wraps top-level Program.cs in a Main method", () => {
    const result = prepareConsoleSource({ "Program.cs": STARTER_PROGRAM });
    expect(typeof result).toBe("string");
    if (typeof result !== "string") return;
    expect(result).toContain("public class Program");
    expect(result).toContain("public static void Main()");
    expect(result).toContain("Hello, World!");
    expect(result).toContain("using System;");
  });

  it("keeps an existing Main and extra class files", () => {
    const result = prepareConsoleSource({
      "Program.cs": `using System;
public class Program {
  public static void Main() { Console.WriteLine(new Animal().Name); }
}`,
      "Animal.cs": `public class Animal { public string Name => "Cat"; }`,
    });
    expect(typeof result).toBe("string");
    if (typeof result !== "string") return;
    expect(result).toContain("static void Main");
    expect(result).toContain("class Animal");
  });

  it("rejects a project with no C# files", () => {
    const result = prepareConsoleSource({ "MyProject.csproj": "<Project />" });
    expect(result).toEqual({ error: "Add a .cs file to run" });
  });

  it("splitUsings pulls using lines out of the body", () => {
    const split = splitUsings("using System;\nConsole.WriteLine(1);");
    expect(split.usings).toContain("using System;");
    expect(split.body).toBe("Console.WriteLine(1);");
  });

  it("hasEntryPoint detects Main", () => {
    expect(hasEntryPoint("public static void Main() {}")).toBe(true);
    expect(hasEntryPoint("Console.WriteLine(1);")).toBe(false);
  });
});
