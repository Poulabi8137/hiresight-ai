"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  side?: "left" | "right";
  className?: string;
};

export function Drawer({ open, onClose, title, children, side = "right", className }: DrawerProps) {
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const sideClasses = side === "right" ? "right-0 animate-slide-in-right" : "left-0";
  const translateClass = side === "right" ? "translate-x-0" : "-translate-x-0";

  return (
    <div className="fixed inset-0 z-70" role="dialog" aria-modal="true" aria-label={title}>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={cn(
        "fixed top-0 bottom-0 w-full max-w-md border-l border-border/60 bg-background shadow-2xl",
        sideClasses, translateClass, className
      )}>
        <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary transition-colors ml-auto"
            aria-label="Close drawer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto h-[calc(100%-4rem)] p-6">{children}</div>
      </div>
    </div>
  );
}
