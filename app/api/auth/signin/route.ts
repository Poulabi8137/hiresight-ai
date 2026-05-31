import { NextResponse } from "next/server";
import { authSchema } from "@/lib/validation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
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

    const isEmailNotConfirmed =
      errMsg.toLowerCase().includes("invalid login credentials") ||
      errMsg.toLowerCase().includes("email not confirmed");

    return NextResponse.json(
      {
        error: isEmailNotConfirmed
          ? "This account requires email confirmation. Please check your inbox for a confirmation link."
          : errMsg
      },
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
