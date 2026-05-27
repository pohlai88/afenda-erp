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
    index("ai_usage_events_org_module_idx").on(table.organizationId, table.moduleId),
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
