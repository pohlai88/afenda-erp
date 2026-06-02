import { describe, expect, it } from "vitest";
import {
  buildKnowledgeChunksListSurface,
  buildKnowledgeSettingsListSurface,
  buildKnowledgeSourcesListSurface,
  buildLynxEvalRunListSurface,
  getKnowledgeAdminSurfaceKeys,
  getLynxEvalRunSurfaceKey,
} from "../../src/metadata";

describe("knowledge metadata surfaces", () => {
  it("exposes stable admin surface keys", () => {
    expect(getKnowledgeAdminSurfaceKeys()).toEqual({
      sources: "knowledge.sources.list",
      chunks: "knowledge.chunks.list",
      settings: "knowledge.settings.list",
      evalRuns: getLynxEvalRunSurfaceKey(),
    });
  });

  it("builds sources list with governed columns id", () => {
    const surface = buildKnowledgeSourcesListSurface({
      rows: [
        {
          id: "src_1",
          name: "Manual docs",
          kind: "manual",
          enabled: "Enabled",
          lastSynced: "2026-06-01",
        },
      ],
    });

    expect(surface.surface.columnsId).toBe("knowledge-sources");
    expect(surface.rows[0]?.cellKinds?.enabled).toMatchObject({
      kind: "badge",
      tone: "positive",
    });
  });

  it("builds chunks list for recent window", () => {
    const surface = buildKnowledgeChunksListSurface({
      rows: [
        {
          id: "chk_1",
          title: "Policy excerpt",
          excerpt: "Retention policy summary…",
          createdAt: "2026-06-02",
        },
      ],
    });

    expect(surface.surface.columnsId).toBe("knowledge-chunks");
    expect(surface.pagination?.totalCount).toBe(1);
  });

  it("builds settings list surface", () => {
    const surface = buildKnowledgeSettingsListSurface({
      rows: [{ id: "hybrid", setting: "Hybrid retrieval", value: "Enabled" }],
    });

    expect(surface.surface.columnsId).toBe("knowledge-settings");
  });

  it("builds Lynx eval runs with quality gate badge", () => {
    const surface = buildLynxEvalRunListSurface({
      rows: [
        {
          id: "run_1",
          evalSetId: "truth-v1",
          caseCount: "12",
          recallAtK: "0.92",
          mrr: "0.81",
          evidenceOverlap: "0.67",
          qualityGate: "Pass",
          failedCases: "0",
          ranAt: "2026-06-02T10:00:00Z",
        },
      ],
    });

    expect(surface.surface.columnsId).toBe("lynx-eval-runs");
    expect(surface.rows[0]?.cellKinds?.qualityGate).toMatchObject({
      kind: "badge",
      tone: "positive",
    });
    expect(surface.rows[0]?.cells.qualityGate).toBe("Pass");
  });
});
