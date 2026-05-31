CREATE TYPE "public"."hr_compensation_adjustment_type" AS ENUM('merit', 'promotion', 'market', 'equity', 'retention', 'special');--> statement-breakpoint
CREATE TYPE "public"."hr_compensation_budget_pool_scope" AS ENUM('organization', 'legal_entity', 'department', 'business_unit', 'grade', 'location', 'manager_group');--> statement-breakpoint
CREATE TYPE "public"."hr_compensation_cycle_status" AS ENUM('draft', 'planning', 'in_review', 'approved', 'closed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."hr_compensation_cycle_type" AS ENUM('annual_review', 'merit_review', 'promotion_review', 'market_adjustment', 'equity_adjustment', 'retention_adjustment');--> statement-breakpoint
CREATE TYPE "public"."hr_compensation_participant_eligibility" AS ENUM('eligible', 'ineligible', 'exception');--> statement-breakpoint
CREATE TYPE "public"."hr_compensation_payroll_sync_status" AS ENUM('pending', 'synced', 'failed');--> statement-breakpoint
CREATE TYPE "public"."hr_compensation_recommendation_status" AS ENUM('draft', 'submitted', 'hr_review', 'pending_approval', 'approved', 'rejected', 'returned');--> statement-breakpoint
CREATE TYPE "public"."hr_compensation_scenario_status" AS ENUM('draft', 'active', 'superseded', 'archived');--> statement-breakpoint
CREATE TABLE "hr_compensation_approval_steps" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"recommendation_id" text NOT NULL,
	"step_order" integer NOT NULL,
	"approver_role" text NOT NULL,
	"approver_user_id" text,
	"step_status" text DEFAULT 'pending' NOT NULL,
	"decided_at" timestamp with time zone,
	"decision_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_compensation_audit_events" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"cycle_id" text,
	"recommendation_id" text,
	"employee_id" text,
	"actor_user_id" text NOT NULL,
	"action" text NOT NULL,
	"summary" text,
	"metadata" jsonb,
	"occurred_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_compensation_budget_pools" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"cycle_id" text NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"scope" "hr_compensation_budget_pool_scope" NOT NULL,
	"scope_ref" text,
	"legal_entity_code" text,
	"department_id" text,
	"business_unit_code" text,
	"grade" text,
	"location_code" text,
	"manager_employee_id" text,
	"allocated_amount" numeric(14, 2) NOT NULL,
	"currency_code" text DEFAULT 'USD' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_compensation_cycle_participants" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"cycle_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"budget_pool_id" text,
	"eligibility_status" "hr_compensation_participant_eligibility" DEFAULT 'eligible' NOT NULL,
	"eligibility_reason" text,
	"current_salary" numeric(14, 2),
	"current_grade" text,
	"current_level" text,
	"department_id" text,
	"manager_employee_id" text,
	"salary_effective_date" timestamp with time zone,
	"performance_rating" numeric(5, 2),
	"legal_entity_code" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_compensation_cycles" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"cycle_type" "hr_compensation_cycle_type" NOT NULL,
	"cycle_status" "hr_compensation_cycle_status" DEFAULT 'draft' NOT NULL,
	"effective_date" timestamp with time zone NOT NULL,
	"currency_code" text DEFAULT 'USD' NOT NULL,
	"approval_rules" jsonb DEFAULT '{"steps":[]}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_compensation_eligibility_rules" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"cycle_id" text NOT NULL,
	"label" text NOT NULL,
	"rule_config" jsonb NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_compensation_payroll_refs" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"salary_change_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"sync_status" "hr_compensation_payroll_sync_status" DEFAULT 'pending' NOT NULL,
	"payroll_reference_code" text NOT NULL,
	"effective_date" timestamp with time zone NOT NULL,
	"amount_delta" numeric(14, 2) NOT NULL,
	"synced_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_compensation_recommendations" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"cycle_id" text NOT NULL,
	"participant_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"budget_pool_id" text,
	"adjustment_type" "hr_compensation_adjustment_type" NOT NULL,
	"recommendation_status" "hr_compensation_recommendation_status" DEFAULT 'draft' NOT NULL,
	"current_salary" numeric(14, 2) NOT NULL,
	"increase_amount" numeric(14, 2),
	"increase_percent" numeric(8, 4),
	"proposed_salary" numeric(14, 2) NOT NULL,
	"total_comp_impact" numeric(14, 2),
	"band_minimum" numeric(14, 2),
	"band_midpoint" numeric(14, 2),
	"band_maximum" numeric(14, 2),
	"range_position" numeric(8, 4),
	"compa_ratio" numeric(8, 4),
	"band_flag" text,
	"budget_impact" numeric(14, 2),
	"over_budget" boolean DEFAULT false NOT NULL,
	"exception_flags" jsonb,
	"justification" text,
	"manager_comments" text,
	"recommender_user_id" text,
	"reviewer_user_id" text,
	"approver_user_id" text,
	"locked_at" timestamp with time zone,
	"effective_date" timestamp with time zone,
	"currency_code" text DEFAULT 'USD' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_compensation_salary_bands" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"grade" text NOT NULL,
	"legal_entity_code" text,
	"band_minimum" numeric(14, 2) NOT NULL,
	"band_midpoint" numeric(14, 2) NOT NULL,
	"band_maximum" numeric(14, 2) NOT NULL,
	"currency_code" text DEFAULT 'USD' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_compensation_salary_changes" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"cycle_id" text NOT NULL,
	"recommendation_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"previous_salary" numeric(14, 2) NOT NULL,
	"new_salary" numeric(14, 2) NOT NULL,
	"adjustment_type" "hr_compensation_adjustment_type" NOT NULL,
	"effective_date" timestamp with time zone NOT NULL,
	"employee_history_event_id" text,
	"currency_code" text DEFAULT 'USD' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_compensation_scenarios" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"cycle_id" text NOT NULL,
	"recommendation_id" text,
	"participant_id" text NOT NULL,
	"label" text NOT NULL,
	"scenario_status" "hr_compensation_scenario_status" DEFAULT 'draft' NOT NULL,
	"snapshot" jsonb NOT NULL,
	"created_by_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hr_compensation_approval_steps" ADD CONSTRAINT "hr_compensation_approval_steps_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_compensation_approval_steps" ADD CONSTRAINT "hr_compensation_approval_steps_recommendation_id_hr_compensation_recommendations_id_fk" FOREIGN KEY ("recommendation_id") REFERENCES "public"."hr_compensation_recommendations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_compensation_audit_events" ADD CONSTRAINT "hr_compensation_audit_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_compensation_audit_events" ADD CONSTRAINT "hr_compensation_audit_events_cycle_id_hr_compensation_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."hr_compensation_cycles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_compensation_audit_events" ADD CONSTRAINT "hr_compensation_audit_events_recommendation_id_hr_compensation_recommendations_id_fk" FOREIGN KEY ("recommendation_id") REFERENCES "public"."hr_compensation_recommendations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_compensation_audit_events" ADD CONSTRAINT "hr_compensation_audit_events_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_compensation_budget_pools" ADD CONSTRAINT "hr_compensation_budget_pools_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_compensation_budget_pools" ADD CONSTRAINT "hr_compensation_budget_pools_cycle_id_hr_compensation_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."hr_compensation_cycles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_compensation_budget_pools" ADD CONSTRAINT "hr_compensation_budget_pools_department_id_hr_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."hr_departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_compensation_budget_pools" ADD CONSTRAINT "hr_compensation_budget_pools_manager_employee_id_hr_employees_id_fk" FOREIGN KEY ("manager_employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_compensation_cycle_participants" ADD CONSTRAINT "hr_compensation_cycle_participants_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_compensation_cycle_participants" ADD CONSTRAINT "hr_compensation_cycle_participants_cycle_id_hr_compensation_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."hr_compensation_cycles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_compensation_cycle_participants" ADD CONSTRAINT "hr_compensation_cycle_participants_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_compensation_cycle_participants" ADD CONSTRAINT "hr_compensation_cycle_participants_budget_pool_id_hr_compensation_budget_pools_id_fk" FOREIGN KEY ("budget_pool_id") REFERENCES "public"."hr_compensation_budget_pools"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_compensation_cycle_participants" ADD CONSTRAINT "hr_compensation_cycle_participants_department_id_hr_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."hr_departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_compensation_cycles" ADD CONSTRAINT "hr_compensation_cycles_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_compensation_eligibility_rules" ADD CONSTRAINT "hr_compensation_eligibility_rules_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_compensation_eligibility_rules" ADD CONSTRAINT "hr_compensation_eligibility_rules_cycle_id_hr_compensation_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."hr_compensation_cycles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_compensation_payroll_refs" ADD CONSTRAINT "hr_compensation_payroll_refs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_compensation_payroll_refs" ADD CONSTRAINT "hr_compensation_payroll_refs_salary_change_id_hr_compensation_salary_changes_id_fk" FOREIGN KEY ("salary_change_id") REFERENCES "public"."hr_compensation_salary_changes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_compensation_payroll_refs" ADD CONSTRAINT "hr_compensation_payroll_refs_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_compensation_recommendations" ADD CONSTRAINT "hr_compensation_recommendations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_compensation_recommendations" ADD CONSTRAINT "hr_compensation_recommendations_cycle_id_hr_compensation_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."hr_compensation_cycles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_compensation_recommendations" ADD CONSTRAINT "hr_compensation_recommendations_participant_id_hr_compensation_cycle_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."hr_compensation_cycle_participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_compensation_recommendations" ADD CONSTRAINT "hr_compensation_recommendations_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_compensation_recommendations" ADD CONSTRAINT "hr_compensation_recommendations_budget_pool_id_hr_compensation_budget_pools_id_fk" FOREIGN KEY ("budget_pool_id") REFERENCES "public"."hr_compensation_budget_pools"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_compensation_salary_bands" ADD CONSTRAINT "hr_compensation_salary_bands_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_compensation_salary_changes" ADD CONSTRAINT "hr_compensation_salary_changes_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_compensation_salary_changes" ADD CONSTRAINT "hr_compensation_salary_changes_cycle_id_hr_compensation_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."hr_compensation_cycles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_compensation_salary_changes" ADD CONSTRAINT "hr_compensation_salary_changes_recommendation_id_hr_compensation_recommendations_id_fk" FOREIGN KEY ("recommendation_id") REFERENCES "public"."hr_compensation_recommendations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_compensation_salary_changes" ADD CONSTRAINT "hr_compensation_salary_changes_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_compensation_scenarios" ADD CONSTRAINT "hr_compensation_scenarios_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_compensation_scenarios" ADD CONSTRAINT "hr_compensation_scenarios_cycle_id_hr_compensation_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."hr_compensation_cycles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_compensation_scenarios" ADD CONSTRAINT "hr_compensation_scenarios_recommendation_id_hr_compensation_recommendations_id_fk" FOREIGN KEY ("recommendation_id") REFERENCES "public"."hr_compensation_recommendations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_compensation_scenarios" ADD CONSTRAINT "hr_compensation_scenarios_participant_id_hr_compensation_cycle_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."hr_compensation_cycle_participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "hr_compensation_approval_steps_org_recommendation_idx" ON "hr_compensation_approval_steps" USING btree ("organization_id","recommendation_id","step_order");--> statement-breakpoint
CREATE INDEX "hr_compensation_audit_events_org_occurred_idx" ON "hr_compensation_audit_events" USING btree ("organization_id","occurred_at");--> statement-breakpoint
CREATE INDEX "hr_compensation_audit_events_org_cycle_idx" ON "hr_compensation_audit_events" USING btree ("organization_id","cycle_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_compensation_budget_pools_org_cycle_code_uidx" ON "hr_compensation_budget_pools" USING btree ("organization_id","cycle_id","code");--> statement-breakpoint
CREATE INDEX "hr_compensation_budget_pools_org_scope_idx" ON "hr_compensation_budget_pools" USING btree ("organization_id","scope","scope_ref");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_compensation_participants_org_cycle_employee_uidx" ON "hr_compensation_cycle_participants" USING btree ("organization_id","cycle_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_compensation_participants_org_eligibility_idx" ON "hr_compensation_cycle_participants" USING btree ("organization_id","eligibility_status");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_compensation_cycles_org_code_uidx" ON "hr_compensation_cycles" USING btree ("organization_id","code");--> statement-breakpoint
CREATE INDEX "hr_compensation_cycles_org_status_idx" ON "hr_compensation_cycles" USING btree ("organization_id","cycle_status");--> statement-breakpoint
CREATE INDEX "hr_compensation_eligibility_rules_org_cycle_idx" ON "hr_compensation_eligibility_rules" USING btree ("organization_id","cycle_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_compensation_payroll_refs_org_salary_change_uidx" ON "hr_compensation_payroll_refs" USING btree ("organization_id","salary_change_id");--> statement-breakpoint
CREATE INDEX "hr_compensation_payroll_refs_org_sync_status_idx" ON "hr_compensation_payroll_refs" USING btree ("organization_id","sync_status");--> statement-breakpoint
CREATE INDEX "hr_compensation_recommendations_org_cycle_status_idx" ON "hr_compensation_recommendations" USING btree ("organization_id","cycle_id","recommendation_status");--> statement-breakpoint
CREATE INDEX "hr_compensation_recommendations_org_employee_idx" ON "hr_compensation_recommendations" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_compensation_salary_bands_org_grade_entity_uidx" ON "hr_compensation_salary_bands" USING btree ("organization_id","grade","legal_entity_code");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_compensation_salary_changes_org_recommendation_uidx" ON "hr_compensation_salary_changes" USING btree ("organization_id","recommendation_id");--> statement-breakpoint
CREATE INDEX "hr_compensation_salary_changes_org_employee_idx" ON "hr_compensation_salary_changes" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_compensation_scenarios_org_cycle_idx" ON "hr_compensation_scenarios" USING btree ("organization_id","cycle_id");