CREATE TYPE "public"."hr_attendance_correction_status" AS ENUM('pending', 'approved', 'rejected', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."hr_attendance_exception_code" AS ENUM('late_arrival', 'early_out', 'absent', 'missing_clock_in', 'missing_clock_out', 'unapproved_absence');--> statement-breakpoint
CREATE TYPE "public"."hr_lam_notification_kind" AS ENUM('leave_submitted', 'leave_approved', 'leave_rejected', 'leave_cancelled', 'leave_returned', 'leave_overdue', 'attendance_correction_submitted', 'attendance_correction_decided');--> statement-breakpoint
CREATE TYPE "public"."hr_benefit_category" AS ENUM('health', 'insurance', 'retirement', 'welfare', 'transport', 'meal', 'housing', 'education', 'wellness');--> statement-breakpoint
CREATE TYPE "public"."hr_benefit_contribution_payer" AS ENUM('employer', 'employee');--> statement-breakpoint
CREATE TYPE "public"."hr_benefit_coverage_level" AS ENUM('employee_only', 'employee_spouse', 'employee_children', 'family');--> statement-breakpoint
CREATE TYPE "public"."hr_benefit_coverage_status" AS ENUM('pending', 'active', 'waived', 'suspended', 'terminated', 'expired');--> statement-breakpoint
CREATE TYPE "public"."hr_benefit_deduction_frequency" AS ENUM('per_payroll', 'monthly', 'quarterly', 'annual');--> statement-breakpoint
CREATE TYPE "public"."hr_benefit_dependent_relationship" AS ENUM('spouse', 'child', 'domestic_partner', 'other');--> statement-breakpoint
CREATE TYPE "public"."hr_benefit_document_record_kind" AS ENUM('plan', 'enrollment', 'dependent', 'life_event');--> statement-breakpoint
CREATE TYPE "public"."hr_benefit_enrollment_channel" AS ENUM('new_hire', 'open_enrollment', 'life_event', 'administrative');--> statement-breakpoint
CREATE TYPE "public"."hr_benefit_life_event_kind" AS ENUM('marriage', 'divorce', 'birth', 'adoption', 'death', 'loss_of_coverage', 'relocation', 'other');--> statement-breakpoint
CREATE TYPE "public"."hr_benefit_open_enrollment_status" AS ENUM('draft', 'scheduled', 'active', 'closed');--> statement-breakpoint
CREATE TYPE "public"."hr_benefit_plan_status" AS ENUM('active', 'archived');--> statement-breakpoint
CREATE TABLE "hr_attendance_correction_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"attendance_day_id" text NOT NULL,
	"exception_code" "hr_attendance_exception_code" NOT NULL,
	"status" "hr_attendance_correction_status" DEFAULT 'pending' NOT NULL,
	"proposed_status" "hr_attendance_day_status",
	"reason" text NOT NULL,
	"decision_note" text,
	"current_approver_auth_user_id" text,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"decided_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_attendance_policies" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"policy_group_code" text DEFAULT 'default' NOT NULL,
	"attendance_corrections_enabled" boolean DEFAULT true NOT NULL,
	"grace_minutes_late" integer DEFAULT 15 NOT NULL,
	"standard_start_minutes" integer DEFAULT 540 NOT NULL,
	"standard_end_minutes" integer DEFAULT 1020 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_lam_notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"recipient_auth_user_id" text NOT NULL,
	"kind" "hr_lam_notification_kind" NOT NULL,
	"subject_type" text NOT NULL,
	"subject_id" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_benefit_audit_events" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"enrollment_id" text,
	"plan_id" text,
	"employee_id" text,
	"action" text NOT NULL,
	"actor_user_id" text,
	"summary" text NOT NULL,
	"metadata" text,
	"occurred_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_benefit_deduction_references" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"enrollment_id" text NOT NULL,
	"payroll_deduction_reference" text NOT NULL,
	"deduction_code" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"frequency" "hr_benefit_deduction_frequency" DEFAULT 'per_payroll' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"effective_from" timestamp with time zone DEFAULT now() NOT NULL,
	"effective_to" timestamp with time zone,
	"synced_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_benefit_document_links" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"record_kind" "hr_benefit_document_record_kind" NOT NULL,
	"record_id" text NOT NULL,
	"employee_document_id" text,
	"external_reference" text,
	"document_kind" text NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_benefit_eligibility_rules" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"plan_id" text NOT NULL,
	"legal_entity_code" text,
	"country_code" text,
	"work_location_code" text,
	"employment_type" text,
	"worker_category" text,
	"grade" text,
	"level" text,
	"min_tenure_months" integer,
	"max_tenure_months" integer,
	"active" boolean DEFAULT true NOT NULL,
	"effective_from" timestamp with time zone DEFAULT now() NOT NULL,
	"effective_to" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_benefit_enrollment_contributions" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"enrollment_id" text NOT NULL,
	"payer" "hr_benefit_contribution_payer" NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency_code" text DEFAULT 'USD' NOT NULL,
	"frequency" "hr_benefit_deduction_frequency" DEFAULT 'per_payroll' NOT NULL,
	"effective_from" timestamp with time zone DEFAULT now() NOT NULL,
	"effective_to" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_benefit_enrollment_dependents" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"enrollment_id" text NOT NULL,
	"dependent_name" text NOT NULL,
	"relationship" "hr_benefit_dependent_relationship" NOT NULL,
	"date_of_birth" timestamp with time zone,
	"dependent_reference_id" text,
	"eligibility_verified_at" timestamp with time zone,
	"coverage_start_date" timestamp with time zone NOT NULL,
	"coverage_end_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_benefit_enrollments" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"plan_id" text NOT NULL,
	"coverage_level" "hr_benefit_coverage_level" NOT NULL,
	"coverage_status" "hr_benefit_coverage_status" DEFAULT 'pending' NOT NULL,
	"enrollment_channel" "hr_benefit_enrollment_channel" DEFAULT 'administrative' NOT NULL,
	"open_enrollment_window_id" text,
	"life_event_id" text,
	"coverage_start_date" timestamp with time zone NOT NULL,
	"coverage_end_date" timestamp with time zone,
	"enrollment_date" timestamp with time zone DEFAULT now() NOT NULL,
	"waiver_reason" text,
	"approval_reference" text,
	"approved_at" timestamp with time zone,
	"approved_by_user_id" text,
	"enrolled_by_user_id" text,
	"eligibility_override_reference" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_benefit_life_events" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"kind" "hr_benefit_life_event_kind" NOT NULL,
	"event_date" timestamp with time zone NOT NULL,
	"reported_at" timestamp with time zone DEFAULT now() NOT NULL,
	"notes" text,
	"approval_reference" text,
	"processed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_benefit_open_enrollment_plans" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"window_id" text NOT NULL,
	"plan_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_benefit_open_enrollment_windows" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"status" "hr_benefit_open_enrollment_status" DEFAULT 'draft' NOT NULL,
	"enrollment_start_at" timestamp with time zone NOT NULL,
	"enrollment_end_at" timestamp with time zone NOT NULL,
	"coverage_effective_from" timestamp with time zone NOT NULL,
	"coverage_effective_to" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_benefit_plans" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" "hr_benefit_category" NOT NULL,
	"provider_id" text,
	"plan_status" "hr_benefit_plan_status" DEFAULT 'active' NOT NULL,
	"allows_dependents" boolean DEFAULT false NOT NULL,
	"default_coverage_level" "hr_benefit_coverage_level" DEFAULT 'employee_only' NOT NULL,
	"employer_contribution_amount" numeric(12, 2),
	"employee_contribution_amount" numeric(12, 2),
	"currency_code" text DEFAULT 'USD' NOT NULL,
	"requires_approval" boolean DEFAULT false NOT NULL,
	"effective_from" timestamp with time zone DEFAULT now() NOT NULL,
	"effective_to" timestamp with time zone,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_benefit_providers" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"contact_email" text,
	"contact_phone" text,
	"external_reference" text,
	"active" boolean DEFAULT true NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hr_attendance_days" ADD COLUMN "payroll_deduction_reference" text;--> statement-breakpoint
ALTER TABLE "hr_attendance_days" ADD COLUMN "lateness_deduction_reference" text;--> statement-breakpoint
ALTER TABLE "hr_attendance_days" ADD COLUMN "absence_deduction_reference" text;--> statement-breakpoint
ALTER TABLE "hr_leave_requests" ADD COLUMN "medical_certificate_reference" text;--> statement-breakpoint
ALTER TABLE "hr_leave_requests" ADD COLUMN "panel_clinic_reference" text;--> statement-breakpoint
ALTER TABLE "hr_leave_requests" ADD COLUMN "hospitalization_reference" text;--> statement-breakpoint
ALTER TABLE "hr_leave_type_configs" ADD COLUMN "requires_medical_certificate" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "hr_attendance_correction_requests" ADD CONSTRAINT "hr_attendance_correction_requests_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_attendance_correction_requests" ADD CONSTRAINT "hr_attendance_correction_requests_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_attendance_correction_requests" ADD CONSTRAINT "hr_attendance_correction_requests_attendance_day_id_hr_attendance_days_id_fk" FOREIGN KEY ("attendance_day_id") REFERENCES "public"."hr_attendance_days"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_attendance_policies" ADD CONSTRAINT "hr_attendance_policies_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_lam_notifications" ADD CONSTRAINT "hr_lam_notifications_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_benefit_audit_events" ADD CONSTRAINT "hr_benefit_audit_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_benefit_audit_events" ADD CONSTRAINT "hr_benefit_audit_events_enrollment_id_hr_benefit_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."hr_benefit_enrollments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_benefit_audit_events" ADD CONSTRAINT "hr_benefit_audit_events_plan_id_hr_benefit_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."hr_benefit_plans"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_benefit_audit_events" ADD CONSTRAINT "hr_benefit_audit_events_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_benefit_deduction_references" ADD CONSTRAINT "hr_benefit_deduction_references_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_benefit_deduction_references" ADD CONSTRAINT "hr_benefit_deduction_references_enrollment_id_hr_benefit_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."hr_benefit_enrollments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_benefit_document_links" ADD CONSTRAINT "hr_benefit_document_links_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_benefit_document_links" ADD CONSTRAINT "hr_benefit_document_links_employee_document_id_hr_employee_documents_id_fk" FOREIGN KEY ("employee_document_id") REFERENCES "public"."hr_employee_documents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_benefit_eligibility_rules" ADD CONSTRAINT "hr_benefit_eligibility_rules_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_benefit_eligibility_rules" ADD CONSTRAINT "hr_benefit_eligibility_rules_plan_id_hr_benefit_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."hr_benefit_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_benefit_enrollment_contributions" ADD CONSTRAINT "hr_benefit_enrollment_contributions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_benefit_enrollment_contributions" ADD CONSTRAINT "hr_benefit_enrollment_contributions_enrollment_id_hr_benefit_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."hr_benefit_enrollments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_benefit_enrollment_dependents" ADD CONSTRAINT "hr_benefit_enrollment_dependents_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_benefit_enrollment_dependents" ADD CONSTRAINT "hr_benefit_enrollment_dependents_enrollment_id_hr_benefit_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."hr_benefit_enrollments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_benefit_enrollments" ADD CONSTRAINT "hr_benefit_enrollments_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_benefit_enrollments" ADD CONSTRAINT "hr_benefit_enrollments_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_benefit_enrollments" ADD CONSTRAINT "hr_benefit_enrollments_plan_id_hr_benefit_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."hr_benefit_plans"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_benefit_enrollments" ADD CONSTRAINT "hr_benefit_enrollments_open_enrollment_window_id_hr_benefit_open_enrollment_windows_id_fk" FOREIGN KEY ("open_enrollment_window_id") REFERENCES "public"."hr_benefit_open_enrollment_windows"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_benefit_enrollments" ADD CONSTRAINT "hr_benefit_enrollments_life_event_id_hr_benefit_life_events_id_fk" FOREIGN KEY ("life_event_id") REFERENCES "public"."hr_benefit_life_events"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_benefit_life_events" ADD CONSTRAINT "hr_benefit_life_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_benefit_life_events" ADD CONSTRAINT "hr_benefit_life_events_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_benefit_open_enrollment_plans" ADD CONSTRAINT "hr_benefit_open_enrollment_plans_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_benefit_open_enrollment_plans" ADD CONSTRAINT "hr_benefit_open_enrollment_plans_window_id_hr_benefit_open_enrollment_windows_id_fk" FOREIGN KEY ("window_id") REFERENCES "public"."hr_benefit_open_enrollment_windows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_benefit_open_enrollment_plans" ADD CONSTRAINT "hr_benefit_open_enrollment_plans_plan_id_hr_benefit_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."hr_benefit_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_benefit_open_enrollment_windows" ADD CONSTRAINT "hr_benefit_open_enrollment_windows_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_benefit_plans" ADD CONSTRAINT "hr_benefit_plans_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_benefit_plans" ADD CONSTRAINT "hr_benefit_plans_provider_id_hr_benefit_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."hr_benefit_providers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_benefit_providers" ADD CONSTRAINT "hr_benefit_providers_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "hr_attendance_correction_org_status_idx" ON "hr_attendance_correction_requests" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "hr_attendance_correction_org_employee_idx" ON "hr_attendance_correction_requests" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_attendance_correction_org_day_idx" ON "hr_attendance_correction_requests" USING btree ("organization_id","attendance_day_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_attendance_policies_org_group_uidx" ON "hr_attendance_policies" USING btree ("organization_id","policy_group_code");--> statement-breakpoint
CREATE INDEX "hr_lam_notifications_org_recipient_idx" ON "hr_lam_notifications" USING btree ("organization_id","recipient_auth_user_id");--> statement-breakpoint
CREATE INDEX "hr_lam_notifications_org_subject_idx" ON "hr_lam_notifications" USING btree ("organization_id","subject_type","subject_id");--> statement-breakpoint
CREATE INDEX "hr_benefit_audit_events_org_occurred_idx" ON "hr_benefit_audit_events" USING btree ("organization_id","occurred_at");--> statement-breakpoint
CREATE INDEX "hr_benefit_audit_events_org_enrollment_idx" ON "hr_benefit_audit_events" USING btree ("organization_id","enrollment_id");--> statement-breakpoint
CREATE INDEX "hr_benefit_audit_events_org_employee_idx" ON "hr_benefit_audit_events" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_benefit_audit_events_org_action_idx" ON "hr_benefit_audit_events" USING btree ("organization_id","action");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_benefit_deduction_refs_org_payroll_ref_uidx" ON "hr_benefit_deduction_references" USING btree ("organization_id","payroll_deduction_reference");--> statement-breakpoint
CREATE INDEX "hr_benefit_deduction_refs_org_enrollment_idx" ON "hr_benefit_deduction_references" USING btree ("organization_id","enrollment_id");--> statement-breakpoint
CREATE INDEX "hr_benefit_deduction_refs_org_active_idx" ON "hr_benefit_deduction_references" USING btree ("organization_id","active");--> statement-breakpoint
CREATE INDEX "hr_benefit_document_links_org_record_idx" ON "hr_benefit_document_links" USING btree ("organization_id","record_kind","record_id");--> statement-breakpoint
CREATE INDEX "hr_benefit_document_links_org_document_idx" ON "hr_benefit_document_links" USING btree ("organization_id","employee_document_id");--> statement-breakpoint
CREATE INDEX "hr_benefit_eligibility_rules_org_plan_idx" ON "hr_benefit_eligibility_rules" USING btree ("organization_id","plan_id","active");--> statement-breakpoint
CREATE INDEX "hr_benefit_eligibility_rules_org_scope_idx" ON "hr_benefit_eligibility_rules" USING btree ("organization_id","country_code","legal_entity_code","employment_type");--> statement-breakpoint
CREATE INDEX "hr_benefit_enrollment_contributions_org_enrollment_idx" ON "hr_benefit_enrollment_contributions" USING btree ("organization_id","enrollment_id");--> statement-breakpoint
CREATE INDEX "hr_benefit_enrollment_contributions_org_payer_idx" ON "hr_benefit_enrollment_contributions" USING btree ("organization_id","payer");--> statement-breakpoint
CREATE INDEX "hr_benefit_enrollment_dependents_org_enrollment_idx" ON "hr_benefit_enrollment_dependents" USING btree ("organization_id","enrollment_id");--> statement-breakpoint
CREATE INDEX "hr_benefit_enrollments_org_employee_idx" ON "hr_benefit_enrollments" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_benefit_enrollments_org_plan_idx" ON "hr_benefit_enrollments" USING btree ("organization_id","plan_id");--> statement-breakpoint
CREATE INDEX "hr_benefit_enrollments_org_status_idx" ON "hr_benefit_enrollments" USING btree ("organization_id","coverage_status");--> statement-breakpoint
CREATE INDEX "hr_benefit_enrollments_org_coverage_dates_idx" ON "hr_benefit_enrollments" USING btree ("organization_id","coverage_start_date","coverage_end_date");--> statement-breakpoint
CREATE INDEX "hr_benefit_enrollments_org_open_window_idx" ON "hr_benefit_enrollments" USING btree ("organization_id","open_enrollment_window_id");--> statement-breakpoint
CREATE INDEX "hr_benefit_life_events_org_employee_idx" ON "hr_benefit_life_events" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_benefit_life_events_org_kind_idx" ON "hr_benefit_life_events" USING btree ("organization_id","kind");--> statement-breakpoint
CREATE INDEX "hr_benefit_life_events_org_event_date_idx" ON "hr_benefit_life_events" USING btree ("organization_id","event_date");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_benefit_open_enrollment_plans_window_plan_uidx" ON "hr_benefit_open_enrollment_plans" USING btree ("window_id","plan_id");--> statement-breakpoint
CREATE INDEX "hr_benefit_open_enrollment_plans_org_window_idx" ON "hr_benefit_open_enrollment_plans" USING btree ("organization_id","window_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_benefit_open_enrollment_windows_org_code_uidx" ON "hr_benefit_open_enrollment_windows" USING btree ("organization_id","code");--> statement-breakpoint
CREATE INDEX "hr_benefit_open_enrollment_windows_org_status_idx" ON "hr_benefit_open_enrollment_windows" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "hr_benefit_open_enrollment_windows_org_dates_idx" ON "hr_benefit_open_enrollment_windows" USING btree ("organization_id","enrollment_start_at","enrollment_end_at");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_benefit_plans_org_code_uidx" ON "hr_benefit_plans" USING btree ("organization_id","code");--> statement-breakpoint
CREATE INDEX "hr_benefit_plans_org_category_idx" ON "hr_benefit_plans" USING btree ("organization_id","category","plan_status");--> statement-breakpoint
CREATE INDEX "hr_benefit_plans_org_provider_idx" ON "hr_benefit_plans" USING btree ("organization_id","provider_id");--> statement-breakpoint
CREATE INDEX "hr_benefit_plans_org_effective_idx" ON "hr_benefit_plans" USING btree ("organization_id","effective_from","effective_to");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_benefit_providers_org_code_uidx" ON "hr_benefit_providers" USING btree ("organization_id","code");--> statement-breakpoint
CREATE INDEX "hr_benefit_providers_org_active_idx" ON "hr_benefit_providers" USING btree ("organization_id","active");--> statement-breakpoint
CREATE INDEX "hr_attendance_days_org_payroll_ref_idx" ON "hr_attendance_days" USING btree ("organization_id","payroll_deduction_reference");