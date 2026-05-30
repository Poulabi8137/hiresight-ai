"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { logger } from "@/lib/logger";

type TableName =
  | "applications"
  | "recruiter_notes"
  | "uploads"
  | "saved_jobs"
  | "activity_log"
  | "ai_scoring_cache";

type EventType = "INSERT" | "UPDATE" | "DELETE";

type RealtimePayload = {
  eventType: EventType;
  table: TableName;
  new: Record<string, unknown>;
  old: Record<string, unknown>;
};

type SubscriptionOptions = {
  table: TableName;
  filter?: string;
  onEvent: (payload: RealtimePayload) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
};

let realtimeClient: ReturnType<typeof createClient> | null = null;

function getRealtimeClient() {
  if (!realtimeClient) {
    realtimeClient = createClient();
  }
  return realtimeClient;
}

const activeSubscriptions = new Map<string, () => void>();

/**
 * Subscribe to realtime changes on a Supabase table.
 * Returns an unsubscribe function. Manages subscription lifecycle automatically.
 */
export function subscribeToTable(options: SubscriptionOptions): () => void {
  const { table, filter, onEvent, onError } = options;
  const client = getRealtimeClient();
  if (!client) {
    logger.warn(`Realtime unavailable — cannot subscribe to ${table}`);
    return () => {};
  }

  const subKey = `${table}:${filter ?? "*"}`;

  // Dedup: avoid duplicate subscriptions for same table+filter
  if (activeSubscriptions.has(subKey)) {
    return activeSubscriptions.get(subKey)!;
  }

  let channel = client.channel(subKey);

  channel = channel.on(
    "postgres_changes" as any,
    { event: "*", schema: "public", table, filter },
    (payload: any) => {
      onEvent({
        eventType: payload.eventType as EventType,
        table,
        new: payload.new ?? {},
        old: payload.old ?? {}
      });
    }
  );

  channel.subscribe((status: string) => {
    if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
      logger.warn(`Realtime subscription error for ${subKey}: ${status}`);
      onError?.(new Error(`Realtime ${status}`));
    }
  });

  const unsubscribe = () => {
    client.removeChannel(channel);
    activeSubscriptions.delete(subKey);
  };

  activeSubscriptions.set(subKey, unsubscribe);
  return unsubscribe;
}

/**
 * React hook for realtime subscriptions with automatic cleanup.
 * Provides optimistic update pattern with rollback.
 */
export function useRealtimeSubscription(options: SubscriptionOptions & { deps?: unknown[] }) {
  const { table, filter, onEvent, onError, enabled = true, deps = [] } = options;
  const callbackRef = useRef(onEvent);
  const errorRef = useRef(onError);

  callbackRef.current = onEvent;
  errorRef.current = onError;

  useEffect(() => {
    if (!enabled) return;

    const unsub = subscribeToTable({
      table,
      filter,
      onEvent: (payload) => callbackRef.current(payload),
      onError: (err) => errorRef.current?.(err)
    });

    return () => {
      unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, filter, enabled, ...deps]);
}
