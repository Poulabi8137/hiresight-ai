const REQUIRED_SERVER = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

const OPTIONAL_SERVER = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "GOOGLE_GENERATIVE_AI_API_KEY",
] as const;

type EnvStatus = {
  valid: boolean;
  missing: string[];
  warnings: string[];
  mode: "production" | "development" | "test";
};

let cached: EnvStatus | null = null;

export function checkEnv(): EnvStatus {
  if (cached && process.env.NODE_ENV !== "production") return cached;

  const missing: string[] = [];
  const warnings: string[] = [];

  for (const key of REQUIRED_SERVER) {
    if (!process.env[key]) missing.push(key);
  }

  for (const key of OPTIONAL_SERVER) {
    if (!process.env[key]) warnings.push(`${key} is not set — some features will use fallback mode`);
  }

  const valid = missing.length === 0;
  const mode = (process.env.NODE_ENV as EnvStatus["mode"]) ?? "development";

  cached = { valid, missing, warnings, mode };
  return cached;
}

/** Clear cached env status (for testing) */
export function clearEnvCache() {
  cached = null;
}

export function getEnvSummary(): string {
  const status = checkEnv();
  const parts: string[] = [`Mode: ${status.mode}`];
  if (status.valid) parts.push("Required vars: OK");
  else parts.push(`Missing: ${status.missing.join(", ")}`);
  if (status.warnings.length > 0) parts.push(`Warnings: ${status.warnings.join("; ")}`);
  return parts.join(" | ");
}
