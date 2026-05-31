import * as Sentry from "@sentry/nextjs";
import { logger } from "@/lib/logger";

type ErrorContext = {
  requestId?: string;
  userId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
};

export function captureError(error: unknown, context?: ErrorContext): void {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  Sentry.withScope((scope) => {
    if (context?.userId) scope.setUser({ id: context.userId });
    if (context?.action) scope.setTag("action", context.action);
    if (context?.requestId) scope.setTag("requestId", context.requestId);
    if (context?.entityType) scope.setTag("entityType", context.entityType);
    if (context?.entityId) scope.setExtra("entityId", context.entityId);
    if (context?.metadata) scope.setContext("metadata", context.metadata);

    Sentry.captureException(error);
  });

  if (!Sentry.isInitialized()) {
    logger.error(message, { ...context });
  }
}

export const track = {
  api: (route: string, error: unknown, ctx?: ErrorContext) =>
    captureError(error, { ...ctx, action: `api:${route}` }),

  upload: (error: unknown, ctx?: ErrorContext) =>
    captureError(error, { ...ctx, action: "upload" }),

  ai: (feature: string, error: unknown, ctx?: ErrorContext) =>
    captureError(error, { ...ctx, action: `ai:${feature}` }),

  db: (operation: string, error: unknown, ctx?: ErrorContext) =>
    captureError(error, { ...ctx, action: `db:${operation}` }),

  realtime: (channel: string, error: unknown, ctx?: ErrorContext) =>
    captureError(error, { ...ctx, action: `realtime:${channel}` })
};
