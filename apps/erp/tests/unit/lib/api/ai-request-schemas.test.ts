import { describe, expect, it } from "vitest";
import {
  chatRequestSchema,
  lynxOperatorRequestSchema,
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

  it("accepts Lynx operator workflow session ids", () => {
    const parsed = lynxOperatorRequestSchema.parse({
      messages: [{ role: "user", content: "Resume workflow." }],
      workflowSessionId: "lynxwf_123",
    });

    expect(parsed.workflowSessionId).toBe("lynxwf_123");
  });

  it("rejects client-supplied organization ids for Lynx operator requests", () => {
    expect(
      lynxOperatorRequestSchema.safeParse({
        messages: [{ role: "user", content: "Resume workflow." }],
        organizationId: "org_client_supplied",
      }).success,
    ).toBe(false);
  });
});
