CREATE TYPE "public"."hr_bonus_multiplier_scope" AS ENUM('company', 'department', 'team', 'individual');--> statement-breakpoint
CREATE TYPE "public"."hr_bonus_proration_reason" AS ENUM('new_joiner', 'resignation', 'unpaid_leave', 'partial_period');--> statement-breakpoint
CREATE TYPE "public"."hr_bonus_recommendation_status" AS ENUM('draft', 'submitted', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."hr_bonus_recovery_kind" AS ENUM('commission_reversal', 'payout_correction', 'overpayment_recovery', 'clawback');--> statement-breakpoint
CREATE TABLE "hr_bonus_discretionary_recommendations" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"plan_id" text,
	"employee_id" text NOT NULL,
	"recommended_amount" numeric(14, 2) NOT NULL,
	"currency_code" text DEFAULT 'USD' NOT NULL,
	"recommendation_status" "hr_bonus_recommendation_status" DEFAULT 'draft' NOT NULL,
	"recommender_user_id" text NOT NULL,
	"rationale" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_bonus_guaranteed_rules" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"plan_id" text NOT NULL,
	"label" text NOT NULL,
	"minimum_amount" numeric(14, 2) NOT NULL,
	"currency_code" text DEFAULT 'USD' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_bonus_manual_adjustments" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"plan_id" text NOT NULL,
	"cycle_id" text,
	"employee_id" text NOT NULL,
	"adjustment_amount" numeric(14, 2) NOT NULL,
	"currency_code" text DEFAULT 'USD' NOT NULL,
	"justification" text NOT NULL,
	"approval_reference" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_bonus_performance_multipliers" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"plan_id" text NOT NULL,
	"scope" "hr_bonus_multiplier_scope" NOT NULL,
	"scope_ref" text,
	"department_id" text,
	"multiplier" numeric(8, 4) NOT NULL,
	"effective_from" timestamp with time zone DEFAULT now() NOT NULL,
	"effective_to" timestamp with time zone,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_bonus_prorations" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"plan_id" text NOT NULL,
	"cycle_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"reason" "hr_bonus_proration_reason" NOT NULL,
	"proration_factor" numeric(8, 4) NOT NULL,
	"period_start_at" timestamp with time zone,
	"period_end_at" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_bonus_recoveries" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"plan_id" text,
	"employee_id" text NOT NULL,
	"recovery_kind" "hr_bonus_recovery_kind" NOT NULL,
	"recovery_amount" numeric(14, 2) NOT NULL,
	"currency_code" text DEFAULT 'USD' NOT NULL,
	"reference_code" text NOT NULL,
	"clawback_reference" text,
	"notes" text,
	"recorded_by_user_id" text NOT NULL,
	"recorded_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_bonus_payout_audit_events" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"payout_id" text,
	"plan_id" text,
	"cycle_id" text,
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
ALTER TABLE "hr_bonus_plans" ADD COLUMN "currency_code" text DEFAULT 'USD' NOT NULL;--> statement-breakpoint
ALTER TABLE "hr_bonus_plans" ADD COLUMN "requires_approval" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "hr_bonus_discretionary_recommendations" ADD CONSTRAINT "hr_bonus_discretionary_recommendations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_discretionary_recommendations" ADD CONSTRAINT "hr_bonus_discretionary_recommendations_plan_id_hr_bonus_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."hr_bonus_plans"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_discretionary_recommendations" ADD CONSTRAINT "hr_bonus_discretionary_recommendations_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_guaranteed_rules" ADD CONSTRAINT "hr_bonus_guaranteed_rules_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_guaranteed_rules" ADD CONSTRAINT "hr_bonus_guaranteed_rules_plan_id_hr_bonus_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."hr_bonus_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_manual_adjustments" ADD CONSTRAINT "hr_bonus_manual_adjustments_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_manual_adjustments" ADD CONSTRAINT "hr_bonus_manual_adjustments_plan_id_hr_bonus_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."hr_bonus_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_manual_adjustments" ADD CONSTRAINT "hr_bonus_manual_adjustments_cycle_id_hr_bonus_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."hr_bonus_cycles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_manual_adjustments" ADD CONSTRAINT "hr_bonus_manual_adjustments_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_performance_multipliers" ADD CONSTRAINT "hr_bonus_performance_multipliers_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_performance_multipliers" ADD CONSTRAINT "hr_bonus_performance_multipliers_plan_id_hr_bonus_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."hr_bonus_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_performance_multipliers" ADD CONSTRAINT "hr_bonus_performance_multipliers_department_id_hr_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."hr_departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_prorations" ADD CONSTRAINT "hr_bonus_prorations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_prorations" ADD CONSTRAINT "hr_bonus_prorations_plan_id_hr_bonus_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."hr_bonus_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_prorations" ADD CONSTRAINT "hr_bonus_prorations_cycle_id_hr_bonus_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."hr_bonus_cycles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_prorations" ADD CONSTRAINT "hr_bonus_prorations_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_recoveries" ADD CONSTRAINT "hr_bonus_recoveries_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_recoveries" ADD CONSTRAINT "hr_bonus_recoveries_plan_id_hr_bonus_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."hr_bonus_plans"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_recoveries" ADD CONSTRAINT "hr_bonus_recoveries_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_payout_audit_events" ADD CONSTRAINT "hr_bonus_payout_audit_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_payout_audit_events" ADD CONSTRAINT "hr_bonus_payout_audit_events_payout_id_hr_bonus_payouts_id_fk" FOREIGN KEY ("payout_id") REFERENCES "public"."hr_bonus_payouts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_payout_audit_events" ADD CONSTRAINT "hr_bonus_payout_audit_events_plan_id_hr_bonus_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."hr_bonus_plans"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_payout_audit_events" ADD CONSTRAINT "hr_bonus_payout_audit_events_cycle_id_hr_bonus_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."hr_bonus_cycles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_payout_audit_events" ADD CONSTRAINT "hr_bonus_payout_audit_events_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "hr_bonus_recommendations_org_status_idx" ON "hr_bonus_discretionary_recommendations" USING btree ("organization_id","recommendation_status");--> statement-breakpoint
CREATE INDEX "hr_bonus_recommendations_org_employee_idx" ON "hr_bonus_discretionary_recommendations" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_bonus_guaranteed_rules_org_plan_idx" ON "hr_bonus_guaranteed_rules" USING btree ("organization_id","plan_id");--> statement-breakpoint
CREATE INDEX "hr_bonus_guaranteed_rules_org_active_idx" ON "hr_bonus_guaranteed_rules" USING btree ("organization_id","active");--> statement-breakpoint
CREATE INDEX "hr_bonus_manual_adjustments_org_employee_idx" ON "hr_bonus_manual_adjustments" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_bonus_manual_adjustments_org_status_idx" ON "hr_bonus_manual_adjustments" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "hr_bonus_multipliers_org_plan_scope_idx" ON "hr_bonus_performance_multipliers" USING btree ("organization_id","plan_id","scope");--> statement-breakpoint
CREATE INDEX "hr_bonus_prorations_org_employee_idx" ON "hr_bonus_prorations" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_bonus_prorations_org_plan_cycle_idx" ON "hr_bonus_prorations" USING btree ("organization_id","plan_id","cycle_id");--> statement-breakpoint
CREATE INDEX "hr_bonus_recoveries_org_kind_idx" ON "hr_bonus_recoveries" USING btree ("organization_id","recovery_kind");--> statement-breakpoint
CREATE INDEX "hr_bonus_recoveries_org_employee_idx" ON "hr_bonus_recoveries" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_bonus_payout_audit_events_org_occurred_idx" ON "hr_bonus_payout_audit_events" USING btree ("organization_id","occurred_at");--> statement-breakpoint
CREATE INDEX "hr_bonus_payout_audit_events_org_payout_idx" ON "hr_bonus_payout_audit_events" USING btree ("organization_id","payout_id");--> statement-breakpoint
CREATE INDEX "hr_bonus_payout_audit_events_org_employee_idx" ON "hr_bonus_payout_audit_events" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_bonus_payout_audit_events_org_action_idx" ON "hr_bonus_payout_audit_events" USING btree ("organization_id","action");