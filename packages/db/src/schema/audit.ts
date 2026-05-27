import { index, jsonb, pgTable, text } from "drizzle-orm/pg-core";
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
    entityType: entityTypeEnum("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    action: text("action").notNull(),
    summary: text("summary").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull(),
    ...timestampColumns,
  },
  (table) => [
    index("audit_logs_organization_idx").on(table.organizationId),
    index("audit_logs_actor_idx").on(table.actorAuthUserId),
    index("audit_logs_org_entity_idx").on(
      table.organizationId,
      table.entityType,
      table.entityId,
    ),
  ],
);
