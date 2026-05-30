import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { checkEnv, getEnvSummary } from "@/lib/env";
import { logger, generateRequestId } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const requestId = generateRequestId();
  const checks: Record<string, "ok" | "unavailable"> = {};
  const env = checkEnv();

  checks.supabase_config = env.missing.length === 0 ? "ok" : "unavailable";
  checks.service_role = process.env.SUPABASE_SERVICE_ROLE_KEY ? "ok" : "unavailable";
  checks.ai_api_key = process.env.GOOGLE_GENERATIVE_AI_API_KEY ? "ok" : "unavailable";

  const supabase = createServiceSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from("applications").select("id").limit(1);
      checks.database = error ? "unavailable" : "ok";
      if (error) logger.warn("Health check: DB query failed", { requestId, error: error.message });
    } catch (e) {
      checks.database = "unavailable";
      logger.warn("Health check: DB unreachable", { requestId, error: String(e) });
    }
  } else {
    checks.database = "unavailable";
  }

  const healthy = Object.values(checks).every((v) => v === "ok");

  const response = {
    status: healthy ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    env: getEnvSummary(),
    checks
  };

  logger.info("Health check completed", { requestId, metadata: { status: response.status } });
  return NextResponse.json(response);
}
