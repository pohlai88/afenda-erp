CREATE TYPE "public"."hr_geo_audit_action" AS ENUM('checkin_captured', 'location_validated', 'device_validated', 'exception_submitted', 'exception_decided', 'outcome_corrected', 'lam_reference_published', 'payroll_reference_published', 'policy_updated', 'geofence_updated', 'device_registered');--> statement-breakpoint
CREATE TYPE "public"."hr_geo_checkin_action" AS ENUM('check_in', 'check_out', 'break_start', 'break_end');--> statement-breakpoint
CREATE TYPE "public"."hr_geo_device_status" AS ENUM('registered', 'suspended', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."hr_geo_exception_decision" AS ENUM('approve', 'reject', 'return', 'correct', 'manual_approve');--> statement-breakpoint
CREATE TYPE "public"."hr_geo_exception_status" AS ENUM('pending', 'approved', 'rejected', 'returned', 'corrected', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."hr_geo_geofence_kind" AS ENUM('office', 'branch', 'project', 'client', 'field', 'home');--> statement-breakpoint
CREATE TYPE "public"."hr_geo_notification_kind" AS ENUM('checkin_failed', 'outside_geofence', 'pending_exception', 'exception_approved', 'exception_rejected', 'exception_returned', 'exception_corrected', 'checkin_verified');--> statement-breakpoint
CREATE TYPE "public"."hr_geo_outcome_status" AS ENUM('verified', 'pending_review', 'rejected', 'corrected', 'voided');--> statement-breakpoint
CREATE TYPE "public"."hr_geo_validation_flag" AS ENUM('outside_geofence', 'weak_gps', 'missing_gps', 'denied_gps', 'inaccurate_gps', 'spoofing_risk', 'unregistered_device', 'suspicious_device', 'outside_time_window', 'not_eligible');--> statement-breakpoint
ALTER TYPE "public"."hr_attendance_source" ADD VALUE 'mobile';--> statement-breakpoint
CREATE TABLE "hr_geo_audit_events" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"action" "hr_geo_audit_action" NOT NULL,
	"actor_auth_user_id" text,
	"employee_id" text,
	"raw_checkin_id" text,
	"outcome_id" text,
	"exception_id" text,
	"audit_key" text NOT NULL,
	"metadata" jsonb,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_geo_checkin_outcomes" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"raw_checkin_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"work_date" timestamp with time zone NOT NULL,
	"action" "hr_geo_checkin_action" NOT NULL,
	"status" "hr_geo_outcome_status" DEFAULT 'pending_review' NOT NULL,
	"geofence_id" text,
	"verified_at" timestamp with time zone,
	"lam_attendance_record_id" text,
	"payroll_day_reference" text,
	"overtime_reference" text,
	"decision_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_geo_checkin_policies" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"policy_group_code" text DEFAULT 'default' NOT NULL,
	"label" text NOT NULL,
	"policy_details" jsonb DEFAULT '{"weakGpsAccuracyMeters":75,"allowedWindowStartMinutes":0,"allowedWindowEndMinutes":1440,"requireRegisteredDevice":false,"detectSpoofing":true,"requireSelfie":false,"allowFieldMultiSite":true,"maskPrecisionForNonDetailReaders":true}'::jsonb NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_geo_eligibility_rules" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"policy_group_code" text DEFAULT 'default' NOT NULL,
	"legal_entity_code" text,
	"country_code" text,
	"work_location_code" text,
	"department_id" text,
	"role_code" text,
	"grade" text,
	"employment_type" text,
	"employee_category" text,
	"eligible" boolean DEFAULT true NOT NULL,
	"requires_exception_approval" boolean DEFAULT false NOT NULL,
	"effective_from" timestamp with time zone DEFAULT now() NOT NULL,
	"effective_to" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_geo_exceptions" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"raw_checkin_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"status" "hr_geo_exception_status" DEFAULT 'pending' NOT NULL,
	"submission_reason" text NOT NULL,
	"decision" "hr_geo_exception_decision",
	"decision_reason" text,
	"current_approver_auth_user_id" text,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"decided_at" timestamp with time zone,
	"outcome_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_geo_geofences" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"policy_group_code" text DEFAULT 'default' NOT NULL,
	"label" text NOT NULL,
	"geofence_kind" "hr_geo_geofence_kind" NOT NULL,
	"latitude" numeric(10, 7) NOT NULL,
	"longitude" numeric(10, 7) NOT NULL,
	"radius_meters" integer DEFAULT 100 NOT NULL,
	"project_site_ref" text,
	"client_site_ref" text,
	"employee_id" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_geo_notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"recipient_auth_user_id" text NOT NULL,
	"kind" "hr_geo_notification_kind" NOT NULL,
	"subject_kind" text NOT NULL,
	"subject_id" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_geo_policy_groups" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"code" text DEFAULT 'default' NOT NULL,
	"label" text NOT NULL,
	"description" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_geo_raw_checkins" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"action" "hr_geo_checkin_action" NOT NULL,
	"captured_at" timestamp with time zone NOT NULL,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"accuracy_meters" numeric(10, 2),
	"device_fingerprint" text,
	"device_reference" text,
	"geofence_id" text,
	"project_site_ref" text,
	"client_site_ref" text,
	"selfie_blob_url" text,
	"validation_flags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"spoofing_signals" jsonb,
	"client_metadata" jsonb,
	"idempotency_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_geo_registered_devices" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"device_fingerprint" text NOT NULL,
	"device_label" text,
	"platform" text,
	"status" "hr_geo_device_status" DEFAULT 'registered' NOT NULL,
	"registered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hr_geo_audit_events" ADD CONSTRAINT "hr_geo_audit_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_geo_audit_events" ADD CONSTRAINT "hr_geo_audit_events_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_geo_checkin_outcomes" ADD CONSTRAINT "hr_geo_checkin_outcomes_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_geo_checkin_outcomes" ADD CONSTRAINT "hr_geo_checkin_outcomes_raw_checkin_id_hr_geo_raw_checkins_id_fk" FOREIGN KEY ("raw_checkin_id") REFERENCES "public"."hr_geo_raw_checkins"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_geo_checkin_outcomes" ADD CONSTRAINT "hr_geo_checkin_outcomes_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_geo_checkin_outcomes" ADD CONSTRAINT "hr_geo_checkin_outcomes_geofence_id_hr_geo_geofences_id_fk" FOREIGN KEY ("geofence_id") REFERENCES "public"."hr_geo_geofences"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_geo_checkin_policies" ADD CONSTRAINT "hr_geo_checkin_policies_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_geo_eligibility_rules" ADD CONSTRAINT "hr_geo_eligibility_rules_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_geo_eligibility_rules" ADD CONSTRAINT "hr_geo_eligibility_rules_department_id_hr_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."hr_departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_geo_exceptions" ADD CONSTRAINT "hr_geo_exceptions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_geo_exceptions" ADD CONSTRAINT "hr_geo_exceptions_raw_checkin_id_hr_geo_raw_checkins_id_fk" FOREIGN KEY ("raw_checkin_id") REFERENCES "public"."hr_geo_raw_checkins"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_geo_exceptions" ADD CONSTRAINT "hr_geo_exceptions_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_geo_exceptions" ADD CONSTRAINT "hr_geo_exceptions_outcome_id_hr_geo_checkin_outcomes_id_fk" FOREIGN KEY ("outcome_id") REFERENCES "public"."hr_geo_checkin_outcomes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_geo_geofences" ADD CONSTRAINT "hr_geo_geofences_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_geo_geofences" ADD CONSTRAINT "hr_geo_geofences_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_geo_notifications" ADD CONSTRAINT "hr_geo_notifications_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_geo_policy_groups" ADD CONSTRAINT "hr_geo_policy_groups_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_geo_raw_checkins" ADD CONSTRAINT "hr_geo_raw_checkins_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_geo_raw_checkins" ADD CONSTRAINT "hr_geo_raw_checkins_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_geo_raw_checkins" ADD CONSTRAINT "hr_geo_raw_checkins_geofence_id_hr_geo_geofences_id_fk" FOREIGN KEY ("geofence_id") REFERENCES "public"."hr_geo_geofences"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_geo_registered_devices" ADD CONSTRAINT "hr_geo_registered_devices_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_geo_registered_devices" ADD CONSTRAINT "hr_geo_registered_devices_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "hr_geo_audit_events_org_occurred_idx" ON "hr_geo_audit_events" USING btree ("organization_id","occurred_at");--> statement-breakpoint
CREATE INDEX "hr_geo_audit_events_org_employee_idx" ON "hr_geo_audit_events" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_geo_checkin_outcomes_org_employee_date_idx" ON "hr_geo_checkin_outcomes" USING btree ("organization_id","employee_id","work_date");--> statement-breakpoint
CREATE INDEX "hr_geo_checkin_outcomes_org_status_idx" ON "hr_geo_checkin_outcomes" USING btree ("organization_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_geo_checkin_outcomes_raw_uidx" ON "hr_geo_checkin_outcomes" USING btree ("raw_checkin_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_geo_checkin_policies_org_group_uidx" ON "hr_geo_checkin_policies" USING btree ("organization_id","policy_group_code");--> statement-breakpoint
CREATE INDEX "hr_geo_eligibility_rules_org_group_idx" ON "hr_geo_eligibility_rules" USING btree ("organization_id","policy_group_code");--> statement-breakpoint
CREATE INDEX "hr_geo_eligibility_rules_org_scope_idx" ON "hr_geo_eligibility_rules" USING btree ("organization_id","legal_entity_code","country_code","work_location_code");--> statement-breakpoint
CREATE INDEX "hr_geo_exceptions_org_status_idx" ON "hr_geo_exceptions" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "hr_geo_exceptions_org_employee_idx" ON "hr_geo_exceptions" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_geo_geofences_org_group_idx" ON "hr_geo_geofences" USING btree ("organization_id","policy_group_code");--> statement-breakpoint
CREATE INDEX "hr_geo_geofences_org_kind_idx" ON "hr_geo_geofences" USING btree ("organization_id","geofence_kind");--> statement-breakpoint
CREATE INDEX "hr_geo_geofences_org_employee_idx" ON "hr_geo_geofences" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_geo_notifications_org_recipient_idx" ON "hr_geo_notifications" USING btree ("organization_id","recipient_auth_user_id");--> statement-breakpoint
CREATE INDEX "hr_geo_notifications_org_subject_idx" ON "hr_geo_notifications" USING btree ("organization_id","subject_kind","subject_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_geo_policy_groups_org_code_uidx" ON "hr_geo_policy_groups" USING btree ("organization_id","code");--> statement-breakpoint
CREATE INDEX "hr_geo_policy_groups_org_active_idx" ON "hr_geo_policy_groups" USING btree ("organization_id","active");--> statement-breakpoint
CREATE INDEX "hr_geo_raw_checkins_org_employee_captured_idx" ON "hr_geo_raw_checkins" USING btree ("organization_id","employee_id","captured_at");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_geo_raw_checkins_org_idempotency_uidx" ON "hr_geo_raw_checkins" USING btree ("organization_id","idempotency_key");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_geo_registered_devices_org_fp_uidx" ON "hr_geo_registered_devices" USING btree ("organization_id","device_fingerprint");--> statement-breakpoint
CREATE INDEX "hr_geo_registered_devices_org_employee_idx" ON "hr_geo_registered_devices" USING btree ("organization_id","employee_id");