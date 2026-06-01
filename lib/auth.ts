import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, randomBytes } from "crypto";
import type { Role } from "@/lib/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type AuthState = {
  userId: string;
  role: Role;
  email?: string;
  source: "supabase" | "demo";
};

const demoCookie = "hiresight_demo_role";

function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

function getDemoSecret(): string {
  // Used to sign demo session cookies so they cannot be forged.
  // Falls back to a per-startup random value (invalidates all sessions on restart).
  return process.env.HIRESIGHT_DEMO_SECRET ?? randomBytes(32).toString("hex");
}

function signDemoCookie(role: string): string {
  const secret = getDemoSecret();
  const hmac = createHash("sha256").update(`${role}:${secret}`).digest("hex").slice(0, 16);
  return `${role}.${hmac}`;
}

function verifyDemoCookie(raw: string): Role | null {
  const dot = raw.lastIndexOf(".");
  if (dot === -1) return null;
  const role = raw.slice(0, dot) as Role;
  const signature = raw.slice(dot + 1);
  if (role !== "candidate" && role !== "recruiter") return null;
  const expected = createHash("sha256").update(`${role}:${getDemoSecret()}`).digest("hex").slice(0, 16);
  // Constant-time comparison
  if (signature.length !== expected.length) return null;
  let match = 0;
  for (let i = 0; i < signature.length; i++) {
    match |= signature.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return match === 0 ? role : null;
}

export function setDemoSessionCookie(role: Role) {
  cookies().set(demoCookie, signDemoCookie(role), {
    httpOnly: true,
    sameSite: "strict",
    secure: true,
    maxAge: 60 * 60 * 24 * 7,
    path: "/"
  });
}

export function getDemoSessionRole(): Role | null {
  const raw = cookies().get(demoCookie)?.value;
  if (!raw) return null;
  return verifyDemoCookie(raw);
}

export async function getAuthState(): Promise<AuthState | null> {
  // --- Production guard ---
  // When SUPABASE_URL and SERVICE_ROLE_KEY are both set this is a real deployment.
  // Demo auth must never silently activate in that environment.
  const supabaseConfigured = isSupabaseConfigured();
  const serviceKeyPresent = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (supabaseConfigured && serviceKeyPresent && process.env.NODE_ENV === "production") {
    // Production mode: only Supabase sessions accepted.
    const supabase = createServerSupabaseClient();
    if (!supabase) return null;
    try {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        const metadataRole = data.user.user_metadata?.role;
        const { data: profile } = await supabase
          .from("users")
          .select("role,email")
          .eq("id", data.user.id)
          .maybeSingle();
        const role = profile?.role ?? metadataRole;
        if (role === "candidate" || role === "recruiter") {
          return { userId: data.user.id, role, email: profile?.email ?? data.user.email, source: "supabase" };
        }
      }
    } catch {
      // Logged by health check; return null (no fallback to demo)
    }
    return null;
  }

  // --- Dev / judges mode ---
  // Try Supabase first if configured.  If the service key is missing or Supabase is
  // unreachable, fall back to signed demo cookies when HIRESIGHT_DEMO_AUTH is enabled.
  const supabase = createServerSupabaseClient();
  if (supabase) {
    try {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        const metadataRole = data.user.user_metadata?.role;
        const { data: profile } = await supabase
          .from("users")
          .select("role,email")
          .eq("id", data.user.id)
          .maybeSingle();
        const role = profile?.role ?? metadataRole;
        if (role === "candidate" || role === "recruiter") {
          return { userId: data.user.id, role, email: profile?.email ?? data.user.email, source: "supabase" };
        }
      }
    } catch {
      // Supabase unreachable — fall through to demo if enabled
    }
    // Supabase was reachable and returned no session — do NOT fall through to demo
    // when the user explicitly has Supabase credentials configured.
    if (supabaseConfigured) return null;
  }

  // Only try demo when Supabase is not configured at all.
  if (process.env.HIRESIGHT_DEMO_AUTH !== "true") return null;

  const demoRole = getDemoSessionRole();
  if (!demoRole) return null;

  return {
    userId: demoRole === "candidate" ? "00000000-0000-0000-0000-000000000002" : "00000000-0000-0000-0000-000000000003",
    role: demoRole,
    email: `${demoRole}@hiresight.ai`,
    source: "demo"
  };
}

export async function requireRole(role: Role) {
  const auth = await getAuthState();
  if (!auth || auth.role !== role) {
    redirect(`/auth?role=${role}&mode=signin`);
  }
  return auth;
}

export async function requireAnyRole() {
  const auth = await getAuthState();
  if (!auth) {
    redirect("/auth?role=candidate&mode=signin");
  }
  return auth;
}
