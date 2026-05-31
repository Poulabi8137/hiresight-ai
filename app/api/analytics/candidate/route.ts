import { NextResponse } from "next/server";
import { getAuthState } from "@/lib/auth";
import { getCandidateAnalytics } from "@/lib/db";

export async function GET() {
  const auth = await getAuthState();
  if (!auth || auth.role !== "candidate") {
    return NextResponse.json({ error: "Candidate authentication is required." }, { status: 401 });
  }

  const analytics = await getCandidateAnalytics(auth.userId);
  return NextResponse.json({ analytics });
}
