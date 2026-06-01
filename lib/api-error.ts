import { NextResponse } from "next/server";
import type { ZodSchema } from "zod";
import { logger } from "@/lib/logger";

export function apiError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function apiBadRequest(issues: Record<string, unknown>) {
  return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
}

export function validate<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(result.error.flatten());
  }
  return result.data;
}

export class ValidationError extends Error {
  issues: Record<string, unknown>;
  constructor(issues: Record<string, unknown>) {
    super("Validation error");
    this.issues = issues;
  }
}

export function handleError(error: unknown): NextResponse {
  if (error instanceof ValidationError) {
    return apiBadRequest(error.issues);
  }
  const message = error instanceof Error ? error.message : "Internal server error";
  logger.error("Unhandled error returned as 500", { metadata: { error: message } });
  return apiError("An unexpected error occurred. Please try again later.", 500);
}
