import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import {
  entityTypeEnum,
  organizationIdColumn,
  organizationRoleEnum,
  timestampColumns,
} from "./common";
import { organizations } from "./organizations";

export const invitationStatusEnum = pgEnum("organization_invitation_status", [
  "pending",
  "accepted",
  "revoked",
  "expired",
]);

export const apiCredentialStatusEnum = pgEnum("api_credential_status", [
  "active",
  "revoked",
]);

export const webhookDeliveryStatusEnum = pgEnum("webhook_delivery_status", [
  "pending",
  "delivered",
  "failed",
]);

export const systemAdminReadinessEnum = pgEnum("system_admin_readiness", [
  "preview",
  "active",
  "blocked",
  "deprecated",
]);

export const systemAdminAvailabilityEnum = pgEnum("system_admin_availability", [
  "enabled",
  "disabled",
  "preview",
]);

export const cronRunStatusEnum = pgEnum("cron_run_status", [
  "started",
  "success",
  "failed",
  "rejected",
]);

export const tenantSettings = pgTable(
  "tenant_settings",
  {
    organizationId: organizationIdColumn()
      .primaryKey()
      .references(() => organizations.id, { onDelete: "cascade" }),
    timezone: text("timezone").notNull().default("UTC"),
    locale: text("locale").notNull().default("en-US"),
    currency: text("currency").notNull().default("USD"),
    fiscalYearStartMonth: integer("fiscal_year_start_month").notNull().default(1),
    branding: jsonb("branding")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    zdrEnabled: boolean("zdr_enabled").notNull().default(false),
    dataRegion: text("data_region").notNull().default("auto"),
    operatingCalendar: jsonb("operating_calendar")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    numbering: jsonb("numbering")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    documentPrefixes: jsonb("document_prefixes")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    ...timestampColumns,
  },
);

export const tenantCapabilitySettings = pgTable(
  "tenant_capability_settings",
  {
    organizationId: organizationIdColumn()
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    capabilityKey: text("capability_key").notNull(),
    availability: systemAdminAvailabilityEnum("availability")
      .notNull()
      .default("enabled"),
    ...timestampColumns,
  },
  (table) => [
    primaryKey({
      columns: [table.organizationId, table.capabilityKey],
      name: "tenant_capability_settings_pk",
    }),
    index("tenant_capability_settings_org_idx").on(table.organizationId),
  ],
);

export const tenantModuleSettings = pgTable(
  "tenant_module_settings",
  {
    organizationId: organizationIdColumn()
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    moduleKey: text("module_key").notNull(),
    enabled: boolean("enabled").notNull().default(true),
    visible: boolean("visible").notNull().default(true),
    readiness: systemAdminReadinessEnum("readiness").notNull().default("active"),
    configuration: jsonb("configuration")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    ...timestampColumns,
  },
  (table) => [
    primaryKey({
      columns: [table.organizationId, table.moduleKey],
      name: "tenant_module_settings_pk",
    }),
    index("tenant_module_settings_org_idx").on(table.organizationId),
  ],
);

export const tenantPolicySettings = pgTable(
  "tenant_policy_settings",
  {
    id: text("id").primaryKey(),
    organizationId: organizationIdColumn()
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    policyKey: text("policy_key").notNull(),
    label: text("label").notNull(),
    enabled: boolean("enabled").notNull().default(true),
    readiness: systemAdminReadinessEnum("readiness").notNull().default("active"),
    configuration: jsonb("configuration")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("tenant_policy_settings_org_key_idx").on(
      table.organizationId,
      table.policyKey,
    ),
    index("tenant_policy_settings_org_idx").on(table.organizationId),
  ],
);

export const tenantApprovalSettings = pgTable(
  "tenant_approval_settings",
  {
    id: text("id").primaryKey(),
    organizationId: organizationIdColumn()
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    approvalKey: text("approval_key").notNull(),
    label: text("label").notNull(),
    enabled: boolean("enabled").notNull().default(true),
    approverRole: organizationRoleEnum("approver_role"),
    escalationMinutes: integer("escalation_minutes"),
    configuration: jsonb("configuration")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("tenant_approval_settings_org_key_idx").on(
      table.organizationId,
      table.approvalKey,
    ),
    index("tenant_approval_settings_org_idx").on(table.organizationId),
  ],
);

export const tenantSecuritySettings = pgTable("tenant_security_settings", {
  organizationId: organizationIdColumn()
    .primaryKey()
    .references(() => organizations.id, { onDelete: "cascade" }),
  mfaRequired: boolean("mfa_required").notNull().default(false),
  trustedDomains: jsonb("trusted_domains")
    .$type<readonly string[]>()
    .notNull()
    .default([]),
  sensitiveActionConfirmation: boolean("sensitive_action_confirmation")
    .notNull()
    .default(true),
  sessionPolicy: jsonb("session_policy")
    .$type<Record<string, unknown>>()
    .notNull()
    .default({}),
  ...timestampColumns,
});

export const tenantRoleOverrides = pgTable(
  "tenant_role_overrides",
  {
    organizationId: organizationIdColumn()
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    role: organizationRoleEnum("role").notNull(),
    permissionKey: text("permission_key").notNull(),
    enabled: boolean("enabled").notNull(),
    ...timestampColumns,
  },
  (table) => [
    primaryKey({
      columns: [table.organizationId, table.role, table.permissionKey],
      name: "tenant_role_overrides_pk",
    }),
    index("tenant_role_overrides_org_idx").on(table.organizationId),
  ],
);

export const organizationInvitations = pgTable(
  "organization_invitations",
  {
    id: text("id").primaryKey(),
    organizationId: organizationIdColumn()
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: organizationRoleEnum("role").notNull(),
    tokenHash: text("token_hash").notNull(),
    status: invitationStatusEnum("status").notNull().default("pending"),
    invitedByAuthUserId: text("invited_by_auth_user_id").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("organization_invitations_org_email_idx").on(
      table.organizationId,
      table.email,
    ),
    index("organization_invitations_org_status_idx").on(
      table.organizationId,
      table.status,
    ),
  ],
);

export const retentionPolicies = pgTable(
  "retention_policies",
  {
    organizationId: organizationIdColumn()
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    entityType: entityTypeEnum("entity_type").notNull(),
    retentionDays: integer("retention_days").notNull(),
    legalHold: boolean("legal_hold").notNull().default(false),
    ...timestampColumns,
  },
  (table) => [
    primaryKey({
      columns: [table.organizationId, table.entityType],
      name: "retention_policies_pk",
    }),
  ],
);

export const apiCredentials = pgTable(
  "api_credentials",
  {
    id: text("id").primaryKey(),
    organizationId: organizationIdColumn()
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    keyPrefix: text("key_prefix").notNull(),
    keyHash: text("key_hash").notNull(),
    scopes: jsonb("scopes").$type<readonly string[]>().notNull().default([]),
    status: apiCredentialStatusEnum("status").notNull().default("active"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    createdByAuthUserId: text("created_by_auth_user_id").notNull(),
    ...timestampColumns,
  },
  (table) => [
    index("api_credentials_org_idx").on(table.organizationId),
    uniqueIndex("api_credentials_org_prefix_idx").on(
      table.organizationId,
      table.keyPrefix,
    ),
  ],
);

export const webhooks = pgTable(
  "webhooks",
  {
    id: text("id").primaryKey(),
    organizationId: organizationIdColumn()
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    url: text("url").notNull(),
    signingSecretHash: text("signing_secret_hash").notNull(),
    signingSecretCiphertext: text("signing_secret_ciphertext"),
    eventFilters: jsonb("event_filters")
      .$type<readonly string[]>()
      .notNull()
      .default([]),
    enabled: boolean("enabled").notNull().default(true),
    createdByAuthUserId: text("created_by_auth_user_id").notNull(),
    ...timestampColumns,
  },
  (table) => [index("webhooks_org_idx").on(table.organizationId)],
);

export const webhookDeliveries = pgTable(
  "webhook_deliveries",
  {
    id: text("id").primaryKey(),
    organizationId: organizationIdColumn()
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    webhookId: text("webhook_id")
      .notNull()
      .references(() => webhooks.id, { onDelete: "cascade" }),
    eventType: text("event_type").notNull(),
    status: webhookDeliveryStatusEnum("status").notNull().default("pending"),
    attemptCount: integer("attempt_count").notNull().default(1),
    retryOutcome: text("retry_outcome"),
    responseCode: integer("response_code"),
    errorMessage: text("error_message"),
    ...timestampColumns,
  },
  (table) => [
    index("webhook_deliveries_org_webhook_idx").on(
      table.organizationId,
      table.webhookId,
    ),
  ],
);

export const ssoConnections = pgTable(
  "sso_connections",
  {
    id: text("id").primaryKey(),
    organizationId: organizationIdColumn()
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    idpMetadataUrl: text("idp_metadata_url"),
    audience: text("audience"),
    enabled: boolean("enabled").notNull().default(false),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("sso_connections_org_provider_idx").on(
      table.organizationId,
      table.provider,
    ),
  ],
);

export const cronRunHistory = pgTable(
  "cron_run_history",
  {
    id: text("id").primaryKey(),
    jobName: text("job_name").notNull(),
    route: text("route").notNull(),
    operation: text("operation").notNull(),
    status: cronRunStatusEnum("status").notNull().default("started"),
    requestId: text("request_id"),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    durationMs: integer("duration_ms"),
    result: jsonb("result").$type<Record<string, unknown>>().notNull().default({}),
    errorMessage: text("error_message"),
    ...timestampColumns,
  },
  (table) => [
    index("cron_run_history_job_started_idx").on(table.jobName, table.startedAt),
    index("cron_run_history_status_idx").on(table.status),
  ],
);

export const tenantSettingsRelations = relations(tenantSettings, ({ one }) => ({
  organization: one(organizations, {
    fields: [tenantSettings.organizationId],
    references: [organizations.id],
  }),
}));
