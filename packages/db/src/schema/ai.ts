import {
  boolean,
  index,
  integer,
  jsonb,
  primaryKey,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import {
  aiApprovalStatusEnum,
  aiExtractionStatusEnum,
  aiFeatureEnum,
  aiRequestStatusEnum,
  aiSandboxStatusEnum,
  erpModuleIdEnum,
  lynxRunFeedbackCategoryEnum,
  lynxRunFeedbackRatingEnum,
  lynxWorkflowSessionStatusEnum,
  organizationIdColumn,
  timestampColumns,
} from "./common";
import { erpDocuments, erpWorkItems } from "./erp";
import { organizations } from "./organizations";

const organizationReference = () =>
  organizationIdColumn().references(() => organizations.id, {
    onDelete: "cascade",
  });

export const aiFeatureEntitlements = pgTable(
  "ai_feature_entitlements",
  {
    organizationId: organizationReference(),
    feature: aiFeatureEnum("feature").notNull(),
    enabled: boolean("enabled").notNull().default(true),
    updatedByAuthUserId: text("updated_by_auth_user_id"),
    ...timestampColumns,
  },
  (table) => [
    primaryKey({
      columns: [table.organizationId, table.feature],
      name: "ai_feature_entitlements_pk",
    }),
    index("ai_feature_entitlements_org_enabled_idx").on(
      table.organizationId,
      table.enabled,
    ),
  ],
);

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

export const lynxRuns = pgTable(
  "lynx_runs",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    userAuthId: text("user_auth_id").notNull(),
    route: text("route").notNull(),
    workflowId: text("workflow_id"),
    workflowSessionId: text("workflow_session_id"),
    model: text("model").notNull(),
    status: aiRequestStatusEnum("status").notNull().default("started"),
    promptSummary: text("prompt_summary").notNull(),
    latencyMs: integer("latency_ms").notNull().default(0),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull(),
    startedAt: timestamp("started_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => [
    index("lynx_runs_org_started_idx").on(
      table.organizationId,
      table.startedAt,
    ),
    index("lynx_runs_org_route_idx").on(table.organizationId, table.route),
    index("lynx_runs_org_workflow_idx").on(
      table.organizationId,
      table.workflowId,
    ),
    index("lynx_runs_org_workflow_session_idx").on(
      table.organizationId,
      table.workflowSessionId,
    ),
    index("lynx_runs_org_status_idx").on(table.organizationId, table.status),
  ],
);

export const lynxRunEvents = pgTable(
  "lynx_run_events",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    runId: text("run_id")
      .notNull()
      .references(() => lynxRuns.id, { onDelete: "cascade" }),
    eventType: text("event_type").notNull(),
    toolName: text("tool_name"),
    summary: text("summary").notNull(),
    inputSummary: jsonb("input_summary")
      .$type<Record<string, unknown> | null>()
      .default(null),
    outputSummary: jsonb("output_summary")
      .$type<Record<string, unknown> | null>()
      .default(null),
    evidenceReferences: jsonb("evidence_references")
      .$type<Record<string, unknown>[]>()
      .notNull()
      .default([]),
    validationMetrics: jsonb("validation_metrics")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    approvalProposalId: text("approval_proposal_id").references(
      () => aiApprovalProposals.id,
      { onDelete: "set null" },
    ),
    sandboxId: text("sandbox_id").references(() => aiActionSandboxes.id, {
      onDelete: "set null",
    }),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("lynx_run_events_org_run_created_idx").on(
      table.organizationId,
      table.runId,
      table.createdAt,
    ),
    index("lynx_run_events_org_type_idx").on(
      table.organizationId,
      table.eventType,
    ),
    index("lynx_run_events_tool_idx").on(table.toolName),
  ],
);

export const lynxRunFeedback = pgTable(
  "lynx_run_feedback",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    runId: text("run_id")
      .notNull()
      .references(() => lynxRuns.id, { onDelete: "cascade" }),
    userAuthId: text("user_auth_id").notNull(),
    rating: lynxRunFeedbackRatingEnum("rating").notNull(),
    category: lynxRunFeedbackCategoryEnum("category").notNull(),
    note: text("note").notNull().default(""),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull(),
    ...timestampColumns,
  },
  (table) => [
    index("lynx_run_feedback_org_run_idx").on(
      table.organizationId,
      table.runId,
    ),
  ],
);

export const lynxWorkflowSessions = pgTable(
  "lynx_workflow_sessions",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    userAuthId: text("user_auth_id").notNull(),
    workflowId: text("workflow_id").notNull(),
    status: lynxWorkflowSessionStatusEnum("status").notNull().default("active"),
    currentStage: text("current_stage").notNull(),
    promptSummary: text("prompt_summary").notNull(),
    latestRunId: text("latest_run_id").references(() => lynxRuns.id, {
      onDelete: "set null",
    }),
    evidenceSummary: jsonb("evidence_summary")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    qualityGateSummary: jsonb("quality_gate_summary")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    nextRecommendedStep: text("next_recommended_step").notNull().default(""),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull(),
    ...timestampColumns,
  },
  (table) => [
    index("lynx_workflow_sessions_org_status_idx").on(
      table.organizationId,
      table.status,
    ),
    index("lynx_workflow_sessions_org_workflow_idx").on(
      table.organizationId,
      table.workflowId,
    ),
    index("lynx_workflow_sessions_latest_run_idx").on(table.latestRunId),
  ],
);

export const lynxOutcomeMonitorSettings = pgTable(
  "lynx_outcome_monitor_settings",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    monitorId: text("monitor_id").notNull(),
    enabled: boolean("enabled").notNull().default(true),
    thresholds: jsonb("thresholds").$type<Record<string, unknown>>().notNull(),
    ownerAuthUserId: text("owner_auth_user_id"),
    severityPolicy: jsonb("severity_policy")
      .$type<Record<string, unknown>>()
      .notNull(),
    updatedByAuthUserId: text("updated_by_auth_user_id").notNull(),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("lynx_outcome_monitor_settings_org_monitor_idx").on(
      table.organizationId,
      table.monitorId,
    ),
    index("lynx_outcome_monitor_settings_org_enabled_idx").on(
      table.organizationId,
      table.enabled,
    ),
  ],
);
