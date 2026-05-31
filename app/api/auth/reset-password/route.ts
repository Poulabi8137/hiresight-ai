import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth?mode=signin`,
  });

  if (error) {
    logger.error("auth: reset password failed", { metadata: { error: error.message, email } });
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  logger.info("auth: reset password email sent", { metadata: { email } });
  return NextResponse.json({
    message: "If an account with that email exists, a password reset link has been sent."
  });
}
