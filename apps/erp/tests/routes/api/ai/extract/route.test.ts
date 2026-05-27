import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@afenda/ai", () => ({
  assertAiBudget: vi.fn(),
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
  hasAiGatewayCredentials: vi.fn(),
  isAiBudgetError: vi.fn(() => false),
  isAiSensitiveContentError: vi.fn(() => false),
}));

vi.mock("@afenda/auth/server", () => ({
  requireCapability: vi.fn(),
}));

vi.mock("@afenda/db", () => ({
  createAiUsageEvent: vi.fn(),
  registerAiDocumentExtraction: vi.fn(),
}));

vi.mock("@afenda/domain", () => ({
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

import { hasAiGatewayCredentials } from "@afenda/ai";
import { getErpModuleById } from "@afenda/domain";
import { POST } from "@/app/api/ai/extract/route";

describe("extract route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 503 when AI gateway credentials are missing", async () => {
    vi.mocked(hasAiGatewayCredentials).mockReturnValue(false);

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
    vi.mocked(hasAiGatewayCredentials).mockReturnValue(true);
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
