import { logger } from "@/lib/logger";
import { track } from "@/lib/monitoring";

export type JobStatus = "pending" | "running" | "completed" | "failed" | "dead_letter";

export type Job<T = unknown> = {
  id: string;
  type: string;
  payload: T;
  status: JobStatus;
  attempts: number;
  maxAttempts: number;
  error?: string;
  createdAt: number;
  updatedAt: number;
};

type JobHandler<T = unknown> = (job: Job<T>) => Promise<void>;

const handlers = new Map<string, JobHandler<any>>();
let jobCounter = 0;
let dbClient: { from: (table: string) => any } | null = null;

export type QueueStats = {
  pending: number;
  running: number;
  completed: number;
  failed: number;
  deadLetter: number;
};

function getDb(): { from: (table: string) => any } | null {
  if (dbClient) return dbClient;
  try {
    const { createClient } = require("@supabase/supabase-js");
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (url && key) {
      dbClient = createClient(url, key);
      return dbClient;
    }
  } catch { /* fall through */ }
  return null;
}

export function registerJobHandler<T>(type: string, handler: JobHandler<T>): void {
  handlers.set(type, handler);
}

export function getHandler(type: string): JobHandler<any> | undefined {
  return handlers.get(type);
}

// ---------------------------------------------------------------------------
// Enqueue — persists job and returns immediately (no inline processing)
// ---------------------------------------------------------------------------

export async function enqueueJob<T>(type: string, payload: T, maxAttempts = 3): Promise<Job<T>> {
  jobCounter++;
  const job: Job<T> = {
    id: `job-${Date.now().toString(36)}-${jobCounter.toString(36)}`,
    type,
    payload,
    status: "pending",
    attempts: 0,
    maxAttempts,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  const db = getDb();
  if (db) {
    try {
      await db.from("job_queue").insert({
        id: job.id,
        type: job.type,
        payload: JSON.stringify(job.payload),
        status: job.status,
        attempts: job.attempts,
        max_attempts: job.maxAttempts,
        created_at: new Date(job.createdAt).toISOString(),
        updated_at: new Date(job.updatedAt).toISOString()
      });
    } catch (e) {
      track.db("queue:insert", e);
      logger.warn("queue: insert failed", { metadata: { jobId: job.id, type, error: String(e) } });
    }
  } else {
    logger.warn("queue: no db available, enqueue skipped", { metadata: { jobId: job.id, type } });
  }

  return job;
}

// ---------------------------------------------------------------------------
// Dequeue — atomically claim the next pending job for processing
// ---------------------------------------------------------------------------

export async function dequeueJob(): Promise<Job<any> | null> {
  const db = getDb();
  if (!db) return null;

  try {
    const { data, error } = await db.from("job_queue")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(1)
      .single();

    if (error || !data) return null;

    const { error: claimError } = await db.from("job_queue")
      .update({ status: "running", updated_at: new Date().toISOString() })
      .eq("id", data.id)
      .eq("status", "pending");

    if (claimError) return null;

    return {
      id: data.id,
      type: data.type,
      payload: typeof data.payload === "string" ? JSON.parse(data.payload) : (data.payload ?? {}),
      status: "running",
      attempts: data.attempts ?? 0,
      maxAttempts: data.max_attempts ?? 3,
      error: data.error,
      createdAt: new Date(data.created_at).getTime(),
      updatedAt: Date.now()
    };
  } catch (e) {
    track.db("queue:dequeue", e);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Status updates — completed / failed / dead-letter
// ---------------------------------------------------------------------------

export async function completeJob(jobId: string): Promise<void> {
  const db = getDb();
  if (!db) return;
  try {
    await db.from("job_queue")
      .update({ status: "completed", updated_at: new Date().toISOString() })
      .eq("id", jobId);
  } catch (e) {
    track.db("queue:complete", e);
  }
}

export async function failJob(jobId: string, error: string, attempts: number, maxAttempts: number): Promise<void> {
  const db = getDb();
  if (!db) return;

  const isDeadLetter = attempts >= maxAttempts;
  const nextStatus = isDeadLetter ? "dead_letter" : "pending";

  try {
    await db.from("job_queue")
      .update({
        status: nextStatus,
        error,
        attempts,
        updated_at: new Date().toISOString()
      })
      .eq("id", jobId);
  } catch (e) {
    track.db("queue:fail", e);
  }
}

// ---------------------------------------------------------------------------
// Worker process — claim → handle → complete/fail (called by the worker)
// ---------------------------------------------------------------------------

export async function workerProcessJob(job: Job<any>): Promise<void> {
  const handler = handlers.get(job.type);
  if (!handler) {
    logger.error(`No handler for job type: ${job.type}`, { metadata: { jobId: job.id } });
    await failJob(job.id, `No handler registered for type: ${job.type}`, job.attempts, job.maxAttempts);
    return;
  }

  try {
    await handler(job);
    await completeJob(job.id);
    logger.debug(`Job completed: ${job.type}`, { metadata: { jobId: job.id } });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const newAttempts = job.attempts + 1;
    track.ai(job.type, e, { metadata: { jobId: job.id, attempt: newAttempts } });

    if (newAttempts < job.maxAttempts) {
      const delay = Math.pow(2, newAttempts) * 1000;
      logger.warn(`Job retrying in ${delay}ms: ${job.type}`, {
        metadata: { jobId: job.id, attempt: newAttempts, error: message }
      });
      await failJob(job.id, message, newAttempts, job.maxAttempts);
    } else {
      logger.error(`Job dead-letter after ${job.maxAttempts} attempts: ${job.type}`, {
        metadata: { jobId: job.id, error: message }
      });
      await failJob(job.id, message, newAttempts, job.maxAttempts);
    }
  }
}

// ---------------------------------------------------------------------------
// Queue stats (for health monitoring)
// ---------------------------------------------------------------------------

export async function getQueueStats(): Promise<QueueStats> {
  const db = getDb();
  if (!db) return { pending: 0, running: 0, completed: 0, failed: 0, deadLetter: 0 };

  try {
    const { data, error } = await db.from("job_queue")
      .select("status, count", { count: "exact", head: false })
      .then((r: any) => r);

    // Fall back to per-status queries if aggregate fails
    const counts = { pending: 0, running: 0, completed: 0, failed: 0, dead_letter: 0 };
    for (const status of Object.keys(counts) as JobStatus[]) {
      const { count } = await db.from("job_queue")
        .select("id", { count: "exact", head: true })
        .eq("status", status);
      counts[status as keyof typeof counts] = count ?? 0;
    }
    return {
      pending: counts.pending,
      running: counts.running,
      completed: counts.completed,
      failed: counts.failed,
      deadLetter: counts.dead_letter
    };
  } catch (e) {
    track.db("queue:stats", e);
    return { pending: 0, running: 0, completed: 0, failed: 0, deadLetter: 0 };
  }
}

// ---------------------------------------------------------------------------
// Inline processing (legacy — for environments without a dedicated worker)
// ---------------------------------------------------------------------------

export async function processJobInline<T>(type: string, payload: T): Promise<void> {
  const handler = handlers.get(type);
  if (!handler) {
    logger.error(`No handler for inline job: ${type}`);
    return;
  }
  const job: Job<T> = {
    id: `inline-${Date.now().toString(36)}`,
    type,
    payload,
    status: "running",
    attempts: 1,
    maxAttempts: 1,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  try {
    await handler(job);
  } catch (e) {
    logger.error(`Inline job failed: ${type}`, { metadata: { error: String(e) } });
  }
}

const CLEANUP_INTERVAL = 300_000;
const CLEANUP_AGE = 3600_000;

let cleanupTimer: ReturnType<typeof setInterval> | null = null;

export function startCleanup(): void {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const cutoff = new Date(Date.now() - CLEANUP_AGE).toISOString();
    const db = getDb();
    if (!db) return;
    db.from("job_queue")
      .delete()
      .in("status", ["completed", "dead_letter"])
      .lt("updated_at", cutoff)
      .then(({ error }: any) => {
        if (error) logger.warn("queue: cleanup failed", { metadata: { error: error.message } });
      });
  }, CLEANUP_INTERVAL);
}
