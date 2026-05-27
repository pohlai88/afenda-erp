import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@afenda/ai", () => ({
  assertAiBudget: vi.fn(),
  assertCapabilityAllowed: vi.fn(),
  assertNoSensitiveCredentialContent: vi.fn(),
  createErpAssistantAgent: vi.fn(),
  createErpAssistantTools: vi.fn(),
  createGatewayOptions: vi.fn(),
  estimateTokenCount: vi.fn(() => 80),
  getAiGatewayEnvironment: vi.fn(() => "development"),
  getAiModelForFeature: vi.fn(() => "openai/gpt-5.4"),
  getAiRouteError: vi.fn(() => null),
  getUsageMetrics: vi.fn(),
  hasAiGatewayCredentials: vi.fn(),
  isAiBudgetError: vi.fn(() => false),
  isAiSensitiveContentError: vi.fn(() => false),
}));

vi.mock("@afenda/auth/server", () => ({
  getApiAuthContext: vi.fn(),
}));

vi.mock("@afenda/db", () => ({
  createAiUsageEvent: vi.fn(),
  registerAiApprovalProposal: vi.fn(),
}));

vi.mock("@afenda/domain", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@afenda/domain")>();

  return {
    ...actual,
    getErpModuleById: vi.fn(),
    getModuleWorkspace: vi.fn(async () => ({
      dataMode: "metadata",
      records: [],
      workItems: [],
      documents: [],
    })),
    getModuleWorkspaceStats: vi.fn(),
    resolveWorkspaceDataMode: vi.fn(() => "metadata"),
  };
});

vi.mock("@afenda/observability", () => ({
  getRequestId: vi.fn(() => "req_test"),
  logServerEvent: vi.fn(),
}));

vi.mock("ai", () => ({
  createAgentUIStreamResponse: vi.fn(() =>
    NextResponse.json({ ok: true, stream: true }),
  ),
}));

import { hasAiGatewayCredentials } from "@afenda/ai";
import { getApiAuthContext } from "@afenda/auth/server";
import { POST } from "@/app/api/ai/chat/route";

describe("chat route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 503 when AI gateway credentials are missing", async () => {
    vi.mocked(hasAiGatewayCredentials).mockReturnValue(false);

    const response = await POST(
      new Request("http://localhost/api/ai/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Summarize finance queue." }],
        }),
      }),
    );

    expect(response.status).toBe(503);
  });

  it("returns auth response when session is unavailable", async () => {
    vi.mocked(hasAiGatewayCredentials).mockReturnValue(true);
    vi.mocked(getApiAuthContext).mockResolvedValue(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    );

    const response = await POST(
      new Request("http://localhost/api/ai/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Summarize finance queue." }],
        }),
      }),
    );

    expect(response.status).toBe(401);
  });
});
