import { describe, expect, it, vi } from "vitest";

const retrieveKnowledgeChunksWithDiagnosticsMock = vi.fn(async () => ({
  rows: [
    {
      id: "chunk_1",
      title: "Policy",
      body: "Operators must review evidence before action.",
      createdAt: new Date("2026-01-01"),
      distance: 0.1,
      lexicalScore: 0,
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
}));
const recordGovernedToolAuditMock = vi.fn();

vi.mock("@afenda/feature-knowledge/server", () => ({
  getKnowledgeOrgSetting: vi.fn(async () => ({
    retrievalHybridEnabled: false,
    retrievalRerankEnabled: false,
  })),
  listRecentKnowledgeChunks: vi.fn(),
  retrieveKnowledgeChunksWithDiagnostics:
    retrieveKnowledgeChunksWithDiagnosticsMock,
}));

vi.mock("@afenda/ai/server", () => ({
  recordGovernedToolAudit: recordGovernedToolAuditMock,
}));

const { createLynxKnowledgeTools } = await import(
  "../../src/tools/lynx.knowledge.tool.server"
);

describe("Lynx knowledge tools", () => {
  it("returns retrieval diagnostics in audit-safe output", async () => {
    const tools = createLynxKnowledgeTools({
      organizationId: "org_1",
      userAuthId: "user_1",
    });

    const output = await tools.searchKnowledge.execute({
      query: "policy",
    });

    expect(output).toMatchObject({
      diagnostics: {
        status: "ok",
        mode: "semantic",
      },
      passages: [{ id: "chunk_1", passage: 1 }],
    });
    expect(recordGovernedToolAuditMock).toHaveBeenCalledWith(
      expect.objectContaining({
        toolName: "searchKnowledge",
        output: expect.objectContaining({
          diagnostics: expect.objectContaining({ status: "ok" }),
        }),
      }),
    );
  });
});
