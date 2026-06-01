import { NextResponse } from "next/server";

const ALLOWED_ORIGINS: string[] = [];

function getAllowedOrigins(): string[] {
  if (ALLOWED_ORIGINS.length > 0) return ALLOWED_ORIGINS;
  const env = process.env.APP_URL ?? process.env.VERCEL_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  if (env) {
    const normalized = env.startsWith("http") ? env : `https://${env}`;
    ALLOWED_ORIGINS.push(normalized.replace(/\/+$/, ""));
  }
  if (process.env.NODE_ENV === "development") {
    ALLOWED_ORIGINS.push("http://localhost:3000");
  }
  return ALLOWED_ORIGINS;
}

export function assertCSRF(request: Request): NextResponse | null {
  if (process.env.NODE_ENV !== "production") return null;

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  const allowed = getAllowedOrigins();
  if (allowed.length === 0) return null;

  if (origin) {
    try {
      const originUrl = new URL(origin);
      if (allowed.some((a) => new URL(a).origin === originUrl.origin)) return null;
    } catch {
      return NextResponse.json({ error: "CSRF validation failed." }, { status: 403 });
    }
  }

  if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (allowed.some((a) => new URL(a).origin === refererUrl.origin)) return null;
    } catch {
      return NextResponse.json({ error: "CSRF validation failed." }, { status: 403 });
    }
  }

  return NextResponse.json({ error: "CSRF validation failed." }, { status: 403 });
}
