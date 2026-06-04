import { AiPermissionError } from "@afenda/ai/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@afenda/ai/server", () => ({
  assertCapabilityAllowed: vi.fn(),
  AiPermissionError: class AiPermissionError extends Error {
    readonly code = "AI_PERMISSION_DENIED";
    constructor(readonly capability: string) {
      super(`AI tool requires capability: ${capability}.`);
      this.name = "AiPermissionError";
    }
  },
}));

vi.mock("@afenda/db", () => ({
  getLynxRunDetail: vi.fn(async () => ({
    id: "lynxrun_1",
    organizationId: "org_1",
    userAuthId: "user_1",
    route: "/api/internal/v1/lynx/queries/truth-search",
    workflowId: null,
    workflowSessionId: null,
    model: "openai/gpt-5.4",
    status: "completed",
    promptSummary: "What policy applies?",
    latencyMs: 1200,
    metadata: {},
    startedAt: new Date("2026-01-01T00:00:00.000Z"),
    completedAt: new Date("2026-01-01T00:00:02.000Z"),
    events: [],
    feedback: [],
  })),
  recordLynxRunFeedback: vi.fn(async () => "lynxfb_1"),
}));

vi.mock("@afenda/kernel/execution", () => ({
  writeExecutionAuditEvent: vi.fn(async () => undefined),
}));

const { executeLynxRecordRunFeedbackCommand } = await import(
  "../../src/lyn-record-run-feedback.command.server"
);

describe("executeLynxRecordRunFeedbackCommand", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("records feedback for a tenant-owned Lynx run", async () => {
    const result = await executeLynxRecordRunFeedbackCommand({
      organizationId: "org_1",
      userAuthId: "user_1",
      capabilities: ["system-admin.lynx.read"],
      request: {
        runId: "lynxrun_1",
        messageId: "msg_1",
        rating: "positive",
        category: "accurate",
      },
      requestId: "req_test",
    });

    expect(result).toEqual({ feedbackId: "lynxfb_1" });
  });

  it("returns null when the run does not exist", async () => {
    const { getLynxRunDetail } = await import("@afenda/db");
    vi.mocked(getLynxRunDetail).mockResolvedValueOnce(null);

    const result = await executeLynxRecordRunFeedbackCommand({
      organizationId: "org_1",
      userAuthId: "user_1",
      capabilities: ["system-admin.lynx.read"],
      request: {
        runId: "lynxrun_missing",
        rating: "negative",
        category: "unsupported",
      },
      requestId: "req_test",
    });

    expect(result).toBeNull();
  });

  it("rejects callers without Lynx feedback capability", async () => {
    const { assertCapabilityAllowed } = await import("@afenda/ai/server");
    vi.mocked(assertCapabilityAllowed).mockImplementationOnce(() => {
      throw new AiPermissionError("system-admin.lynx.read");
    });

    await expect(
      executeLynxRecordRunFeedbackCommand({
        organizationId: "org_1",
        userAuthId: "user_1",
        capabilities: [],
        request: {
          runId: "lynxrun_1",
          rating: "positive",
          category: "accurate",
        },
        requestId: "req_test",
      }),
    ).rejects.toBeInstanceOf(AiPermissionError);
  });
});
