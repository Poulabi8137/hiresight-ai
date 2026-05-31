import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextResponse } from "next/server";
import { getAuthState } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { saveParsedResume } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = await getAuthState();
  if (!auth || auth.role !== "candidate") {
    return NextResponse.json({ error: "Candidate authentication is required." }, { status: 401 });
  }

  const body = await request.json();
  const { bucket, path } = body;
  if (!bucket || !path) {
    return NextResponse.json({ error: "bucket and path are required." }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured." }, { status: 500 });
  }

  // Download the file from Supabase Storage
  const { data: fileData, error: downloadError } = await supabase.storage
    .from(bucket)
    .download(path);

  if (downloadError || !fileData) {
    return NextResponse.json({ error: downloadError?.message ?? "Failed to download file." }, { status: 500 });
  }

  // Extract text using Gemini
  const buffer = Buffer.from(await fileData.arrayBuffer());
  const base64 = buffer.toString("base64");
  const mimeType = fileData.type || "application/pdf";

  let extractedText = "";
  let extractedSkills: string[] = [];
  let experience = "";
  let education = "";

  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    try {
      const result = await generateText({
        model: google("gemini-1.5-flash") as never,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Extract and return ONLY valid JSON (no markdown, no backticks) with these fields from this resume:
{
  "rawText": "full text content of the resume",
  "extractedSkills": ["skill1", "skill2", ...],
  "experience": "summary of work experience",
  "education": "summary of education"
}`
              },
              {
                type: "file",
                data: base64,
                mimeType
              }
            ]
          }
        ]
      });

      const text = result.text;
      const jsonStart = text.indexOf("{");
      const jsonEnd = text.lastIndexOf("}");
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
        extractedText = parsed.rawText ?? "";
        extractedSkills = parsed.extractedSkills ?? [];
        experience = parsed.experience ?? "";
        education = parsed.education ?? "";
      }
    } catch {
      // AI extraction failed; return what we have
    }
  }

  // Fallback: basic keyword extraction
  if (!extractedText) {
    extractedText = `Resume content could not be parsed via AI. File: ${path}`;
  }
  if (extractedSkills.length === 0) {
    const skillKeywords = [
      "javascript", "typescript", "python", "react", "node", "next.js",
      "sql", "aws", "docker", "kubernetes", "git", "agile",
      "machine learning", "data science", "api", "graphql", "rest",
      "communication", "leadership", "project management"
    ];
    extractedSkills = skillKeywords.filter((s) =>
      extractedText.toLowerCase().includes(s)
    ).slice(0, 8);
  }

  // Persist
  await saveParsedResume({
    candidateId: auth.userId,
    rawText: extractedText.slice(0, 10000),
    extractedSkills,
    experience: experience.slice(0, 500),
    education: education.slice(0, 500)
  });

  return NextResponse.json({
    parsed: true,
    skills: extractedSkills,
    source: process.env.GOOGLE_GENERATIVE_AI_API_KEY ? "gemini" : "keyword-fallback",
    experience,
    education
  });
}
