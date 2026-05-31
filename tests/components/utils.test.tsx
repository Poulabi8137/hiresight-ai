import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { cn, formatScore, initials, isServer } from "@/lib/utils";

vi.mock("@/lib/store", () => ({
  useHireSightStore: () => ({
    uploadsByKind: {},
    selectedCandidateId: null,
    uploadProgress: null,
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

describe("Utility functions", () => {
  it("cn merges class names correctly", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
    expect(cn("foo", false && "bar")).toBe("foo");
    expect(cn("px-4", "py-2", "px-4")).toBe("py-2 px-4");
  });

  it("formatScore formats scores", () => {
    expect(formatScore(85)).toBe("85%");
    expect(formatScore(0)).toBe("0%");
    expect(formatScore(100)).toBe("100%");
  });

  it("initials extracts initials", () => {
    expect(initials("John Doe")).toBe("JD");
    expect(initials("alice")).toBe("A");
    expect(initials("")).toBe("");
  });

  it("isServer returns false in jsdom (browser-like) environment", () => {
    expect(isServer()).toBe(false);
  });
});

describe("FormatScore edge cases", () => {
  it("handles nullish values gracefully", () => {
    expect(formatScore(null as any)).toBe("0%");
    expect(formatScore(undefined as any)).toBe("NaN%");
  });

  it("handles decimal scores", () => {
    expect(formatScore(85.7)).toBe("86%");
  });
});
