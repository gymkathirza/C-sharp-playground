import { describe, expect, it } from "vitest";
import { fileExt, stemOf, validateFilePath, validateSegment } from "./paths";

describe("paths", () => {
  it("allows valid .cs file paths", () => {
    expect(validateFilePath("Program.cs")).toBeNull();
    expect(validateFilePath("src/Models/User.cs")).toBeNull();
  });

  it("allows valid .csproj paths", () => {
    expect(validateFilePath("MyProject.csproj")).toBeNull();
  });

  it("allows .json, .txt, .md extensions", () => {
    expect(validateFilePath("appsettings.json")).toBeNull();
    expect(validateFilePath("README.md")).toBeNull();
    expect(validateFilePath("notes.txt")).toBeNull();
  });

  it("rejects path traversal", () => {
    expect(validateFilePath("../secret.cs")).not.toBeNull();
    expect(validateFilePath("a/../../b.cs")).not.toBeNull();
  });

  it("rejects absolute paths", () => {
    expect(validateFilePath("/etc/passwd")).not.toBeNull();
  });

  it("rejects disallowed extensions", () => {
    expect(validateFilePath("run.sh")).not.toBeNull();
    expect(validateFilePath("file.js")).not.toBeNull();
  });

  it("rejects double slashes", () => {
    expect(validateFilePath("a//b.cs")).not.toBeNull();
  });

  it("validateSegment rejects slashes and empty names", () => {
    expect(validateSegment("a/b")).not.toBeNull();
    expect(validateSegment("")).not.toBeNull();
  });

  it("validateSegment allows letters and numbers", () => {
    expect(validateSegment("MyClass")).toBeNull();
    expect(validateSegment("my_class_123")).toBeNull();
  });

  it("fileExt detects known extensions", () => {
    expect(fileExt("Program.cs")).toBe("cs");
    expect(fileExt("file.xyz")).toBeNull();
  });

  it("stemOf strips extension", () => {
    expect(stemOf("Program.cs")).toBe("Program");
    expect(stemOf("MyProject.csproj")).toBe("MyProject");
  });
});
