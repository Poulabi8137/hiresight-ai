/**
 * Background Worker — Dedicated queue consumer process.
 *
 * Runs independently from the Next.js web server.
 * Polls the job_queue table for pending jobs and processes them.
 *
 * Usage:
 *   npx tsx scripts/worker.ts
 *
 * Docker:
 *   docker compose run worker
 *   docker compose up worker
 */

import { dequeueJob, workerProcessJob, getQueueStats, startCleanup } from "@/lib/job-queue";
import "@/lib/jobs";
import { logger } from "@/lib/logger";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const POLL_INTERVAL_MS = parseInt(process.env.WORKER_POLL_INTERVAL ?? "2000", 10);
const HEALTH_LOG_INTERVAL_MS = 60_000;

// ---------------------------------------------------------------------------
// Worker State
// ---------------------------------------------------------------------------

let running = true;
let processedCount = 0;
let failedCount = 0;
let startTime = Date.now();

// ---------------------------------------------------------------------------
// Cleanup
// ---------------------------------------------------------------------------

function shutdown(signal: string): void {
  logger.info(`Worker received ${signal} — shutting down gracefully...`);
  running = false;
  setTimeout(() => {
    logger.info("Worker forced exit after timeout.");
    process.exit(1);
  }, 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("uncaughtException", (err) => {
  logger.error("Worker uncaught exception", { metadata: { error: err.message, stack: err.stack } });
});
process.on("unhandledRejection", (reason) => {
  logger.error("Worker unhandled rejection", { metadata: { reason: String(reason) } });
});

// ---------------------------------------------------------------------------
// Health info file (read by health endpoint)
// ---------------------------------------------------------------------------

function writeHealthFile(): void {
  try {
    const fs = require("fs");
    const health = {
      status: "running",
      uptime: Date.now() - startTime,
      processed: processedCount,
      failed: failedCount,
      lastHeartbeat: new Date().toISOString()
    };
    const dir = process.env.WORKER_HEALTH_DIR ?? "/tmp";
    fs.writeFileSync(`${dir}/worker-health.json`, JSON.stringify(health));
  } catch { /* not critical */ }
}

// ---------------------------------------------------------------------------
// Main worker loop
// ---------------------------------------------------------------------------

async function tick(): Promise<void> {
  if (!running) return;

  try {
    const job = await dequeueJob();
    if (job) {
      logger.info(`Worker processing job: ${job.type}`, { metadata: { jobId: job.id } });
      try {
        await workerProcessJob(job);
        processedCount++;
      } catch {
        failedCount++;
      }
    }
  } catch (e) {
    logger.error("Worker tick error", { metadata: { error: String(e) } });
    failedCount++;
  }
}

async function main(): Promise<void> {
  logger.info(`Worker starting (poll interval: ${POLL_INTERVAL_MS}ms)`);

  // Register handlers (imported above via @/lib/jobs)
  // Start periodic cleanup of old completed/failed jobs
  startCleanup();

  // Health file heartbeat
  const heartbeatTimer = setInterval(writeHealthFile, 30_000);
  writeHealthFile();

  // Periodic queue stats log
  const statsTimer = setInterval(async () => {
    if (!running) return;
    try {
      const stats = await getQueueStats();
      logger.info("Worker queue stats", { metadata: { ...stats, processed: processedCount, failed: failedCount } });
    } catch { /* ignore */ }
  }, HEALTH_LOG_INTERVAL_MS);

  // Main poll loop
  while (running) {
    await tick();
    if (running) {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }
  }

  // Graceful shutdown
  clearInterval(heartbeatTimer);
  clearInterval(statsTimer);
  logger.info("Worker stopped.", {
    metadata: {
      uptime: `${Math.round((Date.now() - startTime) / 1000)}s`,
      processed: processedCount,
      failed: failedCount
    }
  });
  process.exit(0);
}

main().catch((err) => {
  logger.error("Worker fatal error", { metadata: { error: err.message, stack: err.stack } });
  process.exit(1);
});
