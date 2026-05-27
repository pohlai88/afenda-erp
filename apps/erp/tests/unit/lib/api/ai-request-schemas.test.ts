import { describe, expect, it } from "vitest";
import {
  chatRequestSchema,
  solutionProviderRequestSchema,
} from "@/lib/api/ai-request-schemas";

describe("ai request schemas", () => {
  it("accepts valid chat requests", () => {
    const parsed = chatRequestSchema.parse({
      messages: [{ role: "user", content: "Summarize finance queue." }],
    });

    expect(parsed.messages).toHaveLength(1);
  });

  it("rejects empty chat requests", () => {
    expect(chatRequestSchema.safeParse({ messages: [] }).success).toBe(false);
  });

  it("accepts solution provider requests with workflow id", () => {
    const parsed = solutionProviderRequestSchema.parse({
      messages: [{ role: "user", content: "Run recovery workflow." }],
      workflowId: "audit_readiness",
    });

    expect(parsed.workflowId).toBe("audit_readiness");
  });

  it("rejects invalid solution provider workflow ids", () => {
    expect(
      solutionProviderRequestSchema.safeParse({
        messages: [{ role: "user", content: "Run recovery workflow." }],
        workflowId: "unknown_workflow",
      }).success,
    ).toBe(false);
  });
});
