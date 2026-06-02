import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { AI_ERP_HTTP_ROUTES } from "@afenda/ai";

const { handleAiErpAssistantPost } = vi.hoisted(() => ({
  handleAiErpAssistantPost: vi.fn(),
}));

vi.mock("@afenda/feature-system-admin/server", () => ({
  AI_ERP_ASSISTANT_MAX_DURATION: 30,
  handleAiErpAssistantPost,
}));

import { POST } from "@/app/api/internal/v1/ai/queries/erp-assistant/route";
import { handleAiErpAssistantPost as assistantHandler } from "@afenda/feature-system-admin/server";

describe("erp-assistant route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("re-exports the feature handler (thin transport)", () => {
    expect(POST).toBe(assistantHandler);
  });

  it("dispatches POST to the feature handler", async () => {
    vi.mocked(handleAiErpAssistantPost).mockResolvedValue(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    );

    const request = new Request(
      `http://localhost${AI_ERP_HTTP_ROUTES.erpAssistant}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Summarize finance queue." }],
        }),
      },
    );

    const response = await POST(request);

    expect(handleAiErpAssistantPost).toHaveBeenCalledWith(request);
    expect(response.status).toBe(401);
  });
});
