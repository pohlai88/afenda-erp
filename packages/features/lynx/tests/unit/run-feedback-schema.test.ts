import { describe, expect, it } from "vitest";
import {
  lynxLiveRunFeedbackRequestSchema,
  lynxRunContextMetadataSchema,
} from "../../src/schemas/lynx.run-feedback.schema";

describe("Lynx run feedback schemas", () => {
  it("accepts run context metadata for streamed Lynx messages", () => {
    expect(
      lynxRunContextMetadataSchema.parse({
        lynxRun: {
          runId: "lynxrun_1",
          route: "/api/internal/v1/lynx/queries/operator",
          workflowId: "negative_pnl_recovery",
          workflowSessionId: "lynxwf_1",
        },
      }),
    ).toEqual({
      lynxRun: {
        runId: "lynxrun_1",
        route: "/api/internal/v1/lynx/queries/operator",
        workflowId: "negative_pnl_recovery",
        workflowSessionId: "lynxwf_1",
      },
    });
  });

  it("normalizes live run feedback requests", () => {
    expect(
      lynxLiveRunFeedbackRequestSchema.parse({
        runId: " lynxrun_1 ",
        messageId: " msg_1 ",
        rating: "negative",
        category: "unsupported",
        note: " needs review ",
      }),
    ).toEqual({
      runId: "lynxrun_1",
      messageId: "msg_1",
      rating: "negative",
      category: "unsupported",
      note: "needs review",
    });
  });

  it("rejects unsupported feedback categories", () => {
    expect(
      lynxLiveRunFeedbackRequestSchema.safeParse({
        runId: "lynxrun_1",
        rating: "positive",
        category: "unclear",
      }).success,
    ).toBe(false);
  });
});
