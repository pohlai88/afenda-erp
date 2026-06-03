import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@afenda/kernel/server", () => ({
  getApiAuthContext: vi.fn(async () => ({
    session: {
      id: "user_1",
    },
    organization: {
      id: "org_1",
      name: "Afenda",
      slug: "afenda",
      role: "owner",
      capabilities: ["system-admin.view", "dashboard.view"],
    },
  })),
}));
vi.mock("@afenda/kernel/execution", () => ({
  writeExecutionAuditEvent: vi.fn(async () => undefined),
}));

const capturedChunks: unknown[] = [];
const capturedMessageMetadata: unknown[] = [];

vi.mock("@afenda/ai/server", () => ({
  aiGatewayDefaultProviderOrder: ["openai", "anthropic"],
  assertCapabilityAllowed: vi.fn(),
  createGatewayOptions: vi.fn(() => ({})),
  getAiModelForFeature: vi.fn(() => "openai/gpt-5.4"),
  hasAiGatewayRuntimeCredentials: vi.fn(() => true),
  resolveLanguageModel: vi.fn(() => "model"),
}));

vi.mock("@afenda/db", () => ({
  completeLynxRun: vi.fn(),
  createAiUsageEvent: vi.fn(),
  createLynxRun: vi.fn(async () => "lynxrun_1"),
  isAiFeatureEnabledForOrganization: vi.fn(async () => true),
  recordLynxRunEvent: vi.fn(),
}));

vi.mock("@afenda/feature-knowledge/server", () => ({
  getKnowledgeOrgSetting: vi.fn(async () => ({
    retrievalHybridEnabled: false,
    retrievalRerankEnabled: false,
    enforceZdr: false,
  })),
  retrieveKnowledgeChunksWithDiagnostics: vi.fn(async () => ({
    rows: [
      {
        id: "chunk_1",
        title: "Policy",
        body: "Operators must review evidence before action.",
        distance: 0.1,
        lexicalScore: 1,
        fusedRank: 1,
      },
    ],
    diagnostics: {
      status: "ok",
      mode: "semantic",
      hybridEnabled: false,
      rerankAttempted: false,
      rerankApplied: false,
    },
  })),
}));

vi.mock("@afenda/feature-lynx", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@afenda/feature-lynx")>();
  return {
    ...actual,
    buildLynxTruthSystemPrompt: vi.fn(() => "system"),
  };
});

vi.mock("@afenda/observability/server", () => ({
  getRequestId: vi.fn(() => "req_test"),
  logServerEvent: vi.fn(),
}));

vi.mock("ai", () => ({
  createUIMessageStream: vi.fn(({ execute }) => {
    capturedChunks.length = 0;
    execute({
      writer: {
        write: (part: unknown) => capturedChunks.push(part),
        merge: vi.fn(),
      },
    });
    return capturedChunks;
  }),
  createUIMessageStreamResponse: vi.fn(() =>
    NextResponse.json({ chunks: capturedChunks }),
  ),
  streamText: vi.fn(() => ({
    toUIMessageStream: vi.fn((options) => {
      capturedMessageMetadata.push(
        options.messageMetadata?.({ part: { type: "start" } }),
      );
      void options.onFinish?.({
        responseMessage: {
          parts: [
            {
              type: "text",
              text: [
                "### Answer",
                "Operators must review evidence before action [1].",
                "",
                "### Evidence used",
                "[1] Policy",
                "",
                "### Limitations",
                "Current policy only.",
                "",
                "### Next safe action",
                "Review the cited policy.",
              ].join("\n"),
            },
          ],
        },
        finishReason: "stop",
      });
      return new ReadableStream();
    }),
  })),
}));

vi.mock("@/lib/ai-tracing", () => ({
  withAiSpan: vi.fn((_name, _attrs, run) => run()),
}));

import { LYNX_ERP_HTTP_ROUTES } from "@afenda/feature-lynx";
import { POST } from "@/app/api/internal/v1/lynx/queries/truth-search/route";
import {
  isAiFeatureEnabledForOrganization,
  recordLynxRunEvent,
} from "@afenda/db";
import { retrieveKnowledgeChunksWithDiagnostics } from "@afenda/feature-knowledge/server";

function findChunk(payload: { chunks: unknown[] }, type: string) {
  return payload.chunks.find(
    (chunk): chunk is { type: string; data?: unknown } =>
      typeof chunk === "object" &&
      chunk !== null &&
      (chunk as { type?: unknown }).type === type,
  );
}

describe("Lynx truth-search route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedChunks.length = 0;
    capturedMessageMetadata.length = 0;
    vi.mocked(isAiFeatureEnabledForOrganization).mockResolvedValue(true);
    vi.mocked(retrieveKnowledgeChunksWithDiagnostics).mockResolvedValue({
      rows: [
        {
          id: "chunk_1",
          title: "Policy",
          body: "Operators must review evidence before action.",
          createdAt: new Date("2026-01-01"),
          distance: 0.1,
          lexicalScore: 1,
          semanticRank: 0,
          lexicalRank: 9999,
          fusedRank: 1,
        },
      ],
      diagnostics: {
        status: "ok",
        mode: "semantic",
        hybridEnabled: false,
        rerankAttempted: false,
        rerankApplied: false,
      },
    });
  });

  it("emits evidence as AI SDK UI data parts", async () => {
    const response = await POST(
      new Request(`http://localhost${LYNX_ERP_HTTP_ROUTES.truthSearch}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: "What policy applies?" }),
      }),
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(findChunk(payload, "data-lynx-run-context")).toMatchObject({
      type: "data-lynx-run-context",
      data: {
        runId: "lynxrun_1",
        route: LYNX_ERP_HTTP_ROUTES.truthSearch,
      },
    });
    expect(findChunk(payload, "data-lynx-retrieval-state")).toMatchObject({
      type: "data-lynx-retrieval-state",
      data: {
        status: "ok",
        chunkCount: 1,
      },
    });
    expect(findChunk(payload, "data-lynx-truth-evidence")).toMatchObject({
      type: "data-lynx-truth-evidence",
      data: {
        chunkCount: 1,
        passages: [{ id: "chunk_1", passage: 1 }],
      },
    });
    expect(findChunk(payload, "data-lynx-quality-gate")).toMatchObject({
      type: "data-lynx-quality-gate",
      data: {
        gate: {
          status: "passed",
          unsupportedClaimCount: 0,
        },
      },
    });
    expect(capturedMessageMetadata[0]).toEqual({
      lynxRun: {
        runId: "lynxrun_1",
        route: LYNX_ERP_HTTP_ROUTES.truthSearch,
      },
    });
  });

  it("distinguishes no evidence from degraded retrieval", async () => {
    vi.mocked(retrieveKnowledgeChunksWithDiagnostics).mockResolvedValueOnce({
      rows: [],
      diagnostics: {
        status: "no_evidence",
        mode: "semantic",
        hybridEnabled: false,
        rerankAttempted: false,
        rerankApplied: false,
      },
    });

    const response = await POST(
      new Request(`http://localhost${LYNX_ERP_HTTP_ROUTES.truthSearch}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: "What policy applies?" }),
      }),
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(findChunk(payload, "data-lynx-run-context")).toMatchObject({
      type: "data-lynx-run-context",
      data: {
        runId: "lynxrun_1",
      },
    });
    expect(findChunk(payload, "data-lynx-retrieval-state")).toMatchObject({
      type: "data-lynx-retrieval-state",
      data: {
        status: "no_evidence",
        chunkCount: 0,
      },
    });
    expect(recordLynxRunEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "truth.retrieval_state",
        metadata: expect.objectContaining({
          retrievalState: expect.objectContaining({ status: "no_evidence" }),
        }),
      }),
    );
  });

  it("streams degraded retrieval state when retrieval fails", async () => {
    vi.mocked(retrieveKnowledgeChunksWithDiagnostics).mockRejectedValueOnce(
      new Error("database unavailable"),
    );

    const response = await POST(
      new Request(`http://localhost${LYNX_ERP_HTTP_ROUTES.truthSearch}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: "What policy applies?" }),
      }),
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(findChunk(payload, "data-lynx-run-context")).toMatchObject({
      type: "data-lynx-run-context",
      data: {
        runId: "lynxrun_1",
      },
    });
    expect(findChunk(payload, "data-lynx-retrieval-state")).toMatchObject({
      type: "data-lynx-retrieval-state",
      data: {
        status: "degraded",
        chunkCount: 0,
        degradedReason: "retrieval-failed",
      },
    });
    expect(recordLynxRunEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "truth.retrieval_state",
        metadata: expect.objectContaining({
          retrievalState: expect.objectContaining({ status: "degraded" }),
        }),
      }),
    );
  });

  it("rejects invalid request shape", async () => {
    const response = await POST(
      new Request(`http://localhost${LYNX_ERP_HTTP_ROUTES.truthSearch}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: "" }),
      }),
    );

    expect(response.status).toBe(400);
  });

  it("rejects disabled Lynx truth retrieval", async () => {
    vi.mocked(isAiFeatureEnabledForOrganization).mockResolvedValueOnce(false);

    const response = await POST(
      new Request(`http://localhost${LYNX_ERP_HTTP_ROUTES.truthSearch}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: "What policy applies?" }),
      }),
    );

    expect(response.status).toBe(403);
  });
});
