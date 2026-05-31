import { NextRequest, NextResponse } from "next/server";
import { getAuthState } from "@/lib/auth";
import { listActivity } from "@/lib/db";
import { parsePagination, paginate } from "@/lib/pagination";

export async function GET(request: NextRequest) {
  const auth = await getAuthState();
  if (!auth) {
    return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const { page, limit } = parsePagination({
    page: Number(searchParams.get("page")) || undefined,
    limit: Number(searchParams.get("limit")) || undefined
  });

  const activity = await listActivity(auth.userId, page, limit);
  return NextResponse.json(paginate(activity, activity.length, page, limit));
}
