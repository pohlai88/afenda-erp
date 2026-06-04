import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@afenda/kernel/execution", () => ({
  writeExecutionAuditEvent: vi.fn(async () => undefined),
  writeExecutionAuditEventInTransaction: vi.fn(async () => undefined),
}));

// Mock @afenda/db
vi.mock("@afenda/db", () => {
  const mockDb = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
    transaction: vi.fn(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockResolvedValue([]),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
  };

  return {
    getDb: () => mockDb,
    knowledgeChunks: { id: "id", organizationId: "organization_id" },
    knowledgeDocuments: { id: "id", organizationId: "organization_id" },
    knowledgeOrgSettings: { organizationId: "organization_id" },
    knowledgeSources: { id: "id", organizationId: "organization_id" },
    digestKnowledgeDocument: (args: {
      externalId: string;
      title: string;
      body: string;
    }) => JSON.stringify(args),
  };
});

// Mock embeddings
vi.mock("../../src/data/knowledge.embeddings.server", () => ({
  embedKnowledgeBatch: vi.fn().mockResolvedValue({
    embeddingModelVersion: "openai/text-embedding-3-small",
    vectors: [],
  }),
}));

describe("commitKnowledgeDocument", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("is importable without throwing", async () => {
    const mod = await import("../../src/kno-pipeline-commit.server");
    expect(typeof mod.commitKnowledgeDocument).toBe("function");
  }, 15_000);

  it("exports CommitDocumentResult type shape", async () => {
    const mod = await import("../../src/kno-pipeline-commit.server");
    expect(mod.commitKnowledgeDocument).toBeDefined();
  });
});
