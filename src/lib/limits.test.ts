import { describe, expect, it } from "vitest";
import { MAX_FILE_CHARS, assertSafeSource, unicodeChars, utf8Bytes } from "./limits";

describe("limits", () => {
  it("allows normal text", () => {
    expect(assertSafeSource("Hello, World!")).toBeNull();
  });

  it("allows tab, LF, CR", () => {
    expect(assertSafeSource("a\tb\nc\r")).toBeNull();
  });

  it("rejects control characters (NUL)", () => {
    expect(assertSafeSource("hello\x00world")).not.toBeNull();
  });

  it("rejects bell character", () => {
    expect(assertSafeSource("hello\x07world")).not.toBeNull();
  });

  it("rejects oversized content (chars)", () => {
    expect(assertSafeSource("x".repeat(MAX_FILE_CHARS + 1))).not.toBeNull();
  });

  it("unicodeChars counts BMP characters", () => {
    expect(unicodeChars("hello")).toBe(5);
  });

  it("utf8Bytes counts ascii correctly", () => {
    expect(utf8Bytes("abc")).toBe(3);
  });

  it("MAX_FILE_CHARS is 262144", () => {
    expect(MAX_FILE_CHARS).toBe(262144);
  });
});
