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
  hasAiGatewayCredentials,
  hasAiGatewayRuntimeCredentials,
  verifyAiGatewayModels,
} from "../../src/ai-gateway.repository.server";

function createTestEnv(
  env: Record<string, string | undefined> = {},
): NodeJS.ProcessEnv {
  return { NODE_ENV: "development", ...env } as NodeJS.ProcessEnv;
}

describe("aiGatewayFeatures", () => {
  it("includes all expected feature identifiers", () => {
    const expected = [
      "erp-assistant",
      "document-extraction",
      "approval-tools",
      "solution-provider",
      "knowledge-retrieval",
      "knowledge-ingest",
    ] as const;
    for (const f of expected) {
      expect(aiGatewayFeatures).toContain(f);
    }
  });
});

describe("getAiModelForFeature", () => {
  it("returns high-confidence model for solution-provider", () => {
    const model = getAiModelForFeature(
      "solution-provider",
      "high",
      createTestEnv(),
    );
    expect(model).toMatch(/claude|gpt/i);
  });

  it("returns fast model for record-search", () => {
    const model = getAiModelForFeature(
      "record-search",
      "low",
      createTestEnv(),
    );
    expect(model).toMatch(/gpt|claude/i);
  });

  it("respects AFENDA_AI_MODEL override", () => {
    const model = getAiModelForFeature(
      "erp-assistant",
      "medium",
      createTestEnv({
        AFENDA_AI_MODEL: "openai/custom-model",
      }),
    );
    expect(model).toBe("openai/custom-model");
  });

  it("ignores blank optional env overrides", () => {
    const model = getAiModelForFeature(
      "record-search",
      "low",
      createTestEnv({
        AFENDA_AI_FAST_MODEL: "",
        RERANK_MODEL: "",
      }),
    );

    expect(model).toMatch(/gpt|claude/i);
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

  it("sets provider restriction, fallback models, and automatic caching when requested", () => {
    const opts = createGatewayOptions({
      organizationId: "org_x",
      userId: "user_x",
      feature: "solution-provider",
      providerOnly: ["anthropic"],
      fallbackModels: ["openai/gpt-5.5"],
      automaticCaching: true,
      zeroDataRetention: true,
    });

    expect(opts.gateway.only).toEqual(["anthropic"]);
    expect(opts.gateway.models).toEqual(["openai/gpt-5.5"]);
    expect(opts.gateway.caching).toBe("auto");
    expect(opts.gateway.zeroDataRetention).toBe(true);
  });
});

describe("AI Gateway runtime credentials", () => {
  it("accepts API key or OIDC credentials", () => {
    expect(
      hasAiGatewayRuntimeCredentials(
        createTestEnv({ AI_GATEWAY_API_KEY: "gateway-key" }),
      ),
    ).toBe(true);
    expect(
      hasAiGatewayRuntimeCredentials(
        createTestEnv({ VERCEL_OIDC_TOKEN: "oidc-token" }),
      ),
    ).toBe(true);
  });

  it("does not treat Vercel management tokens as runtime credentials", () => {
    expect(
      hasAiGatewayRuntimeCredentials(
        createTestEnv({ VERCEL_API_TOKEN: "token" }),
      ),
    ).toBe(false);
    expect(hasAiGatewayCredentials(createTestEnv({ VERCEL_TOKEN: "token" }))).toBe(
      false,
    );
  });
});

describe("verifyAiGatewayModels", () => {
  function createModelsFetch(modelIds: readonly string[]) {
    return vi.fn(async () =>
      Promise.resolve(
        new Response(JSON.stringify({ data: modelIds.map((id) => ({ id })) }), {
          status: 200,
        }),
      ),
    ) as unknown as typeof fetch;
  }

  it("checks default models, env overrides, and fallback models", async () => {
    const result = await verifyAiGatewayModels({
      env: createTestEnv({
        AFENDA_AI_MODEL: "openai/custom-model",
        RERANK_MODEL: "cohere/rerank-v3.5",
      }),
      fallbackModels: ["google/gemini-3.1-pro-preview"],
      fetch: createModelsFetch([
        "openai/gpt-5.5",
        "anthropic/claude-opus-4.7",
        "openai/custom-model",
        "cohere/rerank-v3.5",
        "google/gemini-3.1-pro-preview",
      ]),
    });

    expect(result.available).toBe(true);
    expect(result.checkedModelIds).toContain("openai/custom-model");
    expect(result.checkedModelIds).toContain("cohere/rerank-v3.5");
    expect(result.checkedModelIds).toContain("google/gemini-3.1-pro-preview");
    expect(result.missingModelIds).toEqual([]);
  });

  it("reports invalid env overrides without mutating state", async () => {
    const result = await verifyAiGatewayModels({
      env: createTestEnv({
        AFENDA_AI_HIGH_CONFIDENCE_MODEL: "anthropic/missing-model",
      }),
      fetch: createModelsFetch(["openai/gpt-5.5", "anthropic/claude-opus-4.7"]),
    });

    expect(result.available).toBe(false);
    expect(result.missingModelIds).toEqual(["anthropic/missing-model"]);
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
    const env = getAiGatewayEnvironment(createTestEnv());
    expect(env).toBe("development");
  });

  it("returns production for VERCEL_ENV=production", () => {
    const env = getAiGatewayEnvironment(
      createTestEnv({ VERCEL_ENV: "production" }),
    );
    expect(env).toBe("production");
  });
});
