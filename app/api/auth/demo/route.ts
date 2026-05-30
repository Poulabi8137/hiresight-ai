import { NextResponse } from "next/server";
import { authSchema } from "@/lib/validation";
import { setDemoSessionCookie } from "@/lib/auth";
import { createServerSupabaseClient, createServiceSupabaseClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = authSchema.safeParse(payload);

  if (!parsed.success) {
    logger.warn("auth: invalid payload", { metadata: { issues: parsed.error.flatten() } });
    return NextResponse.json({ error: "Invalid auth payload", issues: parsed.error.flatten() }, { status: 400 });
  }

  const { email, password, role } = parsed.data;
  const mode = payload.mode as "signin" | "signup";
  const fullName = payload.fullName as string | undefined;

  const supabase = createServerSupabaseClient();

  if (!supabase) {
    logger.info("auth: no supabase client, using demo session", { metadata: { email, role, mode } });
    setDemoSessionCookie(role);
    return NextResponse.json({
      role,
      message: `Demo ${mode === "signin" ? "login" : "signup"} ready for ${email}. Configure Supabase env vars for live auth.`
    });
  }

  if (mode === "signup") {
    logger.info("auth: signup attempt", { metadata: { email, role } });

    const serviceClient = createServiceSupabaseClient();
    if (serviceClient) {
      try {
        const { data: existingUser } = await serviceClient
          .from("users")
          .select("id")
          .eq("email", email)
          .maybeSingle();

        if (!existingUser) {
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

      if (process.env.HIRESIGHT_DEMO_AUTH === "true") {
        setDemoSessionCookie(role);
        return NextResponse.json({
          role,
          message: `Demo signup active for ${email}. Supabase returned "${result.error.message}", continuing in demo mode.`
        });
      }

      return NextResponse.json({ error: result.error.message }, { status: 401 });
    }

    const identityCount = result.data.user?.identities?.length ?? 0;
    if (identityCount === 0) {
      logger.info("auth: signUp succeeded but email confirmation required", { metadata: { email } });
      return NextResponse.json({
        role,
        user: { id: result.data.user?.id, email },
        requiresEmailConfirmation: true,
        message: "Account created. Check your email to confirm before signing in. (Or set HIRESIGHT_DEMO_AUTH=true for instant demo access.)"
      });
    }

    logger.info("auth: signUp succeeded", { metadata: { userId: result.data.user?.id, email } });
    return NextResponse.json({
      user: result.data.user,
      role,
      message: "Account created successfully."
    });
  }

  // ── Signin flow ──
  logger.info("auth: signin attempt", { metadata: { email, role } });

  const result = await supabase.auth.signInWithPassword({ email, password });

  if (result.error) {
    const errMsg = result.error.message;
    logger.error("auth: signInWithPassword failed", { metadata: { error: errMsg, email, role } });

    const isEmailNotConfirmed =
      errMsg.toLowerCase().includes("invalid login credentials") ||
      errMsg.toLowerCase().includes("email not confirmed");

    if (process.env.HIRESIGHT_DEMO_AUTH === "true") {
      setDemoSessionCookie(role);
      return NextResponse.json({
        role,
        message: isEmailNotConfirmed
          ? `Demo login active for ${email}. (The Supabase account exists but needs email confirmation — continuing in demo mode.)`
          : `Demo login active for ${email}. Supabase returned "${errMsg}", continuing in demo mode.`
      });
    }

    return NextResponse.json(
      {
        error: isEmailNotConfirmed
          ? "This account requires email confirmation. Please check your inbox for a confirmation link, or enable HIRESIGHT_DEMO_AUTH=true in .env.local for instant demo access."
          : errMsg
      },
      { status: 401 }
    );
  }

  logger.info("auth: signin succeeded", { metadata: { userId: result.data.user?.id, email } });
  return NextResponse.json({
    user: result.data.user,
    role,
    message: "Supabase session established."
  });
}
