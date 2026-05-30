import { NextResponse } from "next/server";
import { authSchema } from "@/lib/validation";
import { createServerSupabaseClient, createServiceSupabaseClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = authSchema.safeParse(payload);

  if (!parsed.success) {
    logger.warn("auth: signup invalid payload", { metadata: { issues: parsed.error.flatten() } });
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.flatten() }, { status: 400 });
  }

  const { email, password, role } = parsed.data;
  const fullName = payload.fullName as string | undefined;

  const supabase = createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  logger.info("auth: signup attempt", { metadata: { email, role } });

  const serviceClient = createServiceSupabaseClient();
  if (serviceClient) {
    try {
      const { data: existingUser } = await serviceClient
        .from("users")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (existingUser) {
        return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
      }

      const { data: newUser, error: createError } = await serviceClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role, full_name: fullName ?? null }
      });

      if (createError) {
        logger.error("auth: service-role createUser failed", { metadata: { error: createError.message } });
      } else if (newUser?.user) {
        logger.info("auth: user created via service role (auto-confirmed)", { metadata: { userId: newUser.user.id, email, role } });

        const { error: insertError } = await serviceClient
          .from("users")
          .upsert({ id: newUser.user.id, email, role, full_name: fullName ?? null }, { onConflict: "id" });

        if (insertError) {
          logger.warn("auth: failed to insert public users row", { metadata: { error: insertError.message } });
        }

        return NextResponse.json({
          user: { id: newUser.user.id, email },
          role,
          message: "Account created and ready. You can now sign in."
        });
      }
    } catch (e) {
      logger.error("auth: service-role flow exception", { metadata: { error: String(e) } });
    }
  } else {
    logger.warn("auth: service role client unavailable (SUPABASE_SERVICE_ROLE_KEY not set)");
  }

  logger.info("auth: falling back to regular signUp", { metadata: { email, role } });

  const result = await supabase.auth.signUp({
    email,
    password,
    options: { data: { role, full_name: fullName ?? undefined } }
  });

  if (result.error) {
    logger.error("auth: signUp failed", { metadata: { error: result.error.message, email, role } });
    return NextResponse.json({ error: result.error.message }, { status: 401 });
  }

  const identityCount = result.data.user?.identities?.length ?? 0;
  if (identityCount === 0) {
    logger.info("auth: signUp succeeded but email confirmation required", { metadata: { email } });
    return NextResponse.json({
      role,
      user: { id: result.data.user?.id, email },
      requiresEmailConfirmation: true,
      message: "Account created. Check your email to confirm before signing in."
    });
  }

  logger.info("auth: signUp succeeded", { metadata: { userId: result.data.user?.id, email } });
  return NextResponse.json({
    user: result.data.user,
    role,
    message: "Account created successfully."
  });
}
