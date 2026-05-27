import { Sparkles } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <div className="glass rounded-lg p-6 text-center">
        <Sparkles className="mx-auto h-6 w-6 animate-pulse text-primary" />
        <p className="mt-3 text-sm text-muted-foreground">Preparing HireSight AI...</p>
      </div>
    </div>
  );
}
