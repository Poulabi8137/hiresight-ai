type LogLevel = "debug" | "info" | "warn" | "error";

type LogEntry = {
  level: LogLevel;
  message: string;
  requestId?: string;
  duration?: number;
  error?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
};

const isProduction = process.env.NODE_ENV === "production";

let requestIdCounter = 0;

export function generateRequestId(): string {
  requestIdCounter++;
  return `req-${Date.now().toString(36)}-${requestIdCounter.toString(36)}`;
}

function log(level: LogLevel, message: string, meta?: Partial<LogEntry>): void {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta
  };

  if (isProduction) {
    // In production, structured JSON to stdout for log aggregators
    console[level === "error" ? "error" : level === "warn" ? "warn" : "log"](JSON.stringify(entry));
  } else {
    const prefix = `[${entry.timestamp.slice(11, 19)}] [${level.toUpperCase()}]`;
    const suffix = entry.requestId ? ` [${entry.requestId}]` : "";
    const duration = entry.duration ? ` +${entry.duration}ms` : "";
    const error = entry.error ? ` error=${entry.error}` : "";
    console[level === "error" ? "error" : level === "warn" ? "warn" : "log"](
      `${prefix}${suffix}${duration}${error} ${message}`
    );
  }
}

export const logger = {
  debug: (msg: string, meta?: Partial<LogEntry>) => log("debug", msg, meta),
  info: (msg: string, meta?: Partial<LogEntry>) => log("info", msg, meta),
  warn: (msg: string, meta?: Partial<LogEntry>) => log("warn", msg, meta),
  error: (msg: string, meta?: Partial<LogEntry>) => log("error", msg, meta),

  /** Measure and log async operation duration */
  timed: async <T>(label: string, fn: () => Promise<T>, meta?: Partial<LogEntry>): Promise<T> => {
    const start = performance.now();
    try {
      const result = await fn();
      logger.info(`${label} succeeded`, { ...meta, duration: Math.round(performance.now() - start) });
      return result;
    } catch (e) {
      logger.error(`${label} failed`, {
        ...meta,
        duration: Math.round(performance.now() - start),
        error: e instanceof Error ? e.message : "Unknown"
      });
      throw e;
    }
  }
};
