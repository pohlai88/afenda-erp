import { boolean, index, integer, jsonb, numeric, pgEnum, pgTable, text, timestamp, uniqueIndex, } from "drizzle-orm/pg-core";
import { organizationIdColumn, timestampColumns } from "./dbx-common";
import { hrDepartments, hrEmployees } from "./dbx-hr";
import { organizations } from "./dbx-organizations";
const organizationReference = () => organizationIdColumn().references(() => organizations.id, {
    onDelete: "cascade",
});
export type HrGeoSpoofingSignals = {
    mockProvider?: boolean;
    accuracyTooGood?: boolean;
    timestampDriftSeconds?: number;
    impossibleVelocityKmh?: number;
    clientFlags?: readonly string[];
};
export type HrGeoCheckinPolicyDetails = {
    weakGpsAccuracyMeters: number;
    allowedWindowStartMinutes: number;
    allowedWindowEndMinutes: number;
    requireRegisteredDevice: boolean;
    detectSpoofing: boolean;
    requireSelfie: boolean;
    allowFieldMultiSite: boolean;
    maskPrecisionForNonDetailReaders: boolean;
};
type HrGeoValidationFlagValue =
    | "not_eligible"
    | "outside_geofence"
    | "weak_gps"
    | "missing_gps"
    | "denied_gps"
    | "inaccurate_gps"
    | "spoofing_risk"
    | "unregistered_device"
    | "suspicious_device"
    | "outside_time_window";
/** HRM-GEO-003 — remote check-in action kinds. */
export const hrGeoCheckinActionEnum = pgEnum("hr_geo_checkin_action", [
    "check_in",
    "check_out",
    "break_start",
    "break_end",
]);
/** HRM-GEO-005 — geofence site classification. */
export const hrGeoGeofenceKindEnum = pgEnum("hr_geo_geofence_kind", [
    "office",
    "branch",
    "project",
    "client",
    "field",
    "home",
]);
export const hrGeoValidationFlagEnum = pgEnum("hr_geo_validation_flag", [
    "outside_geofence",
    "weak_gps",
    "missing_gps",
    "denied_gps",
    "inaccurate_gps",
    "spoofing_risk",
    "unregistered_device",
    "suspicious_device",
    "outside_time_window",
    "not_eligible",
]);
export const hrGeoOutcomeStatusEnum = pgEnum("hr_geo_outcome_status", [
    "verified",
    "pending_review",
    "rejected",
    "corrected",
    "voided",
]);
export const hrGeoExceptionStatusEnum = pgEnum("hr_geo_exception_status", [
    "pending",
    "approved",
    "rejected",
    "returned",
    "corrected",
    "cancelled",
]);
export const hrGeoExceptionDecisionEnum = pgEnum("hr_geo_exception_decision", [
    "approve",
    "reject",
    "return",
    "correct",
    "manual_approve",
]);
export const hrGeoDeviceStatusEnum = pgEnum("hr_geo_device_status", [
    "registered",
    "suspended",
    "revoked",
]);
export const hrGeoNotificationKindEnum = pgEnum("hr_geo_notification_kind", [
    "checkin_failed",
    "outside_geofence",
    "pending_exception",
    "exception_approved",
    "exception_rejected",
    "exception_returned",
    "exception_corrected",
    "checkin_verified",
]);
export const hrGeoAuditActionEnum = pgEnum("hr_geo_audit_action", [
    "checkin_captured",
    "location_validated",
    "device_validated",
    "exception_submitted",
    "exception_decided",
    "outcome_corrected",
    "lam_reference_published",
    "payroll_reference_published",
    "policy_updated",
    "geofence_updated",
    "device_registered",
]);
export const hrGeoPolicyGroups = pgTable("hr_geo_policy_groups", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    code: text("code").notNull().default("default"),
    label: text("label").notNull(),
    description: text("description"),
    active: boolean("active").notNull().default(true),
    ...timestampColumns,
}, (table) => [
    uniqueIndex("hr_geo_policy_groups_org_code_uidx").on(table.organizationId, table.code),
    index("hr_geo_policy_groups_org_active_idx").on(table.organizationId, table.active),
]);
/** HRM-GEO-004/005 — approved remote work locations and geofences. */
export const hrGeoGeofences = pgTable("hr_geo_geofences", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    policyGroupCode: text("policy_group_code").notNull().default("default"),
    label: text("label").notNull(),
    geofenceKind: hrGeoGeofenceKindEnum("geofence_kind").notNull(),
    latitude: numeric("latitude", { precision: 10, scale: 7 }).notNull(),
    longitude: numeric("longitude", { precision: 10, scale: 7 }).notNull(),
    radiusMeters: integer("radius_meters").notNull().default(100),
    projectSiteRef: text("project_site_ref"),
    clientSiteRef: text("client_site_ref"),
    employeeId: text("employee_id").references(() => hrEmployees.id, {
        onDelete: "set null",
    }),
    active: boolean("active").notNull().default(true),
    ...timestampColumns,
}, (table) => [
    index("hr_geo_geofences_org_group_idx").on(table.organizationId, table.policyGroupCode),
    index("hr_geo_geofences_org_kind_idx").on(table.organizationId, table.geofenceKind),
    index("hr_geo_geofences_org_employee_idx").on(table.organizationId, table.employeeId),
]);
export const hrGeoCheckinPolicies = pgTable("hr_geo_checkin_policies", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    policyGroupCode: text("policy_group_code").notNull().default("default"),
    label: text("label").notNull(),
    policyDetails: jsonb("policy_details")
        .$type<HrGeoCheckinPolicyDetails>()
        .notNull()
        .default({
        weakGpsAccuracyMeters: 75,
        allowedWindowStartMinutes: 0,
        allowedWindowEndMinutes: 1440,
        requireRegisteredDevice: false,
        detectSpoofing: true,
        requireSelfie: false,
        allowFieldMultiSite: true,
        maskPrecisionForNonDetailReaders: true,
    }),
    active: boolean("active").notNull().default(true),
    ...timestampColumns,
}, (table) => [
    uniqueIndex("hr_geo_checkin_policies_org_group_uidx").on(table.organizationId, table.policyGroupCode),
]);
/** HRM-GEO-008/009 — scoped eligibility for remote check-in. */
export const hrGeoEligibilityRules = pgTable("hr_geo_eligibility_rules", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    policyGroupCode: text("policy_group_code").notNull().default("default"),
    legalEntityCode: text("legal_entity_code"),
    countryCode: text("country_code"),
    workLocationCode: text("work_location_code"),
    departmentId: text("department_id").references(() => hrDepartments.id, {
        onDelete: "set null",
    }),
    roleCode: text("role_code"),
    grade: text("grade"),
    employmentType: text("employment_type"),
    employeeCategory: text("employee_category"),
    eligible: boolean("eligible").notNull().default(true),
    requiresExceptionApproval: boolean("requires_exception_approval")
        .notNull()
        .default(false),
    effectiveFrom: timestamp("effective_from", { withTimezone: true })
        .notNull()
        .defaultNow(),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
    ...timestampColumns,
}, (table) => [
    index("hr_geo_eligibility_rules_org_group_idx").on(table.organizationId, table.policyGroupCode),
    index("hr_geo_eligibility_rules_org_scope_idx").on(table.organizationId, table.legalEntityCode, table.countryCode, table.workLocationCode),
]);
/** HRM-GEO-010/011 — registered device verification. */
export const hrGeoRegisteredDevices = pgTable("hr_geo_registered_devices", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    employeeId: text("employee_id")
        .notNull()
        .references(() => hrEmployees.id, { onDelete: "cascade" }),
    deviceFingerprint: text("device_fingerprint").notNull(),
    deviceLabel: text("device_label"),
    platform: text("platform"),
    status: hrGeoDeviceStatusEnum("status").notNull().default("registered"),
    registeredAt: timestamp("registered_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
    ...timestampColumns,
}, (table) => [
    uniqueIndex("hr_geo_registered_devices_org_fp_uidx").on(table.organizationId, table.deviceFingerprint),
    index("hr_geo_registered_devices_org_employee_idx").on(table.organizationId, table.employeeId),
]);
/** HRM-GEO-002/023 — raw geolocation capture (immutable audit substrate). */
export const hrGeoRawCheckins = pgTable("hr_geo_raw_checkins", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    employeeId: text("employee_id")
        .notNull()
        .references(() => hrEmployees.id, { onDelete: "cascade" }),
    action: hrGeoCheckinActionEnum("action").notNull(),
    capturedAt: timestamp("captured_at", { withTimezone: true }).notNull(),
    latitude: numeric("latitude", { precision: 10, scale: 7 }),
    longitude: numeric("longitude", { precision: 10, scale: 7 }),
    accuracyMeters: numeric("accuracy_meters", { precision: 10, scale: 2 }),
    deviceFingerprint: text("device_fingerprint"),
    deviceReference: text("device_reference"),
    geofenceId: text("geofence_id").references(() => hrGeoGeofences.id, {
        onDelete: "set null",
    }),
    projectSiteRef: text("project_site_ref"),
    clientSiteRef: text("client_site_ref"),
    selfieBlobUrl: text("selfie_blob_url"),
    validationFlags: jsonb("validation_flags")
        .$type<HrGeoValidationFlagValue[]>()
        .notNull()
        .default([]),
    spoofingSignals: jsonb("spoofing_signals").$type<HrGeoSpoofingSignals>(),
    clientMetadata: jsonb("client_metadata").$type<Record<string, unknown>>(),
    idempotencyKey: text("idempotency_key"),
    ...timestampColumns,
}, (table) => [
    index("hr_geo_raw_checkins_org_employee_captured_idx").on(table.organizationId, table.employeeId, table.capturedAt),
    uniqueIndex("hr_geo_raw_checkins_org_idempotency_uidx").on(table.organizationId, table.idempotencyKey),
]);
/** HRM-GEO-023 — approved attendance outcomes separate from raw capture. */
export const hrGeoCheckinOutcomes = pgTable("hr_geo_checkin_outcomes", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    rawCheckinId: text("raw_checkin_id")
        .notNull()
        .references(() => hrGeoRawCheckins.id, { onDelete: "cascade" }),
    employeeId: text("employee_id")
        .notNull()
        .references(() => hrEmployees.id, { onDelete: "cascade" }),
    workDate: timestamp("work_date", { withTimezone: true }).notNull(),
    action: hrGeoCheckinActionEnum("action").notNull(),
    status: hrGeoOutcomeStatusEnum("status").notNull().default("pending_review"),
    geofenceId: text("geofence_id").references(() => hrGeoGeofences.id, {
        onDelete: "set null",
    }),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    lamAttendanceRecordId: text("lam_attendance_record_id"),
    payrollDayReference: text("payroll_day_reference"),
    overtimeReference: text("overtime_reference"),
    decisionReason: text("decision_reason"),
    ...timestampColumns,
}, (table) => [
    index("hr_geo_checkin_outcomes_org_employee_date_idx").on(table.organizationId, table.employeeId, table.workDate),
    index("hr_geo_checkin_outcomes_org_status_idx").on(table.organizationId, table.status),
    uniqueIndex("hr_geo_checkin_outcomes_raw_uidx").on(table.rawCheckinId),
]);
/** HRM-GEO-016..019 — exception workflow. */
export const hrGeoExceptions = pgTable("hr_geo_exceptions", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    rawCheckinId: text("raw_checkin_id")
        .notNull()
        .references(() => hrGeoRawCheckins.id, { onDelete: "cascade" }),
    employeeId: text("employee_id")
        .notNull()
        .references(() => hrEmployees.id, { onDelete: "cascade" }),
    status: hrGeoExceptionStatusEnum("status").notNull().default("pending"),
    submissionReason: text("submission_reason").notNull(),
    decision: hrGeoExceptionDecisionEnum("decision"),
    decisionReason: text("decision_reason"),
    currentApproverAuthUserId: text("current_approver_auth_user_id"),
    submittedAt: timestamp("submitted_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    decidedAt: timestamp("decided_at", { withTimezone: true }),
    outcomeId: text("outcome_id").references(() => hrGeoCheckinOutcomes.id, {
        onDelete: "set null",
    }),
    ...timestampColumns,
}, (table) => [
    index("hr_geo_exceptions_org_status_idx").on(table.organizationId, table.status),
    index("hr_geo_exceptions_org_employee_idx").on(table.organizationId, table.employeeId),
]);
/** HRM-GEO-031 — in-app notifications. */
export const hrGeoNotifications = pgTable("hr_geo_notifications", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    recipientAuthUserId: text("recipient_auth_user_id").notNull(),
    kind: hrGeoNotificationKindEnum("kind").notNull(),
    subjectKind: text("subject_kind").notNull(),
    subjectId: text("subject_id").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    readAt: timestamp("read_at", { withTimezone: true }),
    ...timestampColumns,
}, (table) => [
    index("hr_geo_notifications_org_recipient_idx").on(table.organizationId, table.recipientAuthUserId),
    index("hr_geo_notifications_org_subject_idx").on(table.organizationId, table.subjectKind, table.subjectId),
]);
/** HRM-GEO-032 — audit trail. */
export const hrGeoAuditEvents = pgTable("hr_geo_audit_events", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    action: hrGeoAuditActionEnum("action").notNull(),
    actorAuthUserId: text("actor_auth_user_id"),
    employeeId: text("employee_id").references(() => hrEmployees.id, {
        onDelete: "set null",
    }),
    rawCheckinId: text("raw_checkin_id"),
    outcomeId: text("outcome_id"),
    exceptionId: text("exception_id"),
    auditKey: text("audit_key").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    occurredAt: timestamp("occurred_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    ...timestampColumns,
}, (table) => [
    index("hr_geo_audit_events_org_occurred_idx").on(table.organizationId, table.occurredAt),
    index("hr_geo_audit_events_org_employee_idx").on(table.organizationId, table.employeeId),
]);

