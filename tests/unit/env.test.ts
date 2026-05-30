import { describe, it, expect, beforeEach } from "vitest";
import { checkEnv, clearEnvCache } from "@/lib/env";

describe("checkEnv", () => {
  beforeEach(() => {
    clearEnvCache();
  });

  it("returns valid status when required vars are set", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
    (process.env as Record<string, string>).NODE_ENV = "test";
    const result = checkEnv();
    expect(result.valid).toBe(true);
    expect(result.missing).toEqual([]);
  });

  it("reports missing required vars", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    (process.env as Record<string, string>).NODE_ENV = "test";
    clearEnvCache();
    const result = checkEnv();
    expect(result.valid).toBe(false);
    expect(result.missing.length).toBeGreaterThan(0);
  });

  it("warns about missing optional vars", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    (process.env as Record<string, string>).NODE_ENV = "test";
    clearEnvCache();
    const result = checkEnv();
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});
