import Link from "next/link";
import { BriefcaseBusiness, Sparkles } from "lucide-react";
import { PageTransition } from "@/components/page-transition";
import { LogoutButton } from "@/components/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { getAuthState } from "@/lib/auth";

const nav = [
  { href: "/candidate", label: "Candidate" },
  { href: "/recruiter", label: "Recruiter" },
  { href: "/jobs", label: "Jobs" },
  { href: "/upload", label: "Upload" }
];

export async function AppShell({ children }: { children: React.ReactNode }) {
  const auth = await getAuthState();
  const navItems =
    auth?.role === "recruiter"
      ? nav
      : auth?.role === "candidate"
        ? nav.filter((item) => item.href !== "/recruiter")
        : [{ href: "/", label: "Showcase" }];

  return (
    <div className="min-h-screen overflow-x-hidden premium-gradient">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/75 shadow-panel backdrop-blur-2xl">
        <div className="container flex h-[4.25rem] items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 font-display text-base font-semibold tracking-tight">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-background shadow-glow">
              <Sparkles className="h-4 w-4" />
            </span>
            <span>HireSight AI</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Button key={item.href} asChild variant="ghost" size="sm">
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {auth ? (
              <LogoutButton />
            ) : (
              <Button asChild size="sm" className="hidden sm:inline-flex">
                <Link href="/auth">
                  <BriefcaseBusiness className="h-4 w-4" />
                  Sign in
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>
      <PageTransition>{children}</PageTransition>
    </div>
  );
}
