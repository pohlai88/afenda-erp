import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LYNX_ERP_HTTP_ROUTES } from "@afenda/feature-lynx";

const { handleLynxOperatorPost } = vi.hoisted(() => ({
  handleLynxOperatorPost: vi.fn(),
}));

vi.mock("@afenda/feature-lynx/server", () => ({
  handleLynxOperatorPost,
}));

import { POST } from "@/app/api/internal/v1/lynx/queries/operator/route";
import { handleLynxOperatorPost as operatorHandler } from "@afenda/feature-lynx/server";

describe("Lynx operator route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("re-exports the feature handler (thin transport)", () => {
    expect(POST).toBe(operatorHandler);
  });

  it("dispatches POST to the feature handler", async () => {
    vi.mocked(handleLynxOperatorPost).mockResolvedValue(
      NextResponse.json({ error: "AI unavailable" }, { status: 503 }),
    );

    const request = new Request(
      `http://localhost${LYNX_ERP_HTTP_ROUTES.operator}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Diagnose negative P&L." }],
        }),
      },
    );

    const response = await POST(request);

    expect(handleLynxOperatorPost).toHaveBeenCalledWith(request);
    expect(response.status).toBe(503);
  });
});
