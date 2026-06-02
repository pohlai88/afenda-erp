/**
 * Governed surface metadata builders for @afenda/feature-knowledge.
 * Used by the knowledge admin page and the Lynx eval-runs panel.
 */

import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationResolvedInput,
} from "@afenda/governed-surface";

// ─── Lynx eval-runs list surface ─────────────────────────────────────────────

export type LynxEvalRunRow = {
  id: string;
  evalSetId: string;
  caseCount: string;
  recallAtK: string;
  mrr: string;
  evidenceOverlap: string;
  qualityGate: string;
  failedCases: string;
  ranAt: string;
};

const LYNX_EVAL_RUN_COLUMNS = [
  { id: "evalSetId", header: "Eval set" },
  { id: "caseCount", header: "Cases" },
  { id: "recallAtK", header: "Recall@K" },
  { id: "mrr", header: "MRR" },
  { id: "evidenceOverlap", header: "Evidence overlap" },
  { id: "qualityGate", header: "Quality gate" },
  { id: "failedCases", header: "Failed cases" },
  { id: "ranAt", header: "Run at" },
];

export function buildLynxEvalRunListSurface(input: {
  rows: readonly LynxEvalRunRow[];
}): ListSurfaceRendererConfigurationResolvedInput {
  const rows = input.rows;

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: {
      module: "system-admin",
      object: "lynx-eval-runs",
      function: "read",
    },
    pagination: {
      pageSize: Math.max(1, rows.length),
      totalCount: rows.length,
      hasNextPage: false,
    },
    surface: {
      header: { title: "Lynx eval runs" },
      columnsId: "lynx-eval-runs",
      rowKey: "id",
      empty: {
        variant: "muted",
        title: "No eval runs yet",
      },
    },
    columns: LYNX_EVAL_RUN_COLUMNS,
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        evalSetId: row.evalSetId,
        caseCount: row.caseCount,
        recallAtK: row.recallAtK,
        mrr: row.mrr,
        evidenceOverlap: row.evidenceOverlap,
        qualityGate: row.qualityGate,
        failedCases: row.failedCases,
        ranAt: row.ranAt,
      },
      cellKinds: {
        qualityGate: {
          kind: "badge",
          tone: row.qualityGate === "Pass" ? "positive" : "attention",
        },
      },
    })),
  });
}

export function getLynxEvalRunSurfaceKey() {
  return "lynx.eval-runs.list" as const;
}

// ─── Knowledge admin list surfaces ───────────────────────────────────────────

export type KnowledgeSourceListRow = {
  id: string;
  name: string;
  kind: string;
  enabled: string;
  lastSynced: string;
};

export type KnowledgeChunkListRow = {
  id: string;
  title: string;
  excerpt: string;
  createdAt: string;
};

export type KnowledgeSettingListRow = {
  id: string;
  setting: string;
  value: string;
};

const KNOWLEDGE_SOURCE_COLUMNS = [
  { id: "name", header: "Source" },
  { id: "kind", header: "Kind" },
  { id: "enabled", header: "Status" },
  { id: "lastSynced", header: "Last synced" },
];

const KNOWLEDGE_CHUNK_COLUMNS = [
  { id: "title", header: "Title", priority: "primary" as const, wrap: true },
  { id: "excerpt", header: "Excerpt", wrap: true },
  { id: "createdAt", header: "Indexed" },
];

const KNOWLEDGE_SETTING_COLUMNS = [
  { id: "setting", header: "Setting" },
  { id: "value", header: "Value" },
];

type KnowledgeAdminListColumn = Readonly<{
  id: string;
  header: string;
  priority?: "primary";
  wrap?: boolean;
}>;

function buildKnowledgeAdminListSurface(input: {
  columnsId: string;
  title: string;
  emptyTitle: string;
  columns: readonly KnowledgeAdminListColumn[];
  rows: ReadonlyArray<{
    id: string;
    cells: Record<string, string>;
    cellKinds?: Record<
      string,
      { kind: "badge"; tone?: "positive" | "default" | "attention" | "critical" }
    >;
  }>;
}): ListSurfaceRendererConfigurationResolvedInput {
  const rows = input.rows;

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: {
      module: "system-admin",
      object: "knowledge",
      function: "read",
    },
    pagination: {
      pageSize: Math.max(1, rows.length),
      totalCount: rows.length,
      hasNextPage: false,
    },
    surface: {
      header: { title: input.title },
      columnsId: input.columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: input.emptyTitle },
    },
    columns: [...input.columns],
    rows: rows.map((row) => ({
      id: row.id,
      cells: row.cells,
      ...(row.cellKinds ? { cellKinds: row.cellKinds } : {}),
    })),
  });
}

export function buildKnowledgeSourcesListSurface(input: {
  rows: readonly KnowledgeSourceListRow[];
}) {
  return buildKnowledgeAdminListSurface({
    columnsId: "knowledge-sources",
    title: "Knowledge sources",
    emptyTitle: "No knowledge sources configured",
    columns: KNOWLEDGE_SOURCE_COLUMNS,
    rows: input.rows.map((row) => ({
      id: row.id,
      cells: {
        name: row.name,
        kind: row.kind,
        enabled: row.enabled,
        lastSynced: row.lastSynced,
      },
      cellKinds: {
        enabled: {
          kind: "badge",
          tone: row.enabled === "Enabled" ? "positive" : "default",
        },
      },
    })),
  });
}

export function buildKnowledgeChunksListSurface(input: {
  rows: readonly KnowledgeChunkListRow[];
}) {
  return buildKnowledgeAdminListSurface({
    columnsId: "knowledge-chunks",
    title: "Recent chunks",
    emptyTitle: "No chunks indexed yet",
    columns: KNOWLEDGE_CHUNK_COLUMNS,
    rows: input.rows.map((row) => ({
      id: row.id,
      cells: {
        title: row.title,
        excerpt: row.excerpt,
        createdAt: row.createdAt,
      },
    })),
  });
}

export function buildKnowledgeSettingsListSurface(input: {
  rows: readonly KnowledgeSettingListRow[];
}) {
  return buildKnowledgeAdminListSurface({
    columnsId: "knowledge-settings",
    title: "Retrieval settings",
    emptyTitle: "No retrieval settings",
    columns: KNOWLEDGE_SETTING_COLUMNS,
    rows: input.rows.map((row) => ({
      id: row.id,
      cells: {
        setting: row.setting,
        value: row.value,
      },
    })),
  });
}

export function getKnowledgeAdminSurfaceKeys() {
  return {
    sources: "knowledge.sources.list",
    chunks: "knowledge.chunks.list",
    settings: "knowledge.settings.list",
    evalRuns: getLynxEvalRunSurfaceKey(),
  } as const;
}
