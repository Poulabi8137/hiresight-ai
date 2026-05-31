import { NextResponse } from "next/server";
import { getQueueStats } from "@/lib/job-queue";
import { logger } from "@/lib/logger";
import * as fs from "fs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const healthDir = process.env.WORKER_HEALTH_DIR ?? "/tmp";
  let workerProcess: Record<string, unknown> = { status: "unknown" };

  try {
    const raw = fs.readFileSync(`${healthDir}/worker-health.json`, "utf-8");
    workerProcess = JSON.parse(raw);
  } catch {
    workerProcess = { status: "not_running" };
  }

  let queueStats = { pending: 0, running: 0, completed: 0, failed: 0, deadLetter: 0 };
  try {
    queueStats = await getQueueStats();
  } catch (e) {
    logger.warn("health/worker: queue stats unavailable", { metadata: { error: String(e) } });
  }

  const healthy = workerProcess.status === "running" || (queueStats.pending === 0 && queueStats.running === 0);

  return NextResponse.json({
    status: healthy ? "healthy" : "degraded",
    worker: workerProcess,
    queue: queueStats,
    timestamp: new Date().toISOString()
  });
}
