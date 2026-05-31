CREATE TYPE "public"."hr_bonus_payout_formula_kind" AS ENUM('fixed_amount', 'salary_percentage', 'sales_percentage', 'revenue_percentage', 'margin_percentage', 'kpi_score', 'performance_rating');--> statement-breakpoint
CREATE TYPE "public"."hr_bonus_plan_status" AS ENUM('draft', 'active', 'archived');--> statement-breakpoint
CREATE TYPE "public"."hr_bonus_plan_type" AS ENUM('annual_bonus', 'performance_bonus', 'discretionary_bonus', 'contractual_bonus', 'sales_commission', 'project_incentive', 'productivity_incentive', 'retention_incentive', 'referral_incentive');--> statement-breakpoint
CREATE TYPE "public"."hr_bonus_target_kind" AS ENUM('individual', 'team', 'department', 'company', 'sales', 'revenue', 'profit', 'project', 'kpi');--> statement-breakpoint
CREATE TYPE "public"."hr_bonus_payout_status" AS ENUM('draft', 'pending_approval', 'approved', 'locked', 'rejected', 'returned');--> statement-breakpoint
CREATE TABLE "hr_bonus_accelerator_rules" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"plan_id" text NOT NULL,
	"threshold_percent" numeric(8, 4) DEFAULT '100' NOT NULL,
	"accelerator_rate" numeric(8, 4) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_bonus_audit_events" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"plan_id" text,
	"target_id" text,
	"achievement_id" text,
	"employee_id" text,
	"actor_user_id" text NOT NULL,
	"action" text NOT NULL,
	"summary" text,
	"metadata" text,
	"occurred_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_bonus_commission_tiers" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"plan_id" text NOT NULL,
	"tier_order" integer DEFAULT 0 NOT NULL,
	"min_threshold" numeric(16, 4) NOT NULL,
	"max_threshold" numeric(16, 4),
	"rate_percent" numeric(8, 4) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_bonus_cycles" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"plan_id" text NOT NULL,
	"code" text NOT NULL,
	"period_start_at" timestamp with time zone NOT NULL,
	"period_end_at" timestamp with time zone NOT NULL,
	"cutoff_at" timestamp with time zone,
	"approval_at" timestamp with time zone,
	"payout_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_bonus_payout_formulas" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"plan_id" text NOT NULL,
	"formula_kind" "hr_bonus_payout_formula_kind" NOT NULL,
	"fixed_amount" numeric(14, 2),
	"percentage_rate" numeric(8, 4),
	"performance_rating_weight" numeric(14, 4),
	"payout_floor" numeric(14, 2),
	"payout_cap" numeric(14, 2),
	"currency_code" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_bonus_plans" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"plan_type" "hr_bonus_plan_type" NOT NULL,
	"plan_status" "hr_bonus_plan_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_bonus_target_achievements" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"target_id" text NOT NULL,
	"actual_value" numeric(16, 4) NOT NULL,
	"achievement_percent" numeric(8, 4),
	"recorded_by_user_id" text NOT NULL,
	"recorded_at" timestamp with time zone NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_bonus_targets" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"plan_id" text NOT NULL,
	"cycle_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"target_kind" "hr_bonus_target_kind" NOT NULL,
	"target_value" numeric(16, 4) NOT NULL,
	"currency_code" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_bonus_payouts" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"plan_id" text NOT NULL,
	"cycle_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"plan_type" "hr_bonus_plan_type" NOT NULL,
	"payout_status" "hr_bonus_payout_status" DEFAULT 'draft' NOT NULL,
	"calculated_amount" numeric(14, 2),
	"adjusted_amount" numeric(14, 2),
	"final_amount" numeric(14, 2),
	"target_amount" numeric(14, 2),
	"variance_amount" numeric(14, 2),
	"currency_code" text DEFAULT 'USD' NOT NULL,
	"eligible" boolean DEFAULT true NOT NULL,
	"eligibility_notes" text,
	"adjustment_reason" text,
	"rejection_reason" text,
	"approved_at" timestamp with time zone,
	"approved_by_user_id" text,
	"locked_at" timestamp with time zone,
	"locked_by_user_id" text,
	"legal_entity_code" text,
	"department_id" text,
	"cost_center_code" text,
	"project_code" text,
	"sales_region_code" text,
	"gl_reference" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_bonus_payroll_payout_references" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"payout_id" text NOT NULL,
	"payroll_payout_reference" text NOT NULL,
	"earnings_code" text NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"currency_code" text DEFAULT 'USD' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"effective_from" timestamp with time zone DEFAULT now() NOT NULL,
	"effective_to" timestamp with time zone,
	"synced_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hr_bonus_accelerator_rules" ADD CONSTRAINT "hr_bonus_accelerator_rules_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_accelerator_rules" ADD CONSTRAINT "hr_bonus_accelerator_rules_plan_id_hr_bonus_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."hr_bonus_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_audit_events" ADD CONSTRAINT "hr_bonus_audit_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_audit_events" ADD CONSTRAINT "hr_bonus_audit_events_plan_id_hr_bonus_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."hr_bonus_plans"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_audit_events" ADD CONSTRAINT "hr_bonus_audit_events_target_id_hr_bonus_targets_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."hr_bonus_targets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_audit_events" ADD CONSTRAINT "hr_bonus_audit_events_achievement_id_hr_bonus_target_achievements_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."hr_bonus_target_achievements"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_audit_events" ADD CONSTRAINT "hr_bonus_audit_events_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_commission_tiers" ADD CONSTRAINT "hr_bonus_commission_tiers_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_commission_tiers" ADD CONSTRAINT "hr_bonus_commission_tiers_plan_id_hr_bonus_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."hr_bonus_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_cycles" ADD CONSTRAINT "hr_bonus_cycles_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_cycles" ADD CONSTRAINT "hr_bonus_cycles_plan_id_hr_bonus_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."hr_bonus_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_payout_formulas" ADD CONSTRAINT "hr_bonus_payout_formulas_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_payout_formulas" ADD CONSTRAINT "hr_bonus_payout_formulas_plan_id_hr_bonus_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."hr_bonus_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_plans" ADD CONSTRAINT "hr_bonus_plans_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_target_achievements" ADD CONSTRAINT "hr_bonus_target_achievements_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_target_achievements" ADD CONSTRAINT "hr_bonus_target_achievements_target_id_hr_bonus_targets_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."hr_bonus_targets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_targets" ADD CONSTRAINT "hr_bonus_targets_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_targets" ADD CONSTRAINT "hr_bonus_targets_plan_id_hr_bonus_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."hr_bonus_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_targets" ADD CONSTRAINT "hr_bonus_targets_cycle_id_hr_bonus_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."hr_bonus_cycles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_targets" ADD CONSTRAINT "hr_bonus_targets_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_payouts" ADD CONSTRAINT "hr_bonus_payouts_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_payouts" ADD CONSTRAINT "hr_bonus_payouts_plan_id_hr_bonus_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."hr_bonus_plans"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_payouts" ADD CONSTRAINT "hr_bonus_payouts_cycle_id_hr_bonus_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."hr_bonus_cycles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_payouts" ADD CONSTRAINT "hr_bonus_payouts_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_payouts" ADD CONSTRAINT "hr_bonus_payouts_department_id_hr_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."hr_departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_payroll_payout_references" ADD CONSTRAINT "hr_bonus_payroll_payout_references_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_payroll_payout_references" ADD CONSTRAINT "hr_bonus_payroll_payout_references_payout_id_hr_bonus_payouts_id_fk" FOREIGN KEY ("payout_id") REFERENCES "public"."hr_bonus_payouts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "hr_bonus_accelerator_rules_org_plan_uidx" ON "hr_bonus_accelerator_rules" USING btree ("organization_id","plan_id");--> statement-breakpoint
CREATE INDEX "hr_bonus_audit_events_org_occurred_idx" ON "hr_bonus_audit_events" USING btree ("organization_id","occurred_at");--> statement-breakpoint
CREATE INDEX "hr_bonus_audit_events_org_plan_idx" ON "hr_bonus_audit_events" USING btree ("organization_id","plan_id");--> statement-breakpoint
CREATE INDEX "hr_bonus_commission_tiers_org_plan_order_idx" ON "hr_bonus_commission_tiers" USING btree ("organization_id","plan_id","tier_order");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_bonus_cycles_org_plan_code_uidx" ON "hr_bonus_cycles" USING btree ("organization_id","plan_id","code");--> statement-breakpoint
CREATE INDEX "hr_bonus_cycles_org_plan_idx" ON "hr_bonus_cycles" USING btree ("organization_id","plan_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_bonus_payout_formulas_org_plan_uidx" ON "hr_bonus_payout_formulas" USING btree ("organization_id","plan_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_bonus_plans_org_code_uidx" ON "hr_bonus_plans" USING btree ("organization_id","code");--> statement-breakpoint
CREATE INDEX "hr_bonus_plans_org_status_idx" ON "hr_bonus_plans" USING btree ("organization_id","plan_status");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_bonus_target_achievements_org_target_uidx" ON "hr_bonus_target_achievements" USING btree ("organization_id","target_id");--> statement-breakpoint
CREATE INDEX "hr_bonus_target_achievements_org_recorded_idx" ON "hr_bonus_target_achievements" USING btree ("organization_id","recorded_at");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_bonus_targets_org_cycle_employee_kind_uidx" ON "hr_bonus_targets" USING btree ("organization_id","cycle_id","employee_id","target_kind");--> statement-breakpoint
CREATE INDEX "hr_bonus_targets_org_plan_idx" ON "hr_bonus_targets" USING btree ("organization_id","plan_id");--> statement-breakpoint
CREATE INDEX "hr_bonus_targets_org_employee_idx" ON "hr_bonus_targets" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_bonus_payouts_org_status_idx" ON "hr_bonus_payouts" USING btree ("organization_id","payout_status");--> statement-breakpoint
CREATE INDEX "hr_bonus_payouts_org_plan_cycle_idx" ON "hr_bonus_payouts" USING btree ("organization_id","plan_id","cycle_id");--> statement-breakpoint
CREATE INDEX "hr_bonus_payouts_org_employee_idx" ON "hr_bonus_payouts" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_bonus_payouts_org_locked_idx" ON "hr_bonus_payouts" USING btree ("organization_id","locked_at");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_bonus_payroll_refs_org_payroll_ref_uidx" ON "hr_bonus_payroll_payout_references" USING btree ("organization_id","payroll_payout_reference");--> statement-breakpoint
CREATE INDEX "hr_bonus_payroll_refs_org_payout_idx" ON "hr_bonus_payroll_payout_references" USING btree ("organization_id","payout_id");--> statement-breakpoint
CREATE INDEX "hr_bonus_payroll_refs_org_active_idx" ON "hr_bonus_payroll_payout_references" USING btree ("organization_id","active");