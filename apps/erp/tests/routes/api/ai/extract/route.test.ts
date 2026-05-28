import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@afenda/ai/server", () => ({
  aiGatewayDefaultProviderOrder: ["openai", "anthropic"],
  assertAiBudget: vi.fn(),
  assertCapabilityAllowed: vi.fn(),
  assertNoSensitiveCredentialContent: vi.fn(),
  createGatewayOptions: vi.fn(),
  documentExtractionRequestSchema: {
    parse: vi.fn((value: unknown) => value),
  },
  documentExtractionSchema: {
    parse: vi.fn((value: unknown) => value),
  },
  estimateTokenCount: vi.fn(() => 90),
  getAiGatewayEnvironment: vi.fn(() => "development"),
  getAiModelForFeature: vi.fn(() => "openai/gpt-5.4"),
  getAiRouteError: vi.fn(() => null),
  getDocumentExtractionPrompt: vi.fn(() => "Extract invoice fields."),
  getUsageMetrics: vi.fn(),
  hasAiGatewayRuntimeCredentials: vi.fn(),
  isAiBudgetError: vi.fn(() => false),
  isAiPermissionError: vi.fn(() => false),
  isAiSensitiveContentError: vi.fn(() => false),
}));

vi.mock("@afenda/auth/server", () => ({
  getApiAuthContext: vi.fn(),
}));

vi.mock("@afenda/db", () => ({
  createAiUsageEvent: vi.fn(),
  registerAiDocumentExtraction: vi.fn(),
}));

vi.mock("@afenda/kernel", () => ({
  getErpModuleById: vi.fn(),
}));

vi.mock("@afenda/observability", () => ({
  getRequestId: vi.fn(() => "req_test"),
  logServerEvent: vi.fn(),
}));

vi.mock("ai", () => ({
  generateText: vi.fn(),
  Output: {
    object: vi.fn(() => ({})),
  },
}));

vi.mock("@/lib/ai-tracing", () => ({
  withAiSpan: vi.fn((_name, _attrs, fn: () => unknown) => fn()),
}));

import { hasAiGatewayRuntimeCredentials } from "@afenda/ai/server";
import { getApiAuthContext, type ApiAuthContext } from "@afenda/auth/server";
import { getErpModuleById } from "@afenda/kernel";
import { POST } from "@/app/api/ai/extract/route";

const authContext: ApiAuthContext = {
  session: {
    id: "user_test",
    source: "neon",
    name: "Test User",
    email: "test@example.com",
    activeOrganizationId: "org_test",
    organizations: [],
  },
  organization: {
    id: "org_test",
    membershipId: "member_test",
    name: "Test Org",
    slug: "test-org",
    locale: "en-MY",
    role: "owner",
    capabilities: ["finance.view"],
  },
};

describe("extract route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getApiAuthContext).mockResolvedValue(authContext);
  });

  it("returns 503 when AI gateway credentials are missing", async () => {
    vi.mocked(hasAiGatewayRuntimeCredentials).mockReturnValue(false);

    const response = await POST(
      new Request("http://localhost/api/ai/extract", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          moduleId: "finance",
          documentText: "Invoice INV-1001 total MYR 1250.00",
        }),
      }),
    );

    expect(response.status).toBe(503);
  });

  it("returns 400 for unknown modules", async () => {
    vi.mocked(hasAiGatewayRuntimeCredentials).mockReturnValue(true);
    vi.mocked(getErpModuleById).mockReturnValue(null);

    const response = await POST(
      new Request("http://localhost/api/ai/extract", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          moduleId: "finance",
          documentText: "Invoice INV-1001 total MYR 1250.00",
        }),
      }),
    );

    expect(response.status).toBe(400);
  });
});
