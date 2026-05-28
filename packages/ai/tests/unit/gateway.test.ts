import { afterEach, describe, expect, it, vi } from "vitest";

const getSpendReportMock = vi.fn();

vi.mock("ai", async (importOriginal) => {
  const actual = await importOriginal<typeof import("ai")>();
  return {
    ...actual,
    createGateway: vi.fn(() => ({
      getSpendReport: getSpendReportMock,
    })),
  };
});

import {
  aiGatewayFeatures,
  createGatewayOptions,
  getAiGatewayEnvironment,
  getAiModelForFeature,
  getGatewaySpendReport,
} from "../../src/gateway";

describe("aiGatewayFeatures", () => {
  it("includes all expected feature identifiers", () => {
    const expected = [
      "erp-assistant",
      "document-extraction",
      "approval-tools",
      "solution-provider",
    ] as const;
    for (const f of expected) {
      expect(aiGatewayFeatures).toContain(f);
    }
  });
});

describe("getAiModelForFeature", () => {
  it("returns high-confidence model for solution-provider", () => {
    const model = getAiModelForFeature("solution-provider", "high", {});
    expect(model).toMatch(/claude|gpt/i);
  });

  it("returns fast model for record-search", () => {
    const model = getAiModelForFeature("record-search", "low", {});
    expect(model).toMatch(/gpt|claude/i);
  });

  it("respects AFENDA_AI_MODEL override", () => {
    const model = getAiModelForFeature("erp-assistant", "medium", {
      AFENDA_AI_MODEL: "openai/custom-model",
    });
    expect(model).toBe("openai/custom-model");
  });
});

describe("createGatewayOptions", () => {
  it("produces correctly shaped provider options", () => {
    const opts = createGatewayOptions({
      organizationId: "org_123",
      userId: "user_123",
      feature: "erp-assistant",
      moduleId: "finance",
      workflowSessionId: "lynxwf_123",
      qualityGate: "claim-validation",
      riskLevel: "medium",
      environment: "test",
    });
    expect(opts.gateway).toBeDefined();
    const tags = opts.gateway.tags as string[];
    expect(tags.some((t) => t.startsWith("feature:"))).toBe(true);
    expect(tags.some((t) => t.startsWith("organization:"))).toBe(true);
    expect(tags.some((t) => t.startsWith("module:"))).toBe(true);
    expect(tags).toContain("workflowSession:lynxwf_123");
    expect(tags).toContain("qualityGate:claim-validation");
    expect(tags.some((t) => t.startsWith("risk:"))).toBe(true);
    expect(opts.gateway.disallowPromptTraining).toBe(true);
    // Legacy tag must NOT appear
    expect(tags).not.toContain("app:afenda-erp");
  });

  it("sets zeroDataRetention when requested", () => {
    const opts = createGatewayOptions({
      organizationId: "org_x",
      userId: "user_x",
      feature: "document-extraction",
      zeroDataRetention: true,
    });
    expect(opts.gateway.zeroDataRetention).toBe(true);
  });

  it("sets provider order when requested", () => {
    const opts = createGatewayOptions({
      organizationId: "org_x",
      userId: "user_x",
      feature: "solution-provider",
      providerOrder: ["anthropic", "openai"],
    });
    expect(opts.gateway.order).toEqual(["anthropic", "openai"]);
  });
});

describe("getGatewaySpendReport", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns unavailable when gateway credentials are absent", async () => {
    const report = await getGatewaySpendReport({
      organizationId: "org_test",
    });

    expect(report).toEqual({ available: false, entries: [] });
  });

  it("maps gateway report rows when the billing API succeeds", async () => {
    vi.stubEnv("AI_GATEWAY_API_KEY", "test-gateway-key");
    getSpendReportMock.mockResolvedValueOnce({
      results: [
        {
          tag: "feature:erp-assistant",
          totalCost: 1.25,
          requestCount: 4,
        },
      ],
    });

    const report = await getGatewaySpendReport({
      organizationId: "org_test",
    });

    expect(getSpendReportMock).toHaveBeenCalledOnce();
    expect(report.available).toBe(true);
    expect(report.entries).toEqual([
      {
        tag: "feature:erp-assistant",
        costUsd: 1.25,
        requestCount: 4,
      },
    ]);
  });
});

describe("getAiGatewayEnvironment", () => {
  it("falls back to development when VERCEL_ENV is absent", () => {
    const env = getAiGatewayEnvironment({});
    expect(env).toBe("development");
  });

  it("returns production for VERCEL_ENV=production", () => {
    const env = getAiGatewayEnvironment({ VERCEL_ENV: "production" });
    expect(env).toBe("production");
  });
});
