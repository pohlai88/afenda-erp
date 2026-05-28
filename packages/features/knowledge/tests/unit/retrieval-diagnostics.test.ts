import { beforeEach, describe, expect, it, vi } from "vitest";

const queryResults: Array<unknown[] | Error> = [];
const emitKnowledgeAuditEventMock = vi.fn();
const rerankMock = vi.fn();

function createDbBuilder() {
  const builder = {
    from: vi.fn(() => builder),
    where: vi.fn(() => builder),
    orderBy: vi.fn(() => builder),
    limit: vi.fn(async () => {
      const next = queryResults.shift() ?? [];
      if (next instanceof Error) throw next;
      return next;
    }),
  };
  return builder;
}

vi.mock("drizzle-orm", () => ({
  asc: vi.fn((value) => value),
  cosineDistance: vi.fn(() => "distance"),
  eq: vi.fn(() => "eq"),
  sql: vi.fn(() => "sql"),
}));

vi.mock("@afenda/db", () => ({
  getDb: vi.fn(() => ({
    select: vi.fn(() => createDbBuilder()),
  })),
  knowledgeChunks: {
    id: "id",
    title: "title",
    body: "body",
    createdAt: "createdAt",
    embedding: "embedding",
    organizationId: "organizationId",
  },
}));

vi.mock("../../src/data/knowledge.embeddings.server", () => ({
  embedKnowledgeText: vi.fn(async () => [0.1, 0.2, 0.3]),
}));

vi.mock("../../src/data/knowledge.audit.server", () => ({
  emitKnowledgeAuditEvent: emitKnowledgeAuditEventMock,
}));

vi.mock("@afenda/ai/server", () => ({
  resolveRerankingModel: vi.fn((modelId: string) => modelId),
}));

vi.mock("ai", () => ({
  rerank: rerankMock,
}));

const {
  retrieveKnowledgeChunks,
  retrieveKnowledgeChunksWithDiagnostics,
} = await import("../../src/data/knowledge.retrieve-hybrid.server");

const semanticRow = {
  id: "chunk_1",
  title: "Policy",
  body: "Body",
  createdAt: new Date("2026-01-01"),
  distance: 0.1,
};

describe("knowledge retrieval diagnostics", () => {
  beforeEach(() => {
    queryResults.length = 0;
    emitKnowledgeAuditEventMock.mockClear();
    rerankMock.mockReset();
    vi.unstubAllEnvs();
  });

  it("returns semantic diagnostics when hybrid is disabled", async () => {
    queryResults.push([semanticRow]);

    const result = await retrieveKnowledgeChunksWithDiagnostics(
      "org_1",
      "policy",
      { hybrid: false },
    );

    expect(result.rows).toHaveLength(1);
    expect(result.diagnostics).toMatchObject({
      status: "ok",
      mode: "semantic",
      hybridEnabled: false,
      rerankAttempted: false,
      rerankApplied: false,
    });
  });

  it("keeps row-only compatibility wrapper", async () => {
    queryResults.push([semanticRow]);

    await expect(retrieveKnowledgeChunks("org_1", "policy")).resolves.toEqual([
      expect.objectContaining({ id: "chunk_1" }),
    ]);
  });

  it("marks rerank unavailable as degraded while keeping merged rows", async () => {
    queryResults.push([semanticRow], []);

    const result = await retrieveKnowledgeChunksWithDiagnostics(
      "org_1",
      "policy",
      { hybrid: true, rerank: true },
    );

    expect(result.rows).toHaveLength(1);
    expect(result.diagnostics).toMatchObject({
      status: "degraded",
      mode: "hybrid",
      rerankAttempted: true,
      rerankApplied: false,
      degradedReason: "rerank-model-unavailable",
    });
    expect(emitKnowledgeAuditEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "erp.knowledge.retrieval.degraded",
        result: "failed",
      }),
    );
    expect(emitKnowledgeAuditEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "erp.knowledge.rerank.unavailable",
        result: "failed",
        metadata: expect.objectContaining({
          reason: "rerank-model-unavailable",
        }),
      }),
    );
  });

  it("marks rerank applied when a reranker returns rankings", async () => {
    vi.stubEnv("RERANK_MODEL", "cohere/rerank-v3.5");
    queryResults.push([semanticRow], []);
    rerankMock.mockResolvedValueOnce({
      ranking: [{ originalIndex: 0, score: 0.95 }],
    });

    const result = await retrieveKnowledgeChunksWithDiagnostics(
      "org_1",
      "policy",
      { hybrid: true, rerank: true },
    );

    expect(result.diagnostics).toMatchObject({
      status: "ok",
      rerankAttempted: true,
      rerankApplied: true,
    });
    expect(result.rows[0]?.fusedRank).toBe(0.95);
  });

  it("audits rerank skipped when semantic-only retrieval requested rerank", async () => {
    queryResults.push([semanticRow]);

    const result = await retrieveKnowledgeChunksWithDiagnostics(
      "org_1",
      "policy",
      { hybrid: false, rerank: true },
    );

    expect(result.diagnostics).toMatchObject({
      status: "ok",
      mode: "semantic",
      rerankAttempted: true,
      rerankApplied: false,
    });
    expect(emitKnowledgeAuditEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "erp.knowledge.rerank.skipped",
        result: "skipped",
        metadata: expect.objectContaining({ reason: "semantic-only-mode" }),
      }),
    );
  });

  it("audits rerank failure while keeping merged fallback rows", async () => {
    vi.stubEnv("RERANK_MODEL", "cohere/rerank-v3.5");
    queryResults.push([semanticRow], []);
    rerankMock.mockRejectedValueOnce(new Error("rerank unavailable"));

    const result = await retrieveKnowledgeChunksWithDiagnostics(
      "org_1",
      "policy",
      { hybrid: true, rerank: true },
    );

    expect(result.rows).toHaveLength(1);
    expect(result.diagnostics).toMatchObject({
      status: "degraded",
      rerankAttempted: true,
      rerankApplied: false,
      degradedReason: "rerank-failed",
    });
    expect(emitKnowledgeAuditEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "erp.knowledge.rerank.failed",
        result: "failed",
        metadata: expect.objectContaining({ reason: "rerank-failed" }),
      }),
    );
  });
});
