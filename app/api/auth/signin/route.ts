import { NextResponse } from "next/server";
import { authSchema } from "@/lib/validation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { assertCSRF } from "@/lib/csrf";

export async function POST(request: Request) {
  const csrf = assertCSRF(request); if (csrf) return csrf;
  const payload = await request.json();
  const parsed = authSchema.safeParse(payload);

  if (!parsed.success) {
    logger.warn("auth: signin invalid payload", { metadata: { issues: parsed.error.flatten() } });
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.flatten() }, { status: 400 });
  }

  const { email, password } = parsed.data;

  const supabase = createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  logger.info("auth: signin attempt", { metadata: { email } });

  const result = await supabase.auth.signInWithPassword({ email, password });

  if (result.error) {
    const errMsg = result.error.message;
    logger.error("auth: signInWithPassword failed", { metadata: { error: errMsg, email } });

    return NextResponse.json(
      { error: "Invalid email or password. Please check your credentials and try again." },
      { status: 401 }
    );
  }

  logger.info("auth: signin succeeded", { metadata: { userId: result.data.user?.id, email } });
  return NextResponse.json({
    user: result.data.user,
    role: result.data.user?.user_metadata?.role ?? null,
    message: "Session established."
  });
}
