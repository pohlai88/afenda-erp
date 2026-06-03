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
} from "drizzle-orm/pg-core";
import { organizationIdColumn, timestampColumns } from "./dbx-common";
import { hrEmployees } from "./hr";
import { organizations } from "./dbx-organizations";

const organizationReference = () =>
  organizationIdColumn().references(() => organizations.id, {
    onDelete: "cascade",
  });

/** HRM-TCI-002 — supported physical and digital clock sources. */
export const hrTimeClockDeviceTypeEnum = pgEnum("hr_time_clock_device_type", [
  "biometric",
  "card_reader",
  "rfid",
  "kiosk",
  "web",
  "mobile",
  "desktop",
]);

export const hrTimeClockDeviceStatusEnum = pgEnum(
  "hr_time_clock_device_status",
  ["active", "inactive", "offline", "error"],
);

export const hrTimeClockMappingStatusEnum = pgEnum(
  "hr_time_clock_mapping_status",
  ["active", "inactive"],
);

export const hrTimeClockSyncBatchStatusEnum = pgEnum(
  "hr_time_clock_sync_batch_status",
  ["pending", "running", "completed", "failed"],
);

export const hrTimeClockPunchTypeEnum = pgEnum("hr_time_clock_punch_type", [
  "clock_in",
  "clock_out",
  "break_in",
  "break_out",
  "transfer",
  "correction",
]);

export const hrTimeClockPunchValidationStatusEnum = pgEnum(
  "hr_time_clock_punch_validation_status",
  ["pending", "valid", "invalid", "duplicate", "unmatched"],
);

export const hrTimeClockPunchExceptionCodeEnum = pgEnum(
  "hr_time_clock_punch_exception_code",
  [
    "missing_punch",
    "duplicate",
    "early_in",
    "late_in",
    "early_out",
    "unmatched",
    "invalid_employee",
    "unmapped_device",
  ],
);

export const hrTimeClockAuditActionEnum = pgEnum("hr_time_clock_audit_action", [
  "device_registered",
  "device_updated",
  "mapping_created",
  "mapping_updated",
  "mapping_archived",
  "sync_started",
  "sync_completed",
  "sync_failed",
  "punch_captured",
  "punch_exception_recorded",
]);

export type HrTimeClockSyncConfig = {
  enabled?: boolean;
  scheduleCron?: string | null;
  pollIntervalMinutes?: number | null;
  apiEndpoint?: string | null;
  importFormat?: string | null;
  timezone?: string | null;
  retryLimit?: number | null;
};

/** HRM-TCI-003/004 — tenant time clock device registry. */
export const hrTimeClockDevices = pgTable(
  "hr_time_clock_devices",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    externalDeviceId: text("external_device_id").notNull(),
    name: text("name").notNull(),
    deviceType: hrTimeClockDeviceTypeEnum("device_type").notNull(),
    locationCode: text("location_code"),
    status: hrTimeClockDeviceStatusEnum("status")
      .notNull()
      .default("inactive"),
    syncConfig: jsonb("sync_config")
      .$type<HrTimeClockSyncConfig>()
      .notNull()
      .default({ enabled: false }),
    lastSyncAt: timestamp("last_sync_at", { withTimezone: true }),
    apiCredentialRef: text("api_credential_ref"),
    breaksEnabled: boolean("breaks_enabled").notNull().default(false),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_time_clock_devices_org_external_uidx").on(
      table.organizationId,
      table.externalDeviceId,
    ),
    index("hr_time_clock_devices_org_status_idx").on(
      table.organizationId,
      table.status,
    ),
    index("hr_time_clock_devices_org_type_idx").on(
      table.organizationId,
      table.deviceType,
    ),
    index("hr_time_clock_devices_org_location_idx").on(
      table.organizationId,
      table.locationCode,
    ),
  ],
);

/** HRM-TCI-005 — employee identity on external clock systems. */
export const hrTimeClockEmployeeMappings = pgTable(
  "hr_time_clock_employee_mappings",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    deviceId: text("device_id")
      .notNull()
      .references(() => hrTimeClockDevices.id, { onDelete: "cascade" }),
    employeeId: text("employee_id")
      .notNull()
      .references(() => hrEmployees.id, { onDelete: "cascade" }),
    deviceUserId: text("device_user_id"),
    badgeId: text("badge_id"),
    biometricId: text("biometric_id"),
    clockId: text("clock_id"),
    status: hrTimeClockMappingStatusEnum("status")
      .notNull()
      .default("active"),
    ...timestampColumns,
  },
  (table) => [
    index("hr_time_clock_mappings_org_device_idx").on(
      table.organizationId,
      table.deviceId,
    ),
    index("hr_time_clock_mappings_org_employee_idx").on(
      table.organizationId,
      table.employeeId,
    ),
    index("hr_time_clock_mappings_org_status_idx").on(
      table.organizationId,
      table.status,
    ),
    uniqueIndex("hr_time_clock_mappings_org_device_user_uidx").on(
      table.organizationId,
      table.deviceId,
      table.deviceUserId,
    ),
  ],
);

/** HRM-TCI-008/011 — sync batch ledger with idempotency. */
export const hrTimeClockSyncBatches = pgTable(
  "hr_time_clock_sync_batches",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    deviceId: text("device_id")
      .notNull()
      .references(() => hrTimeClockDevices.id, { onDelete: "cascade" }),
    batchKey: text("batch_key").notNull(),
    status: hrTimeClockSyncBatchStatusEnum("status")
      .notNull()
      .default("pending"),
    startedAt: timestamp("started_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    recordCount: integer("record_count").notNull().default(0),
    errorMessage: text("error_message"),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_time_clock_sync_batches_org_batch_uidx").on(
      table.organizationId,
      table.batchKey,
    ),
    index("hr_time_clock_sync_batches_org_device_idx").on(
      table.organizationId,
      table.deviceId,
    ),
    index("hr_time_clock_sync_batches_org_status_idx").on(
      table.organizationId,
      table.status,
    ),
  ],
);

/** HRM-TCI-006/029 — immutable raw punch substrate. */
export const hrTimeClockRawPunches = pgTable(
  "hr_time_clock_raw_punches",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    deviceId: text("device_id")
      .notNull()
      .references(() => hrTimeClockDevices.id, { onDelete: "cascade" }),
    mappingId: text("mapping_id").references(
      () => hrTimeClockEmployeeMappings.id,
      { onDelete: "set null" },
    ),
    employeeId: text("employee_id").references(() => hrEmployees.id, {
      onDelete: "set null",
    }),
    externalPunchId: text("external_punch_id"),
    punchType: hrTimeClockPunchTypeEnum("punch_type").notNull(),
    punchedAt: timestamp("punched_at", { withTimezone: true }).notNull(),
    capturedAt: timestamp("captured_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    source: text("source").notNull().default("device_sync"),
    syncBatchId: text("sync_batch_id").references(
      () => hrTimeClockSyncBatches.id,
      { onDelete: "set null" },
    ),
    idempotencyKey: text("idempotency_key").notNull(),
    validationStatus: hrTimeClockPunchValidationStatusEnum("validation_status")
      .notNull()
      .default("pending"),
    rawPayload: jsonb("raw_payload")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_time_clock_raw_punches_org_idempotency_uidx").on(
      table.organizationId,
      table.idempotencyKey,
    ),
    index("hr_time_clock_raw_punches_org_device_idx").on(
      table.organizationId,
      table.deviceId,
    ),
    index("hr_time_clock_raw_punches_org_employee_idx").on(
      table.organizationId,
      table.employeeId,
    ),
    index("hr_time_clock_raw_punches_org_validation_idx").on(
      table.organizationId,
      table.validationStatus,
    ),
    index("hr_time_clock_raw_punches_org_sync_batch_idx").on(
      table.organizationId,
      table.syncBatchId,
    ),
  ],
);

/** HRM-TCI-017/018/019 — punch exception flags. */
export const hrTimeClockPunchExceptions = pgTable(
  "hr_time_clock_punch_exceptions",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    rawPunchId: text("raw_punch_id")
      .notNull()
      .references(() => hrTimeClockRawPunches.id, { onDelete: "cascade" }),
    exceptionCode: hrTimeClockPunchExceptionCodeEnum("exception_code").notNull(),
    ...timestampColumns,
  },
  (table) => [
    index("hr_time_clock_punch_exceptions_org_raw_idx").on(
      table.organizationId,
      table.rawPunchId,
    ),
    index("hr_time_clock_punch_exceptions_org_code_idx").on(
      table.organizationId,
      table.exceptionCode,
    ),
  ],
);

/** HRM-TCI-030 — append-only audit for device, mapping, sync, and punch actions. */
export const hrTimeClockAuditEvents = pgTable(
  "hr_time_clock_audit_events",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    deviceId: text("device_id").references(() => hrTimeClockDevices.id, {
      onDelete: "set null",
    }),
    mappingId: text("mapping_id").references(
      () => hrTimeClockEmployeeMappings.id,
      { onDelete: "set null" },
    ),
    rawPunchId: text("raw_punch_id").references(
      () => hrTimeClockRawPunches.id,
      { onDelete: "set null" },
    ),
    syncBatchId: text("sync_batch_id").references(
      () => hrTimeClockSyncBatches.id,
      { onDelete: "set null" },
    ),
    employeeId: text("employee_id").references(() => hrEmployees.id, {
      onDelete: "set null",
    }),
    action: hrTimeClockAuditActionEnum("action").notNull(),
    actorAuthUserId: text("actor_auth_user_id"),
    summary: text("summary").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    occurredAt: timestamp("occurred_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    ...timestampColumns,
  },
  (table) => [
    index("hr_time_clock_audit_events_org_occurred_idx").on(
      table.organizationId,
      table.occurredAt,
    ),
    index("hr_time_clock_audit_events_org_device_idx").on(
      table.organizationId,
      table.deviceId,
    ),
    index("hr_time_clock_audit_events_org_employee_idx").on(
      table.organizationId,
      table.employeeId,
    ),
    index("hr_time_clock_audit_events_org_action_idx").on(
      table.organizationId,
      table.action,
    ),
  ],
);
