CREATE TYPE "public"."hr_time_clock_audit_action" AS ENUM('device_registered', 'device_updated', 'mapping_created', 'mapping_updated', 'mapping_archived', 'sync_started', 'sync_completed', 'sync_failed', 'punch_captured', 'punch_exception_recorded');--> statement-breakpoint
CREATE TYPE "public"."hr_time_clock_device_status" AS ENUM('active', 'inactive', 'offline', 'error');--> statement-breakpoint
CREATE TYPE "public"."hr_time_clock_device_type" AS ENUM('biometric', 'card_reader', 'rfid', 'kiosk', 'web', 'mobile', 'desktop');--> statement-breakpoint
CREATE TYPE "public"."hr_time_clock_mapping_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."hr_time_clock_punch_exception_code" AS ENUM('missing_punch', 'duplicate', 'early_in', 'late_in', 'early_out', 'unmatched', 'invalid_employee', 'unmapped_device');--> statement-breakpoint
CREATE TYPE "public"."hr_time_clock_punch_type" AS ENUM('clock_in', 'clock_out', 'break_in', 'break_out', 'transfer', 'correction');--> statement-breakpoint
CREATE TYPE "public"."hr_time_clock_punch_validation_status" AS ENUM('pending', 'valid', 'invalid', 'duplicate', 'unmatched');--> statement-breakpoint
CREATE TYPE "public"."hr_time_clock_sync_batch_status" AS ENUM('pending', 'running', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "hr_time_clock_audit_events" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"device_id" text,
	"mapping_id" text,
	"raw_punch_id" text,
	"sync_batch_id" text,
	"employee_id" text,
	"action" "hr_time_clock_audit_action" NOT NULL,
	"actor_auth_user_id" text,
	"summary" text NOT NULL,
	"metadata" jsonb,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_time_clock_devices" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"external_device_id" text NOT NULL,
	"name" text NOT NULL,
	"device_type" "hr_time_clock_device_type" NOT NULL,
	"location_code" text,
	"status" "hr_time_clock_device_status" DEFAULT 'inactive' NOT NULL,
	"sync_config" jsonb DEFAULT '{"enabled":false}'::jsonb NOT NULL,
	"last_sync_at" timestamp with time zone,
	"api_credential_ref" text,
	"breaks_enabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_time_clock_employee_mappings" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"device_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"device_user_id" text,
	"badge_id" text,
	"biometric_id" text,
	"clock_id" text,
	"status" "hr_time_clock_mapping_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_time_clock_punch_exceptions" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"raw_punch_id" text NOT NULL,
	"exception_code" "hr_time_clock_punch_exception_code" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_time_clock_raw_punches" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"device_id" text NOT NULL,
	"mapping_id" text,
	"employee_id" text,
	"external_punch_id" text,
	"punch_type" "hr_time_clock_punch_type" NOT NULL,
	"punched_at" timestamp with time zone NOT NULL,
	"captured_at" timestamp with time zone DEFAULT now() NOT NULL,
	"source" text DEFAULT 'device_sync' NOT NULL,
	"sync_batch_id" text,
	"idempotency_key" text NOT NULL,
	"validation_status" "hr_time_clock_punch_validation_status" DEFAULT 'pending' NOT NULL,
	"raw_payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_time_clock_sync_batches" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"device_id" text NOT NULL,
	"batch_key" text NOT NULL,
	"status" "hr_time_clock_sync_batch_status" DEFAULT 'pending' NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"record_count" integer DEFAULT 0 NOT NULL,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hr_time_clock_audit_events" ADD CONSTRAINT "hr_time_clock_audit_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_time_clock_audit_events" ADD CONSTRAINT "hr_time_clock_audit_events_device_id_hr_time_clock_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."hr_time_clock_devices"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_time_clock_audit_events" ADD CONSTRAINT "hr_time_clock_audit_events_mapping_id_hr_time_clock_employee_mappings_id_fk" FOREIGN KEY ("mapping_id") REFERENCES "public"."hr_time_clock_employee_mappings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_time_clock_audit_events" ADD CONSTRAINT "hr_time_clock_audit_events_raw_punch_id_hr_time_clock_raw_punches_id_fk" FOREIGN KEY ("raw_punch_id") REFERENCES "public"."hr_time_clock_raw_punches"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_time_clock_audit_events" ADD CONSTRAINT "hr_time_clock_audit_events_sync_batch_id_hr_time_clock_sync_batches_id_fk" FOREIGN KEY ("sync_batch_id") REFERENCES "public"."hr_time_clock_sync_batches"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_time_clock_audit_events" ADD CONSTRAINT "hr_time_clock_audit_events_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_time_clock_devices" ADD CONSTRAINT "hr_time_clock_devices_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_time_clock_employee_mappings" ADD CONSTRAINT "hr_time_clock_employee_mappings_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_time_clock_employee_mappings" ADD CONSTRAINT "hr_time_clock_employee_mappings_device_id_hr_time_clock_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."hr_time_clock_devices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_time_clock_employee_mappings" ADD CONSTRAINT "hr_time_clock_employee_mappings_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_time_clock_punch_exceptions" ADD CONSTRAINT "hr_time_clock_punch_exceptions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_time_clock_punch_exceptions" ADD CONSTRAINT "hr_time_clock_punch_exceptions_raw_punch_id_hr_time_clock_raw_punches_id_fk" FOREIGN KEY ("raw_punch_id") REFERENCES "public"."hr_time_clock_raw_punches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_time_clock_raw_punches" ADD CONSTRAINT "hr_time_clock_raw_punches_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_time_clock_raw_punches" ADD CONSTRAINT "hr_time_clock_raw_punches_device_id_hr_time_clock_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."hr_time_clock_devices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_time_clock_raw_punches" ADD CONSTRAINT "hr_time_clock_raw_punches_mapping_id_hr_time_clock_employee_mappings_id_fk" FOREIGN KEY ("mapping_id") REFERENCES "public"."hr_time_clock_employee_mappings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_time_clock_raw_punches" ADD CONSTRAINT "hr_time_clock_raw_punches_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_time_clock_raw_punches" ADD CONSTRAINT "hr_time_clock_raw_punches_sync_batch_id_hr_time_clock_sync_batches_id_fk" FOREIGN KEY ("sync_batch_id") REFERENCES "public"."hr_time_clock_sync_batches"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_time_clock_sync_batches" ADD CONSTRAINT "hr_time_clock_sync_batches_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_time_clock_sync_batches" ADD CONSTRAINT "hr_time_clock_sync_batches_device_id_hr_time_clock_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."hr_time_clock_devices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "hr_time_clock_audit_events_org_occurred_idx" ON "hr_time_clock_audit_events" USING btree ("organization_id","occurred_at");--> statement-breakpoint
CREATE INDEX "hr_time_clock_audit_events_org_device_idx" ON "hr_time_clock_audit_events" USING btree ("organization_id","device_id");--> statement-breakpoint
CREATE INDEX "hr_time_clock_audit_events_org_employee_idx" ON "hr_time_clock_audit_events" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_time_clock_audit_events_org_action_idx" ON "hr_time_clock_audit_events" USING btree ("organization_id","action");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_time_clock_devices_org_external_uidx" ON "hr_time_clock_devices" USING btree ("organization_id","external_device_id");--> statement-breakpoint
CREATE INDEX "hr_time_clock_devices_org_status_idx" ON "hr_time_clock_devices" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "hr_time_clock_devices_org_type_idx" ON "hr_time_clock_devices" USING btree ("organization_id","device_type");--> statement-breakpoint
CREATE INDEX "hr_time_clock_devices_org_location_idx" ON "hr_time_clock_devices" USING btree ("organization_id","location_code");--> statement-breakpoint
CREATE INDEX "hr_time_clock_mappings_org_device_idx" ON "hr_time_clock_employee_mappings" USING btree ("organization_id","device_id");--> statement-breakpoint
CREATE INDEX "hr_time_clock_mappings_org_employee_idx" ON "hr_time_clock_employee_mappings" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_time_clock_mappings_org_status_idx" ON "hr_time_clock_employee_mappings" USING btree ("organization_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_time_clock_mappings_org_device_user_uidx" ON "hr_time_clock_employee_mappings" USING btree ("organization_id","device_id","device_user_id");--> statement-breakpoint
CREATE INDEX "hr_time_clock_punch_exceptions_org_raw_idx" ON "hr_time_clock_punch_exceptions" USING btree ("organization_id","raw_punch_id");--> statement-breakpoint
CREATE INDEX "hr_time_clock_punch_exceptions_org_code_idx" ON "hr_time_clock_punch_exceptions" USING btree ("organization_id","exception_code");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_time_clock_raw_punches_org_idempotency_uidx" ON "hr_time_clock_raw_punches" USING btree ("organization_id","idempotency_key");--> statement-breakpoint
CREATE INDEX "hr_time_clock_raw_punches_org_device_idx" ON "hr_time_clock_raw_punches" USING btree ("organization_id","device_id");--> statement-breakpoint
CREATE INDEX "hr_time_clock_raw_punches_org_employee_idx" ON "hr_time_clock_raw_punches" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_time_clock_raw_punches_org_validation_idx" ON "hr_time_clock_raw_punches" USING btree ("organization_id","validation_status");--> statement-breakpoint
CREATE INDEX "hr_time_clock_raw_punches_org_sync_batch_idx" ON "hr_time_clock_raw_punches" USING btree ("organization_id","sync_batch_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_time_clock_sync_batches_org_batch_uidx" ON "hr_time_clock_sync_batches" USING btree ("organization_id","batch_key");--> statement-breakpoint
CREATE INDEX "hr_time_clock_sync_batches_org_device_idx" ON "hr_time_clock_sync_batches" USING btree ("organization_id","device_id");--> statement-breakpoint
CREATE INDEX "hr_time_clock_sync_batches_org_status_idx" ON "hr_time_clock_sync_batches" USING btree ("organization_id","status");