"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type TabsProps = {
  tabs: Array<{ id: string; label: string; content: React.ReactNode }>;
  defaultTab?: string;
  className?: string;
  onChange?: (tabId: string) => void;
};

export function Tabs({ tabs, defaultTab, className, onChange }: TabsProps) {
  const [active, setActive] = React.useState(defaultTab ?? tabs[0]?.id ?? "");

  return (
    <div className={cn("w-full", className)}>
      <div className="flex gap-1 border-b border-border/60" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active === tab.id}
            onClick={() => { setActive(tab.id); onChange?.(tab.id); }}
            className={cn(
              "relative px-4 py-2.5 text-sm font-medium transition-colors",
              active === tab.id
                ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4" role="tabpanel">
        {tabs.find((t) => t.id === active)?.content}
      </div>
    </div>
  );
}
