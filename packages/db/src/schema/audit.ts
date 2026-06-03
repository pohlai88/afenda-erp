import { index, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import {
  entityTypeEnum,
  organizationIdColumn,
  timestampColumns,
} from "./common";
import { organizations } from "./organizations";

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: text("id").primaryKey(),
    organizationId: organizationIdColumn().references(() => organizations.id, {
      onDelete: "cascade",
    }),
    actorAuthUserId: text("actor_auth_user_id").notNull(),
    actorType: text("actor_type"),
    actorRole: text("actor_role"),
    subjectType: text("subject_type"),
    subjectId: text("subject_id"),
    entityType: entityTypeEnum("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    action: text("action").notNull(),
    summary: text("summary").notNull(),
    outcome: text("outcome"),
    targetType: text("target_type"),
    targetId: text("target_id"),
    targetDisplayName: text("target_display_name"),
    module: text("module"),
    surface: text("surface"),
    route: text("route"),
    channel: text("channel"),
    reason: text("reason"),
    policyReference: text("policy_reference"),
    approvalId: text("approval_id"),
    requestId: text("request_id"),
    operationId: text("operation_id"),
    beforeJson: jsonb("before_json").$type<Record<string, unknown>>(),
    afterJson: jsonb("after_json").$type<Record<string, unknown>>(),
    diffJson: jsonb("diff_json").$type<Record<string, unknown>[]>(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    ...timestampColumns,
  },
  (table) => [
    index("audit_logs_organization_idx").on(table.organizationId),
    index("audit_logs_actor_idx").on(table.actorAuthUserId),
    index("audit_logs_org_occurred_idx").on(table.organizationId, table.occurredAt),
    index("audit_logs_org_action_idx").on(table.organizationId, table.action),
    index("audit_logs_org_target_idx").on(
      table.organizationId,
      table.targetType,
      table.targetId,
    ),
    index("audit_logs_org_subject_idx").on(
      table.organizationId,
      table.subjectType,
      table.subjectId,
    ),
    index("audit_logs_org_entity_idx").on(
      table.organizationId,
      table.entityType,
      table.entityId,
    ),
  ],
);
