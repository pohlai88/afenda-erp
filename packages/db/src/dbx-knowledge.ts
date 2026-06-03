import { createHash, randomUUID } from "node:crypto";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  vector,
} from "drizzle-orm/pg-core";
import { organizationIdColumn, timestampColumns } from "./dbx-common";
import { organizations } from "./dbx-organizations";

export const KNOWLEDGE_EMBEDDING_DIMENSIONS = 1536;

export const knowledgeSourceKindEnum = pgEnum("knowledge_source_kind", [
  "manual",
  "github_repo",
]);

const organizationReference = () =>
  organizationIdColumn().references(() => organizations.id, {
    onDelete: "cascade",
  });

export const knowledgeSources = pgTable(
  "knowledge_sources",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    name: text("name").notNull(),
    kind: knowledgeSourceKindEnum("kind").notNull(),
    enabled: boolean("enabled").notNull().default(true),
    config: jsonb("config").$type<Record<string, unknown>>().notNull(),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("knowledge_sources_org_name_idx").on(
      table.organizationId,
      table.name,
    ),
    index("knowledge_sources_org_enabled_idx").on(
      table.organizationId,
      table.enabled,
    ),
  ],
);

export const knowledgeDocuments = pgTable(
  "knowledge_documents",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    sourceId: text("source_id")
      .notNull()
      .references(() => knowledgeSources.id, { onDelete: "cascade" }),
    externalId: text("external_id").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    inputDigest: text("input_digest").notNull(),
    tokenCount: integer("token_count").notNull().default(0),
    embeddingModelVersion: text("embedding_model_version").notNull(),
    lastEmbeddedAt: timestamp("last_embedded_at", { withTimezone: true }),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("knowledge_documents_org_source_external_idx").on(
      table.organizationId,
      table.sourceId,
      table.externalId,
    ),
    index("knowledge_documents_org_source_idx").on(
      table.organizationId,
      table.sourceId,
    ),
  ],
);

export const knowledgeChunks = pgTable(
  "knowledge_chunks",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    documentId: text("document_id")
      .notNull()
      .references(() => knowledgeDocuments.id, { onDelete: "cascade" }),
    chunkIndex: integer("chunk_index").notNull(),
    tokenCount: integer("token_count").notNull().default(0),
    embeddingModelVersion: text("embedding_model_version").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    embedding: vector("embedding", {
      dimensions: KNOWLEDGE_EMBEDDING_DIMENSIONS,
    }).notNull(),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("knowledge_chunks_document_index_idx").on(
      table.documentId,
      table.chunkIndex,
    ),
    index("knowledge_chunks_org_created_idx").on(
      table.organizationId,
      table.createdAt,
    ),
    index("knowledge_chunks_embedding_hnsw_idx").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops"),
    ),
  ],
);

export const knowledgeOrgSettings = pgTable("knowledge_org_settings", {
  organizationId: organizationReference().primaryKey(),
  retrievalHybridEnabled: boolean("retrieval_hybrid_enabled")
    .notNull()
    .default(true),
  retrievalRerankEnabled: boolean("retrieval_rerank_enabled")
    .notNull()
    .default(false),
  enforceZdr: boolean("enforce_zdr").notNull().default(false),
  metadata: jsonb("metadata")
    .$type<Record<string, unknown>>()
    .notNull()
    .default({}),
  ...timestampColumns,
});

export const knowledgeOrgCredentials = pgTable(
  "knowledge_org_credentials",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    sourceId: text("source_id").references(() => knowledgeSources.id, {
      onDelete: "cascade",
    }),
    provider: text("provider").notNull(),
    secretRef: text("secret_ref").notNull(),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("knowledge_org_credentials_org_provider_idx").on(
      table.organizationId,
      table.provider,
    ),
  ],
);

export const lynxEvalRuns = pgTable(
  "lynx_eval_runs",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    organizationId: organizationReference(),
    evalSetId: text("eval_set_id").notNull(),
    caseCount: integer("case_count").notNull(),
    recallAtK: text("recall_at_k").notNull(),
    mrr: text("mrr").notNull(),
    evidenceOverlap: text("evidence_overlap").notNull(),
    qualityMetrics: jsonb("quality_metrics")
      .$type<Record<string, unknown>>()
      .notNull(),
    failureSamples: jsonb("failure_samples")
      .$type<Record<string, unknown>[]>()
      .notNull(),
    ranAt: timestamp("ran_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("lynx_eval_runs_org_ran_idx").on(table.organizationId, table.ranAt),
    index("lynx_eval_runs_org_set_idx").on(
      table.organizationId,
      table.evalSetId,
    ),
  ],
);

export const lynxEvalSets = pgTable(
  "lynx_eval_sets",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    evalSetId: text("eval_set_id").notNull(),
    version: integer("version").notNull(),
    workflowId: text("workflow_id").notNull(),
    moduleId: text("module_id").notNull(),
    status: text("status").notNull(),
    description: text("description").notNull().default(""),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("lynx_eval_sets_org_set_version_idx").on(
      table.organizationId,
      table.evalSetId,
      table.version,
    ),
    index("lynx_eval_sets_org_workflow_idx").on(
      table.organizationId,
      table.workflowId,
    ),
  ],
);

export const lynxEvalCases = pgTable(
  "lynx_eval_cases",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    evalSetRowId: text("eval_set_row_id")
      .notNull()
      .references(() => lynxEvalSets.id, { onDelete: "cascade" }),
    caseId: text("case_id").notNull(),
    query: text("query").notNull(),
    expectedEvidenceIds: jsonb("expected_evidence_ids")
      .$type<string[]>()
      .notNull(),
    expectedBehavior: text("expected_behavior").notNull(),
    shouldAnswer: boolean("should_answer").notNull().default(true),
    containsPromptInjection: boolean("contains_prompt_injection")
      .notNull()
      .default(false),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("lynx_eval_cases_org_set_case_idx").on(
      table.organizationId,
      table.evalSetRowId,
      table.caseId,
    ),
  ],
);

export const lynxEvalCaseResults = pgTable(
  "lynx_eval_case_results",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    evalRunId: text("eval_run_id")
      .notNull()
      .references(() => lynxEvalRuns.id, { onDelete: "cascade" }),
    evalSetRowId: text("eval_set_row_id")
      .notNull()
      .references(() => lynxEvalSets.id, { onDelete: "cascade" }),
    evalCaseRowId: text("eval_case_row_id")
      .notNull()
      .references(() => lynxEvalCases.id, { onDelete: "cascade" }),
    caseId: text("case_id").notNull(),
    query: text("query").notNull(),
    observedAnswer: text("observed_answer").notNull().default(""),
    retrievedEvidenceIds: jsonb("retrieved_evidence_ids")
      .$type<string[]>()
      .notNull(),
    metrics: jsonb("metrics").$type<Record<string, unknown>>().notNull(),
    failureReasons: jsonb("failure_reasons").$type<string[]>().notNull(),
    semanticGrade: jsonb("semantic_grade").$type<Record<
      string,
      unknown
    > | null>(),
    representativeFailure: boolean("representative_failure")
      .notNull()
      .default(false),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    ...timestampColumns,
  },
  (table) => [
    index("lynx_eval_case_results_org_run_idx").on(
      table.organizationId,
      table.evalRunId,
    ),
    index("lynx_eval_case_results_org_failure_idx").on(
      table.organizationId,
      table.representativeFailure,
      table.createdAt,
    ),
  ],
);

export function digestKnowledgeDocument(input: {
  externalId: string;
  title: string;
  body: string;
}) {
  return createHash("sha256")
    .update(input.externalId)
    .update("\0")
    .update(input.title)
    .update("\0")
    .update(input.body)
    .digest("hex");
}
