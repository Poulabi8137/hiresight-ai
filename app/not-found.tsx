import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="container flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-semibold">Page not found</h1>
      <p className="mt-3 text-muted-foreground">The requested hiring view does not exist.</p>
      <Button asChild className="mt-6">
        <Link href="/">Return home</Link>
      </Button>
    </main>
  );
}
