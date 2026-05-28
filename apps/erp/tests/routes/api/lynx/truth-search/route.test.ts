import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const capturedChunks: unknown[] = [];

vi.mock("@afenda/ai", () => ({
  assertCapabilityAllowed: vi.fn(),
  createGatewayOptions: vi.fn(() => ({})),
  getAiModelForFeature: vi.fn(() => "openai/gpt-5.4"),
  hasAiGatewayCredentials: vi.fn(() => true),
  resolveLanguageModel: vi.fn(() => "model"),
}));

vi.mock("@afenda/auth/server", () => ({
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
  retrieveKnowledgeChunks: vi.fn(async () => [
    {
      id: "chunk_1",
      title: "Policy",
      body: "Operators must review evidence before action.",
      distance: 0.1,
      lexicalScore: 1,
      fusedRank: 1,
    },
  ]),
}));

vi.mock("@afenda/feature-lynx", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@afenda/feature-lynx")>();
  return {
    ...actual,
    buildLynxTruthSystemPrompt: vi.fn(() => "system"),
  };
});

vi.mock("@afenda/observability", () => ({
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
      void options.onFinish?.({
        responseMessage: {
          parts: [
            {
              type: "text",
              text: "Answer: Operators must review evidence before action [1].\nEvidence: [1]\nLimits: Current policy only.\nNext step: Review the cited policy.",
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

import { POST } from "@/app/api/lynx/truth-search/route";

describe("Lynx truth-search route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedChunks.length = 0;
  });

  it("emits evidence as AI SDK UI data parts", async () => {
    const response = await POST(
      new Request("http://localhost/api/lynx/truth-search", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: "What policy applies?" }),
      }),
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.chunks[0]).toMatchObject({
      type: "data-lynx-truth-evidence",
      data: {
        chunkCount: 1,
        passages: [{ id: "chunk_1", passage: 1 }],
      },
    });
    expect(payload.chunks[1]).toMatchObject({
      type: "data-lynx-quality-gate",
      data: {
        gate: {
          status: "passed",
          unsupportedClaimCount: 0,
        },
      },
    });
  });
});
