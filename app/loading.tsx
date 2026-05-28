import { Sparkles } from "lucide-react";

export default function Loading() {
  return (
    <div className="relative flex min-h-[calc(100vh-4.25rem)] items-center justify-center overflow-hidden cinematic-mesh">
      <div className="pointer-events-none absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:56px_56px]" />
      <div className="glass relative w-[min(26rem,92vw)] overflow-hidden rounded-2xl p-7 text-center">
        <div className="absolute inset-0 opacity-30 [background:linear-gradient(115deg,transparent_0%,rgba(45,212,191,0.55)_35%,transparent_70%)] animate-shimmer" />
        <div className="relative">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-background shadow-glow">
            <Sparkles className="h-5 w-5 motion-safe:animate-pulse" />
          </div>
          <p className="section-kicker mt-5">Initializing</p>
          <p className="mt-2 text-sm text-muted-foreground">Preparing HireSight AI…</p>
          <div className="mt-6 grid gap-2">
            {["Booting cinematic UI", "Warming 3D scene", "Loading recruiter workspace"].map((label) => (
              <div key={label} className="h-9 rounded-xl border border-border/70 bg-background/60" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
