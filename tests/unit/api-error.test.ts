import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiError, apiBadRequest, validate, handleError, ValidationError } from "@/lib/api-error";
import { z } from "zod";

describe("apiError", () => {
  it("returns a 401 response with message", async () => {
    const res = apiError("Unauthorized", 401);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns a 500 response", async () => {
    const res = apiError("Server error", 500);
    expect(res.status).toBe(500);
  });
});

describe("apiBadRequest", () => {
  it("returns 400 with issues", async () => {
    const issues = { name: ["Required"] };
    const res = apiBadRequest(issues);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.issues).toEqual(issues);
  });
});

describe("validate", () => {
  const schema = z.object({ name: z.string().min(1), age: z.number().positive() });

  it("returns parsed data for valid input", () => {
    const data = validate(schema, { name: "Alice", age: 30 });
    expect(data).toEqual({ name: "Alice", age: 30 });
  });

  it("throws ValidationError for invalid input", () => {
    expect(() => validate(schema, { name: "", age: -1 })).toThrow(ValidationError);
  });

  it("describes field-level errors", () => {
    try {
      validate(schema, { name: "", age: -1 });
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      const ve = e as ValidationError;
      expect(ve.issues).toBeDefined();
    }
  });
});

describe("handleError", () => {
  it("converts ValidationError to 400 response", async () => {
    const ve = new ValidationError({ name: ["Required"] });
    const res = handleError(ve);
    expect(res.status).toBe(400);
  });

  it("converts generic Error to 500 response", async () => {
    const err = new Error("Something broke");
    const res = handleError(err);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Something broke");
  });

  it("converts unknown errors to generic 500", async () => {
    const res = handleError("string error");
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Internal server error");
  });
});
