CREATE TYPE "public"."hr_overtime_audit_action" AS ENUM('request_create', 'request_draft_save', 'request_submit', 'request_cancel', 'request_approve', 'request_reject', 'request_return', 'request_adjust', 'eligibility_validate', 'exception_approve', 'exception_reject', 'calculation_apply', 'payroll_export', 'payroll_ready', 'paid');--> statement-breakpoint
CREATE TYPE "public"."hr_overtime_timing_kind" AS ENUM('planned', 'actual');--> statement-breakpoint
CREATE TYPE "public"."hr_shift_assignment_kind" AS ENUM('shift', 'rest_day', 'off_day', 'holiday');--> statement-breakpoint
CREATE TYPE "public"."hr_shift_audit_action" AS ENUM('template_created', 'template_updated', 'template_archived', 'assignment_created', 'assignment_bulk_created', 'assignment_published', 'assignment_cancelled', 'recurrence_created', 'recurrence_applied', 'rotation_created', 'rotation_step_added', 'rotation_applied', 'policy_updated', 'coverage_created', 'coverage_updated', 'swap_submitted', 'swap_approved', 'swap_rejected', 'swap_returned', 'swap_overridden', 'roster_published', 'schedule_change_submitted', 'schedule_change_approved', 'schedule_change_rejected', 'schedule_change_returned', 'schedule_change_overridden', 'payroll_reference_linked', 'report_definition_saved', 'report_exported', 'notification_enqueued');--> statement-breakpoint
CREATE TYPE "public"."hr_shift_availability_kind" AS ENUM('unavailable', 'preferred', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."hr_shift_category" AS ENUM('day', 'evening', 'night', 'split', 'rest', 'off', 'holiday', 'flexible', 'other');--> statement-breakpoint
CREATE TYPE "public"."hr_shift_notification_kind" AS ENUM('roster_published', 'roster_changed', 'assignment_changed', 'swap_submitted', 'swap_approved', 'swap_rejected', 'swap_returned', 'swap_overridden', 'schedule_change_submitted', 'schedule_change_approved', 'schedule_change_rejected', 'schedule_change_returned', 'schedule_change_overridden');--> statement-breakpoint
CREATE TYPE "public"."hr_shift_pattern_kind" AS ENUM('fixed', 'rotating', 'split', 'night', 'weekend', 'holiday', 'flexible');--> statement-breakpoint
CREATE TYPE "public"."hr_shift_recurrence_status" AS ENUM('active', 'archived');--> statement-breakpoint
CREATE TYPE "public"."hr_shift_rotation_cycle_status" AS ENUM('active', 'archived');--> statement-breakpoint
CREATE TYPE "public"."hr_shift_schedule_change_status" AS ENUM('pending', 'returned', 'approved', 'rejected', 'cancelled', 'overridden');--> statement-breakpoint
CREATE TYPE "public"."hr_shift_swap_request_status" AS ENUM('pending', 'returned', 'approved', 'rejected', 'cancelled', 'overridden');--> statement-breakpoint
ALTER TYPE "public"."hr_overtime_request_status" ADD VALUE 'draft' BEFORE 'pending';--> statement-breakpoint
ALTER TYPE "public"."hr_overtime_request_status" ADD VALUE 'submitted' BEFORE 'pending';--> statement-breakpoint
ALTER TYPE "public"."hr_overtime_request_status" ADD VALUE 'returned' BEFORE 'cancelled';--> statement-breakpoint
ALTER TYPE "public"."hr_overtime_request_status" ADD VALUE 'payroll_ready';--> statement-breakpoint
ALTER TYPE "public"."hr_overtime_request_status" ADD VALUE 'paid';--> statement-breakpoint
ALTER TYPE "public"."hr_overtime_type" ADD VALUE 'rest_day';--> statement-breakpoint
ALTER TYPE "public"."hr_overtime_type" ADD VALUE 'off_day';--> statement-breakpoint
ALTER TYPE "public"."hr_overtime_type" ADD VALUE 'night';--> statement-breakpoint
ALTER TYPE "public"."hr_overtime_type" ADD VALUE 'emergency';--> statement-breakpoint
CREATE TABLE "hr_overtime_audit_events" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"request_id" text,
	"employee_id" text,
	"action" "hr_overtime_audit_action" NOT NULL,
	"actor_auth_user_id" text,
	"actor_employee_id" text,
	"summary" text NOT NULL,
	"metadata" jsonb,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_overtime_eligibility_rules" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"policy_group_code" text DEFAULT 'default' NOT NULL,
	"overtime_type" "hr_overtime_type",
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
CREATE TABLE "hr_shift_audit_events" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"action" "hr_shift_audit_action" NOT NULL,
	"template_id" text,
	"assignment_id" text,
	"swap_request_id" text,
	"schedule_change_request_id" text,
	"publication_id" text,
	"employee_id" text,
	"actor_auth_user_id" text,
	"actor_employee_id" text,
	"summary" text NOT NULL,
	"metadata" jsonb,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_shift_availability" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"availability_kind" "hr_shift_availability_kind" NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"preferred_template_id" text,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_shift_coverage_requirements" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"requirement_date" timestamp with time zone NOT NULL,
	"template_id" text,
	"department_id" text,
	"position_id" text,
	"location_code" text,
	"role_code" text,
	"required_skill_code" text,
	"required_certification_code" text,
	"min_headcount" integer NOT NULL,
	"max_headcount" integer,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_shift_notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"recipient_auth_user_id" text NOT NULL,
	"kind" "hr_shift_notification_kind" NOT NULL,
	"subject_type" text NOT NULL,
	"subject_id" text NOT NULL,
	"employee_id" text,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_shift_recurrence_rules" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"template_id" text NOT NULL,
	"employee_id" text,
	"days_of_week" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"effective_from" timestamp with time zone NOT NULL,
	"effective_to" timestamp with time zone,
	"status" "hr_shift_recurrence_status" DEFAULT 'active' NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_shift_roster_publications" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"period_start" timestamp with time zone NOT NULL,
	"period_end" timestamp with time zone NOT NULL,
	"published_by_auth_user_id" text NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_shift_roster_report_definitions" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"filter_payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_by_auth_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_shift_rotation_cycle_steps" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"cycle_id" text NOT NULL,
	"step_index" integer NOT NULL,
	"template_id" text,
	"is_rest_day" boolean DEFAULT false NOT NULL,
	"label" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_shift_rotation_cycles" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"cycle_length_days" integer NOT NULL,
	"status" "hr_shift_rotation_cycle_status" DEFAULT 'active' NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_shift_schedule_change_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"requesting_employee_id" text NOT NULL,
	"assignment_id" text,
	"status" "hr_shift_schedule_change_status" DEFAULT 'pending' NOT NULL,
	"proposed_changes" jsonb NOT NULL,
	"reason" text NOT NULL,
	"decision_note" text,
	"rejection_reason" text,
	"override_reason" text,
	"initiator_auth_user_id" text,
	"current_approver_auth_user_id" text,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"decided_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_shift_scheduling_policies" (
	"organization_id" text PRIMARY KEY NOT NULL,
	"min_rest_hours_between_shifts" numeric(4, 2) DEFAULT '11' NOT NULL,
	"max_weekly_scheduled_hours" numeric(5, 2) DEFAULT '48' NOT NULL,
	"swap_requests_enabled" boolean DEFAULT true NOT NULL,
	"employee_schedule_change_enabled" boolean DEFAULT true NOT NULL,
	"validate_availability_on_assign" boolean DEFAULT true NOT NULL,
	"validate_leave_conflict_on_assign" boolean DEFAULT true NOT NULL,
	"updated_by_auth_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_shift_swap_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"requester_employee_id" text NOT NULL,
	"requester_assignment_id" text NOT NULL,
	"target_employee_id" text,
	"target_assignment_id" text,
	"status" "hr_shift_swap_request_status" DEFAULT 'pending' NOT NULL,
	"reason" text NOT NULL,
	"decision_note" text,
	"rejection_reason" text,
	"override_reason" text,
	"current_approver_auth_user_id" text,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"decided_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hr_overtime_requests" ALTER COLUMN "status" SET DEFAULT 'submitted';--> statement-breakpoint
ALTER TABLE "hr_overtime_requests" ALTER COLUMN "submitted_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "hr_overtime_requests" ALTER COLUMN "submitted_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "hr_overtime_requests" ADD COLUMN "timing_kind" "hr_overtime_timing_kind" DEFAULT 'planned' NOT NULL;--> statement-breakpoint
ALTER TABLE "hr_overtime_requests" ADD COLUMN "policy_group_code" text DEFAULT 'default' NOT NULL;--> statement-breakpoint
ALTER TABLE "hr_overtime_requests" ADD COLUMN "start_time" text;--> statement-breakpoint
ALTER TABLE "hr_overtime_requests" ADD COLUMN "end_time" text;--> statement-breakpoint
ALTER TABLE "hr_overtime_requests" ADD COLUMN "payable_minutes" integer;--> statement-breakpoint
ALTER TABLE "hr_overtime_requests" ADD COLUMN "amount_cents" integer;--> statement-breakpoint
ALTER TABLE "hr_overtime_requests" ADD COLUMN "earning_code" text;--> statement-breakpoint
ALTER TABLE "hr_overtime_requests" ADD COLUMN "return_reason" text;--> statement-breakpoint
ALTER TABLE "hr_overtime_requests" ADD COLUMN "eligibility_exception_reason" text;--> statement-breakpoint
ALTER TABLE "hr_overtime_requests" ADD COLUMN "payroll_ready_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "hr_overtime_requests" ADD COLUMN "paid_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "hr_shift_assignments" ADD COLUMN "department_id" text;--> statement-breakpoint
ALTER TABLE "hr_shift_assignments" ADD COLUMN "position_id" text;--> statement-breakpoint
ALTER TABLE "hr_shift_assignments" ADD COLUMN "location_code" text;--> statement-breakpoint
ALTER TABLE "hr_shift_assignments" ADD COLUMN "assignment_kind" "hr_shift_assignment_kind" DEFAULT 'shift' NOT NULL;--> statement-breakpoint
ALTER TABLE "hr_shift_assignments" ADD COLUMN "recurrence_rule_id" text;--> statement-breakpoint
ALTER TABLE "hr_shift_assignments" ADD COLUMN "rotation_cycle_id" text;--> statement-breakpoint
ALTER TABLE "hr_shift_assignments" ADD COLUMN "publication_id" text;--> statement-breakpoint
ALTER TABLE "hr_shift_assignments" ADD COLUMN "assigned_by_auth_user_id" text;--> statement-breakpoint
ALTER TABLE "hr_shift_assignments" ADD COLUMN "payroll_reference" text;--> statement-breakpoint
ALTER TABLE "hr_shift_templates" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "hr_shift_templates" ADD COLUMN "break_start_time" text;--> statement-breakpoint
ALTER TABLE "hr_shift_templates" ADD COLUMN "break_end_time" text;--> statement-breakpoint
ALTER TABLE "hr_shift_templates" ADD COLUMN "working_hours_minutes" integer DEFAULT 480 NOT NULL;--> statement-breakpoint
ALTER TABLE "hr_shift_templates" ADD COLUMN "shift_category" "hr_shift_category" DEFAULT 'day' NOT NULL;--> statement-breakpoint
ALTER TABLE "hr_shift_templates" ADD COLUMN "pattern_kind" "hr_shift_pattern_kind" DEFAULT 'fixed' NOT NULL;--> statement-breakpoint
ALTER TABLE "hr_overtime_audit_events" ADD CONSTRAINT "hr_overtime_audit_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_overtime_audit_events" ADD CONSTRAINT "hr_overtime_audit_events_request_id_hr_overtime_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."hr_overtime_requests"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_overtime_audit_events" ADD CONSTRAINT "hr_overtime_audit_events_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_overtime_eligibility_rules" ADD CONSTRAINT "hr_overtime_eligibility_rules_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_overtime_eligibility_rules" ADD CONSTRAINT "hr_overtime_eligibility_rules_department_id_hr_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."hr_departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_shift_audit_events" ADD CONSTRAINT "hr_shift_audit_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_shift_audit_events" ADD CONSTRAINT "hr_shift_audit_events_template_id_hr_shift_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."hr_shift_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_shift_audit_events" ADD CONSTRAINT "hr_shift_audit_events_assignment_id_hr_shift_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."hr_shift_assignments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_shift_audit_events" ADD CONSTRAINT "hr_shift_audit_events_swap_request_id_hr_shift_swap_requests_id_fk" FOREIGN KEY ("swap_request_id") REFERENCES "public"."hr_shift_swap_requests"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_shift_audit_events" ADD CONSTRAINT "hr_shift_audit_events_schedule_change_request_id_hr_shift_schedule_change_requests_id_fk" FOREIGN KEY ("schedule_change_request_id") REFERENCES "public"."hr_shift_schedule_change_requests"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_shift_audit_events" ADD CONSTRAINT "hr_shift_audit_events_publication_id_hr_shift_roster_publications_id_fk" FOREIGN KEY ("publication_id") REFERENCES "public"."hr_shift_roster_publications"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_shift_audit_events" ADD CONSTRAINT "hr_shift_audit_events_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_shift_availability" ADD CONSTRAINT "hr_shift_availability_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_shift_availability" ADD CONSTRAINT "hr_shift_availability_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_shift_availability" ADD CONSTRAINT "hr_shift_availability_preferred_template_id_hr_shift_templates_id_fk" FOREIGN KEY ("preferred_template_id") REFERENCES "public"."hr_shift_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_shift_coverage_requirements" ADD CONSTRAINT "hr_shift_coverage_requirements_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_shift_coverage_requirements" ADD CONSTRAINT "hr_shift_coverage_requirements_template_id_hr_shift_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."hr_shift_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_shift_coverage_requirements" ADD CONSTRAINT "hr_shift_coverage_requirements_department_id_hr_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."hr_departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_shift_coverage_requirements" ADD CONSTRAINT "hr_shift_coverage_requirements_position_id_hr_positions_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."hr_positions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_shift_notifications" ADD CONSTRAINT "hr_shift_notifications_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_shift_notifications" ADD CONSTRAINT "hr_shift_notifications_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_shift_recurrence_rules" ADD CONSTRAINT "hr_shift_recurrence_rules_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_shift_recurrence_rules" ADD CONSTRAINT "hr_shift_recurrence_rules_template_id_hr_shift_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."hr_shift_templates"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_shift_recurrence_rules" ADD CONSTRAINT "hr_shift_recurrence_rules_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_shift_roster_publications" ADD CONSTRAINT "hr_shift_roster_publications_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_shift_roster_report_definitions" ADD CONSTRAINT "hr_shift_roster_report_definitions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_shift_rotation_cycle_steps" ADD CONSTRAINT "hr_shift_rotation_cycle_steps_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_shift_rotation_cycle_steps" ADD CONSTRAINT "hr_shift_rotation_cycle_steps_cycle_id_hr_shift_rotation_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."hr_shift_rotation_cycles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_shift_rotation_cycle_steps" ADD CONSTRAINT "hr_shift_rotation_cycle_steps_template_id_hr_shift_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."hr_shift_templates"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_shift_rotation_cycles" ADD CONSTRAINT "hr_shift_rotation_cycles_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_shift_schedule_change_requests" ADD CONSTRAINT "hr_shift_schedule_change_requests_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_shift_schedule_change_requests" ADD CONSTRAINT "hr_shift_schedule_change_requests_requesting_employee_id_hr_employees_id_fk" FOREIGN KEY ("requesting_employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_shift_schedule_change_requests" ADD CONSTRAINT "hr_shift_schedule_change_requests_assignment_id_hr_shift_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."hr_shift_assignments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_shift_scheduling_policies" ADD CONSTRAINT "hr_shift_scheduling_policies_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_shift_swap_requests" ADD CONSTRAINT "hr_shift_swap_requests_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_shift_swap_requests" ADD CONSTRAINT "hr_shift_swap_requests_requester_employee_id_hr_employees_id_fk" FOREIGN KEY ("requester_employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_shift_swap_requests" ADD CONSTRAINT "hr_shift_swap_requests_requester_assignment_id_hr_shift_assignments_id_fk" FOREIGN KEY ("requester_assignment_id") REFERENCES "public"."hr_shift_assignments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_shift_swap_requests" ADD CONSTRAINT "hr_shift_swap_requests_target_employee_id_hr_employees_id_fk" FOREIGN KEY ("target_employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_shift_swap_requests" ADD CONSTRAINT "hr_shift_swap_requests_target_assignment_id_hr_shift_assignments_id_fk" FOREIGN KEY ("target_assignment_id") REFERENCES "public"."hr_shift_assignments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "hr_overtime_audit_events_org_occurred_idx" ON "hr_overtime_audit_events" USING btree ("organization_id","occurred_at");--> statement-breakpoint
CREATE INDEX "hr_overtime_audit_events_org_request_idx" ON "hr_overtime_audit_events" USING btree ("organization_id","request_id");--> statement-breakpoint
CREATE INDEX "hr_overtime_audit_events_org_employee_idx" ON "hr_overtime_audit_events" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_overtime_eligibility_rules_org_group_type_idx" ON "hr_overtime_eligibility_rules" USING btree ("organization_id","policy_group_code","overtime_type");--> statement-breakpoint
CREATE INDEX "hr_overtime_eligibility_rules_org_scope_idx" ON "hr_overtime_eligibility_rules" USING btree ("organization_id","legal_entity_code","country_code","work_location_code");--> statement-breakpoint
CREATE INDEX "hr_overtime_eligibility_rules_org_effective_idx" ON "hr_overtime_eligibility_rules" USING btree ("organization_id","effective_from","effective_to");--> statement-breakpoint
CREATE INDEX "hr_shift_audit_events_org_occurred_idx" ON "hr_shift_audit_events" USING btree ("organization_id","occurred_at");--> statement-breakpoint
CREATE INDEX "hr_shift_audit_events_org_action_idx" ON "hr_shift_audit_events" USING btree ("organization_id","action");--> statement-breakpoint
CREATE INDEX "hr_shift_audit_events_org_employee_idx" ON "hr_shift_audit_events" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_shift_audit_events_org_assignment_idx" ON "hr_shift_audit_events" USING btree ("organization_id","assignment_id");--> statement-breakpoint
CREATE INDEX "hr_shift_availability_org_employee_idx" ON "hr_shift_availability" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_shift_availability_org_kind_idx" ON "hr_shift_availability" USING btree ("organization_id","availability_kind");--> statement-breakpoint
CREATE INDEX "hr_shift_availability_org_period_idx" ON "hr_shift_availability" USING btree ("organization_id","start_date","end_date");--> statement-breakpoint
CREATE INDEX "hr_shift_coverage_requirements_org_date_idx" ON "hr_shift_coverage_requirements" USING btree ("organization_id","requirement_date");--> statement-breakpoint
CREATE INDEX "hr_shift_coverage_requirements_org_template_idx" ON "hr_shift_coverage_requirements" USING btree ("organization_id","template_id");--> statement-breakpoint
CREATE INDEX "hr_shift_coverage_requirements_org_department_idx" ON "hr_shift_coverage_requirements" USING btree ("organization_id","department_id");--> statement-breakpoint
CREATE INDEX "hr_shift_notifications_org_recipient_idx" ON "hr_shift_notifications" USING btree ("organization_id","recipient_auth_user_id");--> statement-breakpoint
CREATE INDEX "hr_shift_notifications_org_employee_idx" ON "hr_shift_notifications" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_shift_notifications_org_subject_idx" ON "hr_shift_notifications" USING btree ("organization_id","subject_type","subject_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_shift_recurrence_rules_org_code_uidx" ON "hr_shift_recurrence_rules" USING btree ("organization_id","code");--> statement-breakpoint
CREATE INDEX "hr_shift_recurrence_rules_org_employee_idx" ON "hr_shift_recurrence_rules" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_shift_recurrence_rules_org_status_idx" ON "hr_shift_recurrence_rules" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "hr_shift_roster_publications_org_period_idx" ON "hr_shift_roster_publications" USING btree ("organization_id","period_start","period_end");--> statement-breakpoint
CREATE INDEX "hr_shift_roster_publications_org_published_idx" ON "hr_shift_roster_publications" USING btree ("organization_id","published_at");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_shift_roster_report_definitions_org_code_uidx" ON "hr_shift_roster_report_definitions" USING btree ("organization_id","code");--> statement-breakpoint
CREATE INDEX "hr_shift_roster_report_definitions_org_name_idx" ON "hr_shift_roster_report_definitions" USING btree ("organization_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_shift_rotation_cycle_steps_cycle_index_uidx" ON "hr_shift_rotation_cycle_steps" USING btree ("cycle_id","step_index");--> statement-breakpoint
CREATE INDEX "hr_shift_rotation_cycle_steps_org_cycle_idx" ON "hr_shift_rotation_cycle_steps" USING btree ("organization_id","cycle_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_shift_rotation_cycles_org_code_uidx" ON "hr_shift_rotation_cycles" USING btree ("organization_id","code");--> statement-breakpoint
CREATE INDEX "hr_shift_rotation_cycles_org_status_idx" ON "hr_shift_rotation_cycles" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "hr_shift_schedule_change_requests_org_status_idx" ON "hr_shift_schedule_change_requests" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "hr_shift_schedule_change_requests_org_requester_idx" ON "hr_shift_schedule_change_requests" USING btree ("organization_id","requesting_employee_id");--> statement-breakpoint
CREATE INDEX "hr_shift_schedule_change_requests_org_submitted_idx" ON "hr_shift_schedule_change_requests" USING btree ("organization_id","submitted_at");--> statement-breakpoint
CREATE INDEX "hr_shift_swap_requests_org_status_idx" ON "hr_shift_swap_requests" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "hr_shift_swap_requests_org_requester_idx" ON "hr_shift_swap_requests" USING btree ("organization_id","requester_employee_id");--> statement-breakpoint
CREATE INDEX "hr_shift_swap_requests_org_target_idx" ON "hr_shift_swap_requests" USING btree ("organization_id","target_employee_id");--> statement-breakpoint
CREATE INDEX "hr_shift_swap_requests_org_submitted_idx" ON "hr_shift_swap_requests" USING btree ("organization_id","submitted_at");--> statement-breakpoint
ALTER TABLE "hr_shift_assignments" ADD CONSTRAINT "hr_shift_assignments_department_id_hr_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."hr_departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_shift_assignments" ADD CONSTRAINT "hr_shift_assignments_position_id_hr_positions_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."hr_positions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_shift_assignments" ADD CONSTRAINT "hr_shift_assignments_recurrence_rule_id_hr_shift_recurrence_rules_id_fk" FOREIGN KEY ("recurrence_rule_id") REFERENCES "public"."hr_shift_recurrence_rules"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_shift_assignments" ADD CONSTRAINT "hr_shift_assignments_rotation_cycle_id_hr_shift_rotation_cycles_id_fk" FOREIGN KEY ("rotation_cycle_id") REFERENCES "public"."hr_shift_rotation_cycles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_shift_assignments" ADD CONSTRAINT "hr_shift_assignments_publication_id_hr_shift_roster_publications_id_fk" FOREIGN KEY ("publication_id") REFERENCES "public"."hr_shift_roster_publications"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "hr_overtime_requests_org_work_date_idx" ON "hr_overtime_requests" USING btree ("organization_id","work_date");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_shift_assignments_org_employee_date_uidx" ON "hr_shift_assignments" USING btree ("organization_id","employee_id","shift_date");--> statement-breakpoint
CREATE INDEX "hr_shift_assignments_org_department_idx" ON "hr_shift_assignments" USING btree ("organization_id","department_id");--> statement-breakpoint
CREATE INDEX "hr_shift_assignments_org_publication_idx" ON "hr_shift_assignments" USING btree ("organization_id","publication_id");--> statement-breakpoint
CREATE INDEX "hr_shift_templates_org_pattern_idx" ON "hr_shift_templates" USING btree ("organization_id","pattern_kind");