import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Role } from "@/lib/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type AuthState = {
  userId: string;
  role: Role;
  email?: string;
  source: "supabase" | "demo";
};

const demoCookie = "hiresight_demo_role";

export function setDemoSessionCookie(role: Role) {
  cookies().set(demoCookie, role, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/"
  });
}

export function getDemoSessionRole(): Role | null {
  const value = cookies().get(demoCookie)?.value;
  return value === "candidate" || value === "recruiter" ? value : null;
}

export async function getAuthState(): Promise<AuthState | null> {
  const supabase = createServerSupabaseClient();
  if (supabase) {
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
        return {
          userId: data.user.id,
          role,
          email: profile?.email ?? data.user.email,
          source: "supabase"
        };
      }
    }
  }

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
