import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type LoadingStateProps = {
  text?: string;
  className?: string;
  size?: "sm" | "default" | "lg";
};

export function LoadingState({ text = "Loading...", className, size = "default" }: LoadingStateProps) {
  const sizeClasses = { sm: "h-4 w-4", default: "h-6 w-6", lg: "h-8 w-8" };

  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)} role="status" aria-live="polite">
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      <p className="mt-3 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

export function LoadingSkeleton({ className, lines = 3 }: { className?: string; lines?: number }) {
  return (
    <div className={cn("space-y-3", className)} role="status" aria-label="Loading content">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton h-4 w-full" style={{ width: `${Math.max(60, 100 - i * 12)}%` }} />
      ))}
    </div>
  );
}
