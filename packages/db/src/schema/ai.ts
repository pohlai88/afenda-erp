import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import {
  aiApprovalStatusEnum,
  aiExtractionStatusEnum,
  aiFeatureEnum,
  aiRequestStatusEnum,
  aiSandboxStatusEnum,
  erpModuleIdEnum,
  organizationIdColumn,
  timestampColumns,
} from "./common";
import { erpDocuments, erpWorkItems } from "./erp";
import { organizations } from "./organizations";

const organizationReference = () =>
  organizationIdColumn().references(() => organizations.id, {
    onDelete: "cascade",
  });

export const aiUsageEvents = pgTable(
  "ai_usage_events",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    userAuthId: text("user_auth_id").notNull(),
    moduleId: erpModuleIdEnum("module_id").notNull(),
    feature: aiFeatureEnum("feature").notNull(),
    model: text("model").notNull(),
    status: aiRequestStatusEnum("status").notNull(),
    promptTokens: integer("prompt_tokens").notNull().default(0),
    completionTokens: integer("completion_tokens").notNull().default(0),
    totalTokens: integer("total_tokens").notNull().default(0),
    latencyMs: integer("latency_ms").notNull().default(0),
    errorMessage: text("error_message"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("ai_usage_events_org_feature_created_idx").on(
      table.organizationId,
      table.feature,
      table.createdAt,
    ),
    index("ai_usage_events_org_module_idx").on(
      table.organizationId,
      table.moduleId,
    ),
  ],
);

export const aiDocumentExtractions = pgTable(
  "ai_document_extractions",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    documentId: text("document_id").references(() => erpDocuments.id, {
      onDelete: "set null",
    }),
    moduleId: erpModuleIdEnum("module_id").notNull(),
    requestedByAuthUserId: text("requested_by_auth_user_id").notNull(),
    model: text("model").notNull(),
    status: aiExtractionStatusEnum("status").notNull(),
    confidence: integer("confidence").notNull(),
    extracted: jsonb("extracted").$type<Record<string, unknown>>().notNull(),
    reviewNotes: text("review_notes").notNull(),
    ...timestampColumns,
  },
  (table) => [
    index("ai_document_extractions_org_module_idx").on(
      table.organizationId,
      table.moduleId,
    ),
    index("ai_document_extractions_document_idx").on(table.documentId),
  ],
);

export const aiApprovalProposals = pgTable(
  "ai_approval_proposals",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    workItemId: text("work_item_id").references(() => erpWorkItems.id, {
      onDelete: "set null",
    }),
    moduleId: erpModuleIdEnum("module_id").notNull(),
    requestedByAuthUserId: text("requested_by_auth_user_id").notNull(),
    model: text("model").notNull(),
    status: aiApprovalStatusEnum("status").notNull(),
    proposedAction: text("proposed_action").notNull(),
    rationale: text("rationale").notNull(),
    riskLevel: text("risk_level").notNull(),
    toolInput: jsonb("tool_input").$type<Record<string, unknown>>().notNull(),
    toolOutput: jsonb("tool_output").$type<Record<string, unknown>>().notNull(),
    ...timestampColumns,
  },
  (table) => [
    index("ai_approval_proposals_org_status_idx").on(
      table.organizationId,
      table.status,
    ),
    index("ai_approval_proposals_work_item_idx").on(table.workItemId),
  ],
);

export const aiActionSandboxes = pgTable(
  "ai_action_sandboxes",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    // text rather than enum so operational skills (e.g. lms) can use this
    // table without requiring an enum migration for each new module.
    moduleId: text("module_id").notNull(),
    actionType: text("action_type").notNull(),
    title: text("title").notNull(),
    proposedBy: text("proposed_by").notNull().default("ai"),
    status: aiSandboxStatusEnum("status").notNull().default("pending"),
    diff: jsonb("diff").$type<Record<string, unknown>>().notNull(),
    riskAssessment: jsonb("risk_assessment")
      .$type<Record<string, unknown>>()
      .notNull(),
    sourceEvidence: jsonb("source_evidence")
      .$type<Record<string, unknown>[]>()
      .notNull()
      .default([]),
    rollbackMetadata: jsonb("rollback_metadata").$type<Record<
      string,
      unknown
    > | null>(),
    approvalProposalId: text("approval_proposal_id").references(
      () => aiApprovalProposals.id,
      { onDelete: "set null" },
    ),
    rejectionReason: text("rejection_reason"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    rejectedAt: timestamp("rejected_at", { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => [
    index("ai_action_sandboxes_org_status_created_idx").on(
      table.organizationId,
      table.status,
      table.createdAt,
    ),
    index("ai_action_sandboxes_org_module_idx").on(
      table.organizationId,
      table.moduleId,
    ),
    index("ai_action_sandboxes_approval_proposal_idx").on(
      table.approvalProposalId,
    ),
  ],
);
