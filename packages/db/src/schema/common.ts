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
  "admin",
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

export const aiFeatureEnum = pgEnum("ai_feature", [
  "assistant",
  "document-extraction",
  "approval-tool",
  "solution-provider",
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
