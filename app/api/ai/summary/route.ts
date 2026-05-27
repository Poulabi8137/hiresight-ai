import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextResponse } from "next/server";
import { candidates } from "@/lib/demo-data";
import { extractKeywords, summarizeCandidate } from "@/lib/ai/scoring";
import { getAuthState } from "@/lib/auth";

export async function POST(request: Request) {
  const auth = await getAuthState();
  if (!auth) {
    return NextResponse.json({ error: "Authentication is required for AI summaries." }, { status: 401 });
  }

  const body = await request.json();
  const candidate = candidates.find((item) => item.id === body.candidateId) ?? candidates[0];
  const transcript = String(body.transcript ?? candidate.summary);

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return NextResponse.json({
      summary: summarizeCandidate(candidate),
      keywords: extractKeywords(transcript),
      source: "deterministic-fallback"
    });
  }

  const result = await generateText({
    model: google("gemini-1.5-flash") as never,
    prompt: `Write a concise recruiter-facing summary for this candidate. Candidate: ${JSON.stringify(candidate)} Transcript: ${transcript}`
  });

  return NextResponse.json({
    summary: result.text,
    keywords: extractKeywords(`${transcript} ${result.text}`),
    source: "gemini"
  });
}
