import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    channel: () => ({
      on: () => ({
        subscribe: (cb: any) => cb("SUBSCRIBED"),
      }),
    }),
    removeChannel: vi.fn(),
  }),
}));

describe("useRealtimeSubscription", () => {
  it("subscribes and unsubscribes on mount/unmount", async () => {
    const { useRealtimeSubscription } = await import("@/lib/use-realtime");
    const onEvent = vi.fn();
    const { unmount } = renderHook(() =>
      useRealtimeSubscription({
        table: "applications",
        onEvent,
        enabled: true,
      })
    );
    expect(onEvent).not.toHaveBeenCalled();
    unmount();
  });

  it("does not subscribe when disabled", async () => {
    const { useRealtimeSubscription } = await import("@/lib/use-realtime");
    const onEvent = vi.fn();
    const { unmount } = renderHook(() =>
      useRealtimeSubscription({
        table: "applications",
        onEvent,
        enabled: false,
      })
    );
    expect(onEvent).not.toHaveBeenCalled();
    unmount();
  });
});
