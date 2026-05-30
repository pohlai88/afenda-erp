CREATE TYPE "public"."hr_fwa_approval_stage_kind" AS ENUM('manager', 'hr', 'department', 'exception');--> statement-breakpoint
CREATE TYPE "public"."hr_fwa_approval_stage_status" AS ENUM('pending', 'approved', 'rejected', 'skipped');--> statement-breakpoint
CREATE TYPE "public"."hr_fwa_arrangement_kind" AS ENUM('hybrid', 'remote', 'compressed_week', 'flexible_hours', 'staggered_hours', 'part_time', 'temporary');--> statement-breakpoint
CREATE TYPE "public"."hr_fwa_arrangement_status" AS ENUM('draft', 'pending', 'active', 'suspended', 'terminated', 'expired');--> statement-breakpoint
CREATE TYPE "public"."hr_fwa_audit_action" AS ENUM('request_submitted', 'eligibility_validated', 'eligibility_failed', 'approval', 'rejection', 'returned', 'renewal', 'suspension', 'termination', 'exception_approved', 'compliance_breach', 'schedule_updated', 'payroll_reference');--> statement-breakpoint
CREATE TYPE "public"."hr_fwa_compliance_breach_kind" AS ENUM('excessive_remote_days', 'missed_office_days', 'unapproved_remote_location', 'incomplete_attendance', 'working_hours_non_compliance');--> statement-breakpoint
CREATE TYPE "public"."hr_fwa_compliance_breach_status" AS ENUM('open', 'acknowledged', 'resolved', 'waived');--> statement-breakpoint
CREATE TYPE "public"."hr_fwa_notification_kind" AS ENUM('request_submitted', 'request_approved', 'request_rejected', 'request_returned', 'arrangement_expiring', 'arrangement_renewed', 'arrangement_suspended', 'arrangement_terminated', 'compliance_breach', 'review_due');--> statement-breakpoint
CREATE TYPE "public"."hr_fwa_remote_location_kind" AS ENUM('home_office', 'client_site', 'branch', 'project_site', 'other');--> statement-breakpoint
CREATE TYPE "public"."hr_fwa_request_initiator" AS ENUM('employee', 'manager', 'hr');--> statement-breakpoint
CREATE TYPE "public"."hr_fwa_request_status" AS ENUM('pending', 'returned', 'approved', 'rejected', 'cancelled');--> statement-breakpoint
CREATE TABLE "hr_fwa_approval_stages" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"request_id" text NOT NULL,
	"stage_kind" "hr_fwa_approval_stage_kind" NOT NULL,
	"title" text NOT NULL,
	"assignee_role" text,
	"assignee_auth_user_id" text,
	"status" "hr_fwa_approval_stage_status" DEFAULT 'pending' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"decided_at" timestamp with time zone,
	"decision_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_fwa_arrangement_type_configs" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"policy_group_code" text DEFAULT 'default' NOT NULL,
	"arrangement_kind" "hr_fwa_arrangement_kind" NOT NULL,
	"label" text NOT NULL,
	"description" text,
	"requires_supporting_document" boolean DEFAULT false NOT NULL,
	"requires_remote_location" boolean DEFAULT false NOT NULL,
	"min_duration_days" integer,
	"max_duration_days" integer,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_fwa_arrangements" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"request_id" text,
	"arrangement_kind" "hr_fwa_arrangement_kind" NOT NULL,
	"policy_group_code" text DEFAULT 'default' NOT NULL,
	"status" "hr_fwa_arrangement_status" DEFAULT 'active' NOT NULL,
	"effective_from" timestamp with time zone NOT NULL,
	"effective_to" timestamp with time zone,
	"review_date" timestamp with time zone,
	"renewal_date" timestamp with time zone,
	"schedule_pattern_id" text,
	"remote_location_id" text,
	"reason" text,
	"exception_approved" boolean DEFAULT false NOT NULL,
	"exception_reason" text,
	"suspended_at" timestamp with time zone,
	"suspension_reason" text,
	"terminated_at" timestamp with time zone,
	"termination_reason" text,
	"payroll_reference" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_fwa_audit_events" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"arrangement_id" text,
	"request_id" text,
	"employee_id" text,
	"action" "hr_fwa_audit_action" NOT NULL,
	"actor_auth_user_id" text,
	"actor_employee_id" text,
	"summary" text NOT NULL,
	"metadata" jsonb,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_fwa_compliance_breaches" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"arrangement_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"breach_kind" "hr_fwa_compliance_breach_kind" NOT NULL,
	"status" "hr_fwa_compliance_breach_status" DEFAULT 'open' NOT NULL,
	"period_start" timestamp with time zone NOT NULL,
	"period_end" timestamp with time zone NOT NULL,
	"expected_value" text,
	"actual_value" text,
	"description" text NOT NULL,
	"detected_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone,
	"resolution_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_fwa_eligibility_rules" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"policy_group_code" text DEFAULT 'default' NOT NULL,
	"arrangement_kind" "hr_fwa_arrangement_kind",
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
CREATE TABLE "hr_fwa_notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"recipient_auth_user_id" text NOT NULL,
	"kind" "hr_fwa_notification_kind" NOT NULL,
	"subject_type" text NOT NULL,
	"subject_id" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_fwa_policy_groups" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"code" text NOT NULL,
	"label" text NOT NULL,
	"description" text,
	"min_office_days_per_week" integer,
	"max_remote_days_per_week" integer,
	"require_hr_approval" boolean DEFAULT true NOT NULL,
	"require_department_approval" boolean DEFAULT false NOT NULL,
	"allow_exception_approval" boolean DEFAULT true NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_fwa_remote_locations" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"label" text NOT NULL,
	"location_kind" "hr_fwa_remote_location_kind" DEFAULT 'home_office' NOT NULL,
	"country_code" text,
	"region_code" text,
	"address_line" text,
	"is_approved" boolean DEFAULT false NOT NULL,
	"approved_at" timestamp with time zone,
	"approved_by_auth_user_id" text,
	"restriction_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_fwa_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"arrangement_kind" "hr_fwa_arrangement_kind" NOT NULL,
	"policy_group_code" text DEFAULT 'default' NOT NULL,
	"status" "hr_fwa_request_status" DEFAULT 'pending' NOT NULL,
	"initiator_kind" "hr_fwa_request_initiator" DEFAULT 'employee' NOT NULL,
	"initiator_employee_id" text,
	"initiator_auth_user_id" text,
	"reason" text,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone,
	"schedule_pattern_id" text,
	"remote_location_id" text,
	"supporting_document_id" text,
	"approval_stage" "hr_fwa_approval_stage_kind" DEFAULT 'manager' NOT NULL,
	"current_approver_auth_user_id" text,
	"eligibility_snapshot" jsonb,
	"policy_snapshot" jsonb,
	"exception_requested" boolean DEFAULT false NOT NULL,
	"rejection_reason" text,
	"decision_note" text,
	"returned_note" text,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"decided_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_fwa_schedule_patterns" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"employee_id" text,
	"label" text,
	"pattern_details" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hr_fwa_approval_stages" ADD CONSTRAINT "hr_fwa_approval_stages_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_fwa_approval_stages" ADD CONSTRAINT "hr_fwa_approval_stages_request_id_hr_fwa_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."hr_fwa_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_fwa_arrangement_type_configs" ADD CONSTRAINT "hr_fwa_arrangement_type_configs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_fwa_arrangements" ADD CONSTRAINT "hr_fwa_arrangements_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_fwa_arrangements" ADD CONSTRAINT "hr_fwa_arrangements_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_fwa_arrangements" ADD CONSTRAINT "hr_fwa_arrangements_request_id_hr_fwa_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."hr_fwa_requests"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_fwa_arrangements" ADD CONSTRAINT "hr_fwa_arrangements_schedule_pattern_id_hr_fwa_schedule_patterns_id_fk" FOREIGN KEY ("schedule_pattern_id") REFERENCES "public"."hr_fwa_schedule_patterns"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_fwa_arrangements" ADD CONSTRAINT "hr_fwa_arrangements_remote_location_id_hr_fwa_remote_locations_id_fk" FOREIGN KEY ("remote_location_id") REFERENCES "public"."hr_fwa_remote_locations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_fwa_audit_events" ADD CONSTRAINT "hr_fwa_audit_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_fwa_audit_events" ADD CONSTRAINT "hr_fwa_audit_events_arrangement_id_hr_fwa_arrangements_id_fk" FOREIGN KEY ("arrangement_id") REFERENCES "public"."hr_fwa_arrangements"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_fwa_audit_events" ADD CONSTRAINT "hr_fwa_audit_events_request_id_hr_fwa_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."hr_fwa_requests"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_fwa_audit_events" ADD CONSTRAINT "hr_fwa_audit_events_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_fwa_compliance_breaches" ADD CONSTRAINT "hr_fwa_compliance_breaches_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_fwa_compliance_breaches" ADD CONSTRAINT "hr_fwa_compliance_breaches_arrangement_id_hr_fwa_arrangements_id_fk" FOREIGN KEY ("arrangement_id") REFERENCES "public"."hr_fwa_arrangements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_fwa_compliance_breaches" ADD CONSTRAINT "hr_fwa_compliance_breaches_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_fwa_eligibility_rules" ADD CONSTRAINT "hr_fwa_eligibility_rules_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_fwa_eligibility_rules" ADD CONSTRAINT "hr_fwa_eligibility_rules_department_id_hr_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."hr_departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_fwa_notifications" ADD CONSTRAINT "hr_fwa_notifications_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_fwa_policy_groups" ADD CONSTRAINT "hr_fwa_policy_groups_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_fwa_remote_locations" ADD CONSTRAINT "hr_fwa_remote_locations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_fwa_remote_locations" ADD CONSTRAINT "hr_fwa_remote_locations_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_fwa_requests" ADD CONSTRAINT "hr_fwa_requests_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_fwa_requests" ADD CONSTRAINT "hr_fwa_requests_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_fwa_requests" ADD CONSTRAINT "hr_fwa_requests_schedule_pattern_id_hr_fwa_schedule_patterns_id_fk" FOREIGN KEY ("schedule_pattern_id") REFERENCES "public"."hr_fwa_schedule_patterns"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_fwa_requests" ADD CONSTRAINT "hr_fwa_requests_remote_location_id_hr_fwa_remote_locations_id_fk" FOREIGN KEY ("remote_location_id") REFERENCES "public"."hr_fwa_remote_locations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_fwa_requests" ADD CONSTRAINT "hr_fwa_requests_supporting_document_id_hr_employee_documents_id_fk" FOREIGN KEY ("supporting_document_id") REFERENCES "public"."hr_employee_documents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_fwa_schedule_patterns" ADD CONSTRAINT "hr_fwa_schedule_patterns_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_fwa_schedule_patterns" ADD CONSTRAINT "hr_fwa_schedule_patterns_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "hr_fwa_approval_stages_org_request_idx" ON "hr_fwa_approval_stages" USING btree ("organization_id","request_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_fwa_approval_stages_request_kind_uidx" ON "hr_fwa_approval_stages" USING btree ("request_id","stage_kind");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_fwa_type_configs_org_group_kind_uidx" ON "hr_fwa_arrangement_type_configs" USING btree ("organization_id","policy_group_code","arrangement_kind");--> statement-breakpoint
CREATE INDEX "hr_fwa_type_configs_org_group_idx" ON "hr_fwa_arrangement_type_configs" USING btree ("organization_id","policy_group_code");--> statement-breakpoint
CREATE INDEX "hr_fwa_type_configs_org_active_idx" ON "hr_fwa_arrangement_type_configs" USING btree ("organization_id","active");--> statement-breakpoint
CREATE INDEX "hr_fwa_arrangements_org_employee_idx" ON "hr_fwa_arrangements" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_fwa_arrangements_org_status_idx" ON "hr_fwa_arrangements" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "hr_fwa_arrangements_org_effective_idx" ON "hr_fwa_arrangements" USING btree ("organization_id","effective_from","effective_to");--> statement-breakpoint
CREATE INDEX "hr_fwa_arrangements_org_kind_idx" ON "hr_fwa_arrangements" USING btree ("organization_id","arrangement_kind");--> statement-breakpoint
CREATE INDEX "hr_fwa_arrangements_org_payroll_ref_idx" ON "hr_fwa_arrangements" USING btree ("organization_id","payroll_reference");--> statement-breakpoint
CREATE INDEX "hr_fwa_audit_events_org_occurred_idx" ON "hr_fwa_audit_events" USING btree ("organization_id","occurred_at");--> statement-breakpoint
CREATE INDEX "hr_fwa_audit_events_org_arrangement_idx" ON "hr_fwa_audit_events" USING btree ("organization_id","arrangement_id");--> statement-breakpoint
CREATE INDEX "hr_fwa_audit_events_org_request_idx" ON "hr_fwa_audit_events" USING btree ("organization_id","request_id");--> statement-breakpoint
CREATE INDEX "hr_fwa_audit_events_org_employee_idx" ON "hr_fwa_audit_events" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_fwa_compliance_breaches_org_arrangement_idx" ON "hr_fwa_compliance_breaches" USING btree ("organization_id","arrangement_id");--> statement-breakpoint
CREATE INDEX "hr_fwa_compliance_breaches_org_employee_idx" ON "hr_fwa_compliance_breaches" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_fwa_compliance_breaches_org_status_idx" ON "hr_fwa_compliance_breaches" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "hr_fwa_compliance_breaches_org_detected_idx" ON "hr_fwa_compliance_breaches" USING btree ("organization_id","detected_at");--> statement-breakpoint
CREATE INDEX "hr_fwa_eligibility_rules_org_group_kind_idx" ON "hr_fwa_eligibility_rules" USING btree ("organization_id","policy_group_code","arrangement_kind");--> statement-breakpoint
CREATE INDEX "hr_fwa_eligibility_rules_org_scope_idx" ON "hr_fwa_eligibility_rules" USING btree ("organization_id","legal_entity_code","country_code","work_location_code");--> statement-breakpoint
CREATE INDEX "hr_fwa_eligibility_rules_org_effective_idx" ON "hr_fwa_eligibility_rules" USING btree ("organization_id","effective_from","effective_to");--> statement-breakpoint
CREATE INDEX "hr_fwa_notifications_org_recipient_idx" ON "hr_fwa_notifications" USING btree ("organization_id","recipient_auth_user_id");--> statement-breakpoint
CREATE INDEX "hr_fwa_notifications_org_subject_idx" ON "hr_fwa_notifications" USING btree ("organization_id","subject_type","subject_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_fwa_policy_groups_org_code_uidx" ON "hr_fwa_policy_groups" USING btree ("organization_id","code");--> statement-breakpoint
CREATE INDEX "hr_fwa_policy_groups_org_active_idx" ON "hr_fwa_policy_groups" USING btree ("organization_id","active");--> statement-breakpoint
CREATE INDEX "hr_fwa_remote_locations_org_employee_idx" ON "hr_fwa_remote_locations" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_fwa_remote_locations_org_approved_idx" ON "hr_fwa_remote_locations" USING btree ("organization_id","is_approved");--> statement-breakpoint
CREATE INDEX "hr_fwa_requests_org_status_idx" ON "hr_fwa_requests" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "hr_fwa_requests_org_employee_idx" ON "hr_fwa_requests" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_fwa_requests_org_submitted_idx" ON "hr_fwa_requests" USING btree ("organization_id","submitted_at");--> statement-breakpoint
CREATE INDEX "hr_fwa_requests_org_approver_idx" ON "hr_fwa_requests" USING btree ("organization_id","current_approver_auth_user_id");--> statement-breakpoint
CREATE INDEX "hr_fwa_requests_org_kind_idx" ON "hr_fwa_requests" USING btree ("organization_id","arrangement_kind");--> statement-breakpoint
CREATE INDEX "hr_fwa_schedule_patterns_org_employee_idx" ON "hr_fwa_schedule_patterns" USING btree ("organization_id","employee_id");