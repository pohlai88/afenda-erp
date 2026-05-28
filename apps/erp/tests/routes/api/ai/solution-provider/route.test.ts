import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@afenda/ai", () => ({
  assertAiBudget: vi.fn(),
  assertCapabilityAllowed: vi.fn(),
  assertNoSensitiveCredentialContent: vi.fn(),
  createGatewayOptions: vi.fn(),
  createSolutionProviderAgent: vi.fn(),
  estimateTokenCount: vi.fn(() => 120),
  getAiGatewayEnvironment: vi.fn(() => "development"),
  getAiModelForFeature: vi.fn(() => "openai/gpt-5.4"),
  getAiRouteError: vi.fn(() => null),
  getUsageMetrics: vi.fn(),
  hasAiGatewayCredentials: vi.fn(),
  isAiBudgetError: vi.fn(() => false),
  isAiPermissionError: vi.fn(() => false),
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
    getErpModuleById: vi.fn(() => ({
      label: "Finance",
      requiredCapability: "finance.view",
      ownerTeam: "Finance",
    })),
    getModuleWorkspace: vi.fn(async () => ({
      dataMode: "metadata",
      records: [],
      workItems: [],
      documents: [],
    })),
    getModuleWorkspaceStats: vi.fn(() => ({
      recordCount: 0,
      workItemCount: 0,
      highPriorityWorkItemCount: 0,
      documentCount: 0,
      savedViewCount: 0,
    })),
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

vi.mock("@/lib/api/solution-provider-tool-bindings", () => ({
  createErpSolutionProviderTools: vi.fn(() => ({})),
}));

import { hasAiGatewayCredentials } from "@afenda/ai";
import { getApiAuthContext } from "@afenda/auth/server";
import { POST } from "@/app/api/ai/solution-provider/route";

describe("solution provider route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 503 when AI gateway credentials are missing", async () => {
    vi.mocked(hasAiGatewayCredentials).mockReturnValue(false);

    const response = await POST(
      new Request("http://localhost/api/ai/solution-provider", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Diagnose negative P&L." }],
        }),
      }),
    );

    expect(response.status).toBe(503);
    expect(response.headers.get("Deprecation")).toBeTruthy();
    expect(response.headers.get("Link")).toContain("/api/lynx/operator");
  });

  it("returns auth response when session is unavailable", async () => {
    vi.mocked(hasAiGatewayCredentials).mockReturnValue(true);
    vi.mocked(getApiAuthContext).mockResolvedValue(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    );

    const response = await POST(
      new Request("http://localhost/api/ai/solution-provider", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Diagnose negative P&L." }],
        }),
      }),
    );

    expect(response.status).toBe(401);
  });

  it("returns 400 for invalid workflow ids", async () => {
    vi.mocked(hasAiGatewayCredentials).mockReturnValue(true);
    vi.mocked(getApiAuthContext).mockResolvedValue({
      session: {
        id: "user_1",
        source: "dev",
        name: "Operator",
        email: "operator@afenda.test",
        activeOrganizationId: "org_1",
        organizations: [
          {
            id: "org_1",
            name: "Afenda Operations",
            slug: "afenda-ops",
            role: "owner",
            capabilities: ["dashboard.view", "finance.view"],
          },
        ],
      },
      organization: {
        id: "org_1",
        name: "Afenda Operations",
        slug: "afenda-ops",
        role: "owner",
        capabilities: ["dashboard.view", "finance.view"],
      },
    });

    const response = await POST(
      new Request("http://localhost/api/ai/solution-provider", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Diagnose negative P&L." }],
          workflowId: "invalid_workflow",
        }),
      }),
    );

    expect(response.status).toBe(400);
  });
});
