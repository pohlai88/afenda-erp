import { pgEnum, text, timestamp } from "drizzle-orm/pg-core";

export const organizationRoleEnum = pgEnum("organization_role", [
  "owner",
  "admin",
  "finance-manager",
  "operations-manager",
  "staff",
  "viewer",
]);

export const entityTypeEnum = pgEnum("audit_entity_type", [
  "organization",
  "membership",
  "user-profile",
  "erp-record",
  "workflow-item",
  "saved-view",
  "document",
  "system",
]);

export const erpModuleIdEnum = pgEnum("erp_module_id", [
  "dashboard",
  "finance",
  "sales",
  "purchasing",
  "inventory",
  "hr",
  "crm",
  "approvals",
  "reports",
  "system-admin",
]);

export const erpRecordStatusEnum = pgEnum("erp_record_status", [
  "draft",
  "active",
  "blocked",
  "ready",
  "closed",
]);

export const erpWorkItemStatusEnum = pgEnum("erp_work_item_status", [
  "pending",
  "in-review",
  "escalated",
  "scheduled",
  "completed",
]);

export const erpPriorityEnum = pgEnum("erp_priority", [
  "low",
  "medium",
  "high",
]);

export const erpViewVisibilityEnum = pgEnum("erp_view_visibility", [
  "private",
  "team",
  "tenant",
]);

export const erpDocumentAccessEnum = pgEnum("erp_document_access", [
  "private",
  "public",
]);

/**
 * Retention classes map to org data-handling policies (ARCH-1001 §Files).
 * - standard   : default; retained until explicitly deleted.
 * - short-term : retained for 30 days after last access or explicit purge.
 * - legal-hold : immutable; deletion requires admin approval workflow.
 */
export const erpDocumentRetentionEnum = pgEnum("erp_document_retention", [
  "standard",
  "short-term",
  "legal-hold",
]);

export const aiFeatureEnum = pgEnum("ai_feature", [
  "assistant",
  "document-extraction",
  "approval-tool",
  "solution-provider",
  "lynx-truth",
  "lynx-operator",
]);

export const aiRequestStatusEnum = pgEnum("ai_request_status", [
  "started",
  "completed",
  "failed",
]);

export const aiExtractionStatusEnum = pgEnum("ai_extraction_status", [
  "completed",
  "needs-review",
  "failed",
]);

export const aiApprovalStatusEnum = pgEnum("ai_approval_status", [
  "proposed",
  "approved",
  "rejected",
  "executed",
]);

export const aiSandboxStatusEnum = pgEnum("ai_sandbox_status", [
  "pending",
  "approved",
  "rejected",
  "discarded",
]);

export const lynxWorkflowSessionStatusEnum = pgEnum(
  "lynx_workflow_session_status",
  ["active", "paused", "completed", "failed", "cancelled"],
);

export const lynxRunFeedbackRatingEnum = pgEnum("lynx_run_feedback_rating", [
  "positive",
  "negative",
]);

export const lynxRunFeedbackCategoryEnum = pgEnum(
  "lynx_run_feedback_category",
  ["accurate", "unsupported", "wrong-tool", "slow", "unsafe", "other"],
);

export const timestampColumns = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
};

export function organizationIdColumn() {
  return text("organization_id").notNull();
}
