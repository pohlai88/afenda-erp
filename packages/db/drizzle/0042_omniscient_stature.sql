CREATE TYPE "public"."hr_overtime_approval_stage" AS ENUM('manager', 'hr', 'complete');--> statement-breakpoint
CREATE TYPE "public"."hr_overtime_approval_status" AS ENUM('pending', 'approved', 'rejected', 'returned');--> statement-breakpoint
CREATE TYPE "public"."hr_overtime_approver_kind" AS ENUM('direct_manager', 'manager_chain', 'department_head', 'hr_owner', 'hr_pool', 'specific_user');--> statement-breakpoint
CREATE TYPE "public"."hr_overtime_day_category" AS ENUM('weekday', 'rest_day', 'off_day', 'public_holiday');--> statement-breakpoint
CREATE TYPE "public"."hr_overtime_exception_kind" AS ENUM('shift_variance', 'daily_cap', 'weekly_cap', 'monthly_cap', 'statutory_cap', 'budget_cap', 'min_duration', 'attendance_mismatch', 'late_submission', 'unplanned');--> statement-breakpoint
CREATE TYPE "public"."hr_overtime_exception_status" AS ENUM('open', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."hr_overtime_notification_kind" AS ENUM('request_submitted', 'request_approved', 'request_rejected', 'request_returned', 'request_cancelled', 'request_overdue', 'payroll_ready');--> statement-breakpoint
CREATE TYPE "public"."hr_overtime_rounding_mode" AS ENUM('none', 'down', 'up', 'nearest');--> statement-breakpoint
CREATE TABLE "hr_overtime_approval_routes" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"policy_group_code" text DEFAULT 'default' NOT NULL,
	"name" text NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"department_id" text,
	"cost_center_code" text,
	"work_location_code" text,
	"grade" text,
	"min_estimated_amount_cents" integer,
	"max_estimated_amount_cents" integer,
	"requires_eligibility_exception" boolean DEFAULT false NOT NULL,
	"requires_policy_exception" boolean DEFAULT false NOT NULL,
	"approver_kind" "hr_overtime_approver_kind" NOT NULL,
	"specific_approver_auth_user_id" text,
	"manager_chain_max_depth" integer,
	"active" boolean DEFAULT true NOT NULL,
	"effective_from" timestamp with time zone DEFAULT now() NOT NULL,
	"effective_to" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_overtime_approvals" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"request_id" text NOT NULL,
	"status" "hr_overtime_approval_status" DEFAULT 'pending' NOT NULL,
	"snapshot" jsonb NOT NULL,
	"assigned_approver_auth_user_id" text,
	"decided_by_auth_user_id" text,
	"decided_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_overtime_calculation_snapshots" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"request_id" text NOT NULL,
	"requested_minutes" integer NOT NULL,
	"attendance_minutes" integer,
	"rounded_minutes" integer NOT NULL,
	"capped_minutes" integer NOT NULL,
	"payable_minutes" integer NOT NULL,
	"rate_multiplier" numeric(5, 2) NOT NULL,
	"earning_code" text NOT NULL,
	"amount_cents" integer,
	"rate_rule_id" text,
	"calculation_detail" jsonb,
	"calculated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_overtime_exceptions" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"request_id" text NOT NULL,
	"kind" "hr_overtime_exception_kind" NOT NULL,
	"status" "hr_overtime_exception_status" DEFAULT 'open' NOT NULL,
	"message" text NOT NULL,
	"metadata" jsonb,
	"resolved_at" timestamp with time zone,
	"resolved_by_auth_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_overtime_notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"recipient_auth_user_id" text NOT NULL,
	"kind" "hr_overtime_notification_kind" NOT NULL,
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
CREATE TABLE "hr_overtime_policies" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"policy_group_code" text DEFAULT 'default' NOT NULL,
	"compare_attendance_enabled" boolean DEFAULT false NOT NULL,
	"min_overtime_minutes" integer DEFAULT 0 NOT NULL,
	"rounding_mode" "hr_overtime_rounding_mode" DEFAULT 'none' NOT NULL,
	"rounding_interval_minutes" integer DEFAULT 15 NOT NULL,
	"grace_minutes_before_rounding" integer DEFAULT 0 NOT NULL,
	"daily_cap_minutes" integer,
	"weekly_cap_minutes" integer,
	"monthly_cap_minutes" integer,
	"statutory_cap_minutes" integer,
	"budget_cap_minutes" integer,
	"attendance_variance_tolerance_minutes" integer DEFAULT 15 NOT NULL,
	"shift_variance_tolerance_minutes" integer DEFAULT 15 NOT NULL,
	"require_hr_second_approval" boolean DEFAULT false NOT NULL,
	"manager_chain_max_depth" integer DEFAULT 3 NOT NULL,
	"enforce_claim_deadline_on_submit" boolean DEFAULT false NOT NULL,
	"claim_deadline_days" integer,
	"allow_compensatory_time" boolean DEFAULT false NOT NULL,
	"compensatory_leave_type_code" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_overtime_rate_rules" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"policy_group_code" text DEFAULT 'default' NOT NULL,
	"name" text NOT NULL,
	"overtime_type" "hr_overtime_type",
	"day_category" "hr_overtime_day_category",
	"shift_category" text,
	"employee_category" text,
	"country_code" text,
	"multiplier" numeric(5, 2) DEFAULT '1.50' NOT NULL,
	"earning_code" text DEFAULT 'OT' NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"effective_from" timestamp with time zone DEFAULT now() NOT NULL,
	"effective_to" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hr_overtime_requests" ADD COLUMN "day_category" "hr_overtime_day_category";--> statement-breakpoint
ALTER TABLE "hr_overtime_requests" ADD COLUMN "approval_stage" "hr_overtime_approval_stage" DEFAULT 'manager' NOT NULL;--> statement-breakpoint
ALTER TABLE "hr_overtime_requests" ADD COLUMN "current_approver_auth_user_id" text;--> statement-breakpoint
ALTER TABLE "hr_overtime_requests" ADD COLUMN "approval_snapshot" jsonb;--> statement-breakpoint
ALTER TABLE "hr_overtime_approval_routes" ADD CONSTRAINT "hr_overtime_approval_routes_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_overtime_approval_routes" ADD CONSTRAINT "hr_overtime_approval_routes_department_id_hr_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."hr_departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_overtime_approvals" ADD CONSTRAINT "hr_overtime_approvals_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_overtime_approvals" ADD CONSTRAINT "hr_overtime_approvals_request_id_hr_overtime_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."hr_overtime_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_overtime_calculation_snapshots" ADD CONSTRAINT "hr_overtime_calculation_snapshots_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_overtime_calculation_snapshots" ADD CONSTRAINT "hr_overtime_calculation_snapshots_request_id_hr_overtime_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."hr_overtime_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_overtime_calculation_snapshots" ADD CONSTRAINT "hr_overtime_calculation_snapshots_rate_rule_id_hr_overtime_rate_rules_id_fk" FOREIGN KEY ("rate_rule_id") REFERENCES "public"."hr_overtime_rate_rules"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_overtime_exceptions" ADD CONSTRAINT "hr_overtime_exceptions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_overtime_exceptions" ADD CONSTRAINT "hr_overtime_exceptions_request_id_hr_overtime_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."hr_overtime_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_overtime_notifications" ADD CONSTRAINT "hr_overtime_notifications_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_overtime_notifications" ADD CONSTRAINT "hr_overtime_notifications_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_overtime_policies" ADD CONSTRAINT "hr_overtime_policies_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_overtime_rate_rules" ADD CONSTRAINT "hr_overtime_rate_rules_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "hr_overtime_approval_routes_org_group_idx" ON "hr_overtime_approval_routes" USING btree ("organization_id","policy_group_code");--> statement-breakpoint
CREATE INDEX "hr_overtime_approval_routes_org_priority_idx" ON "hr_overtime_approval_routes" USING btree ("organization_id","priority");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_overtime_approvals_org_request_uidx" ON "hr_overtime_approvals" USING btree ("organization_id","request_id");--> statement-breakpoint
CREATE INDEX "hr_overtime_approvals_org_status_idx" ON "hr_overtime_approvals" USING btree ("organization_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_overtime_calculation_snapshots_org_request_uidx" ON "hr_overtime_calculation_snapshots" USING btree ("organization_id","request_id");--> statement-breakpoint
CREATE INDEX "hr_overtime_exceptions_org_request_idx" ON "hr_overtime_exceptions" USING btree ("organization_id","request_id");--> statement-breakpoint
CREATE INDEX "hr_overtime_exceptions_org_status_idx" ON "hr_overtime_exceptions" USING btree ("organization_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_overtime_exceptions_org_request_kind_uidx" ON "hr_overtime_exceptions" USING btree ("organization_id","request_id","kind");--> statement-breakpoint
CREATE INDEX "hr_overtime_notifications_org_recipient_idx" ON "hr_overtime_notifications" USING btree ("organization_id","recipient_auth_user_id");--> statement-breakpoint
CREATE INDEX "hr_overtime_notifications_org_subject_idx" ON "hr_overtime_notifications" USING btree ("organization_id","subject_type","subject_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_overtime_policies_org_group_uidx" ON "hr_overtime_policies" USING btree ("organization_id","policy_group_code");--> statement-breakpoint
CREATE INDEX "hr_overtime_rate_rules_org_group_idx" ON "hr_overtime_rate_rules" USING btree ("organization_id","policy_group_code");--> statement-breakpoint
CREATE INDEX "hr_overtime_rate_rules_org_effective_idx" ON "hr_overtime_rate_rules" USING btree ("organization_id","effective_from","effective_to");