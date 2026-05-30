export default function Loading() {
  return (
    <div className="relative flex min-h-[calc(100vh-4.25rem)] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading\u2026</p>
      </div>
    </div>
  );
}
