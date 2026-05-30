import { describe, it, expect } from "vitest";
import { cn, formatScore, initials, isServer, fetchWithTimeout } from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("resolves tailwind conflicts (last wins)", () => {
    const result = cn("px-4", "px-6");
    expect(result).toBe("px-6");
  });

  it("handles empty inputs", () => {
    expect(cn()).toBe("");
  });
});

describe("formatScore", () => {
  it("formats integer scores with % suffix", () => {
    expect(formatScore(85)).toBe("85%");
  });

  it("rounds decimal scores with % suffix", () => {
    expect(formatScore(85.7)).toBe("86%");
  });
});

describe("initials", () => {
  it("extracts initials from full name", () => {
    expect(initials("Marcus Lee")).toBe("ML");
  });

  it("handles single name", () => {
    expect(initials("Marcus")).toBe("M");
  });

  it("handles triple names (first 2 initials)", () => {
    const result = initials("John Michael Doe");
    expect(result).toBe("JM");
  });

  it("handles empty string", () => {
    expect(initials("")).toBe("");
  });
});

describe("isServer", () => {
  it("returns true when called from server context", () => {
    const result = isServer();
    // In Vitest (Node), it should be true
    expect(result).toBe(true);
  });
});

describe("fetchWithTimeout", () => {
  it("rejects on timeout/abort", async () => {
    await expect(fetchWithTimeout("https://httpbin.org/delay/5", {}, 10)).rejects.toThrow();
  }, 5000);

  it("rejects on invalid URL", async () => {
    await expect(
      fetchWithTimeout("https://nonexistent-domain-12345.com/api", {}, 1000)
    ).rejects.toThrow();
  }, 5000);
});
