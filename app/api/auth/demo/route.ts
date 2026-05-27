import { NextResponse } from "next/server";
import { authSchema } from "@/lib/validation";
import { setDemoSessionCookie } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = authSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid auth payload", issues: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();
  if (!supabase) {
    setDemoSessionCookie(parsed.data.role);
    return NextResponse.json({
      role: parsed.data.role,
      message: `Demo ${payload.mode === "signin" ? "login" : "signup"} ready for ${parsed.data.email}. Configure Supabase env vars for live auth.`
    });
  }

  const result =
    payload.mode === "signin"
      ? await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password })
      : await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: { data: { role: parsed.data.role } }
        });

  if (result.error) {
    setDemoSessionCookie(parsed.data.role);
    return NextResponse.json({
      role: parsed.data.role,
      message: `Demo ${payload.mode === "signin" ? "login" : "signup"} ready for ${parsed.data.email}. Supabase returned "${result.error.message}", so the walkthrough is continuing in demo mode.`
    });
  }

  setDemoSessionCookie(parsed.data.role);
  return NextResponse.json({
    user: result.data.user,
    role: parsed.data.role,
    message: "Supabase session established."
  });
}
