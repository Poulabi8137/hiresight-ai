import Link from "next/link";
import { BriefcaseBusiness, LayoutDashboard, Sparkles, UserRound, Briefcase, Upload, LogOut } from "lucide-react";
import { PageTransition } from "@/components/page-transition";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { getAuthState } from "@/lib/auth";

const navItems = [
  { href: "/candidate", label: "Dashboard", icon: LayoutDashboard, roles: ["candidate"] },
  { href: "/recruiter", label: "Dashboard", icon: LayoutDashboard, roles: ["recruiter"] },
  { href: "/jobs", label: "Jobs", icon: Briefcase, roles: ["candidate", "recruiter"] },
  { href: "/upload", label: "Upload", icon: Upload, roles: ["candidate"] },
];

export async function AppShell({ children }: { children: React.ReactNode }) {
  const auth = await getAuthState();

  const availableNav = auth?.role
    ? navItems.filter((item) => item.roles.includes(auth.role!))
    : [{ href: "/", label: "Showcase", icon: Sparkles, roles: [] as string[] }];

  return (
    <div className="min-h-screen overflow-x-hidden premium-gradient">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/75 shadow-panel backdrop-blur-2xl">
        <div className="container flex h-[4.25rem] items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 font-display text-base font-semibold tracking-tight">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-background shadow-glow-sm">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="hidden sm:inline">HireSight AI</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {availableNav.map((item) => (
              <Button key={item.href} asChild variant="ghost" size="sm">
                <Link href={item.href} className="gap-2">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {auth ? (
              <LogoutForm />
            ) : (
              <Button asChild size="sm">
                <Link href="/auth">
                  <BriefcaseBusiness className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign in</span>
                </Link>
              </Button>
            )}
          </div>
        </div>

        {auth?.role && (
          <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-border/60 bg-background/90 backdrop-blur-2xl safe-area-bottom">
            <div className="flex justify-around py-2">
              {availableNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center gap-0.5 px-3 py-1 text-2xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </header>
      <PageTransition>
        <div className={auth?.role ? "pb-20 md:pb-0" : ""}>{children}</div>
      </PageTransition>
    </div>
  );
}

function LogoutForm() {
  return (
    <form action="/api/auth/logout" method="POST">
      <Button type="submit" size="sm" variant="outline" className="bg-background/70 backdrop-blur-md gap-2">
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Logout</span>
      </Button>
    </form>
  );
}
