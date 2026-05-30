import { NextResponse } from "next/server";
import { getAuthState } from "@/lib/auth";
import { getRecruiterAnalytics } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function GET() {
  const start = performance.now();
  const auth = await getAuthState();
  if (!auth || auth.role !== "recruiter") {
    return NextResponse.json({ error: "Recruiter authentication is required." }, { status: 401 });
  }

  const analytics = await getRecruiterAnalytics(auth.userId);
  const elapsed = performance.now() - start;
  if (elapsed > 200) {
    logger.warn("Slow analytics endpoint", { metadata: { elapsed: `${Math.round(elapsed)}ms` } });
  }
  return NextResponse.json({ analytics, timing: { elapsed: `${Math.round(elapsed)}ms` } });
}
