import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { AI_ERP_HTTP_ROUTES } from "@afenda/ai/client";

const { handleAiExtractDocumentPost } = vi.hoisted(() => ({
  handleAiExtractDocumentPost: vi.fn(),
}));

vi.mock("@afenda/feature-system-admin/server", () => ({
  AI_EXTRACT_MAX_DURATION: 30,
  handleAiExtractDocumentPost,
}));

import { POST } from "@/app/api/internal/v1/ai/commands/extract-document/route";
import { handleAiExtractDocumentPost as extractHandler } from "@afenda/feature-system-admin/server";

describe("extract-document route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("re-exports the feature handler (thin transport)", () => {
    expect(POST).toBe(extractHandler);
  });

  it("dispatches POST to the feature handler", async () => {
    vi.mocked(handleAiExtractDocumentPost).mockResolvedValue(
      NextResponse.json({ error: "AI unavailable" }, { status: 503 }),
    );

    const request = new Request(
      `http://localhost${AI_ERP_HTTP_ROUTES.extractDocument}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          moduleId: "finance",
          documentText: "Invoice INV-1001 total MYR 1250.00",
        }),
      },
    );

    const response = await POST(request);

    expect(handleAiExtractDocumentPost).toHaveBeenCalledWith(request);
    expect(response.status).toBe(503);
  });
});
