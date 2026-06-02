import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LYNX_ERP_HTTP_ROUTES } from "@afenda/feature-lynx";

const { handleLynxRecordRunFeedbackPost } = vi.hoisted(() => ({
  handleLynxRecordRunFeedbackPost: vi.fn(),
}));

vi.mock("@afenda/feature-lynx/server", () => ({
  handleLynxRecordRunFeedbackPost,
}));

import { POST } from "@/app/api/internal/v1/lynx/commands/record-run-feedback/route";
import { handleLynxRecordRunFeedbackPost as feedbackHandler } from "@afenda/feature-lynx/server";

describe("Lynx record-run-feedback route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("re-exports the feature handler (thin transport)", () => {
    expect(POST).toBe(feedbackHandler);
  });

  it("dispatches POST to the feature handler", async () => {
    vi.mocked(handleLynxRecordRunFeedbackPost).mockResolvedValue(
      NextResponse.json({ feedbackId: "lynxfb_1" }),
    );

    const request = new Request(
      `http://localhost${LYNX_ERP_HTTP_ROUTES.runFeedback}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          runId: "lynxrun_1",
          rating: "helpful",
          category: "accuracy",
          comment: "Grounded in evidence.",
        }),
      },
    );

    const response = await POST(request);

    expect(handleLynxRecordRunFeedbackPost).toHaveBeenCalledWith(request);
    expect(response.status).toBe(200);
  });
});
