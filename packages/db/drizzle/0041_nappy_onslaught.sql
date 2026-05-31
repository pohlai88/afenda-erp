CREATE TYPE "public"."hr_bonus_cycle_status" AS ENUM('draft', 'open', 'closed');--> statement-breakpoint
CREATE TYPE "public"."hr_bonus_plan_participant_status" AS ENUM('assigned', 'excluded', 'pending_review');--> statement-breakpoint
CREATE TABLE "hr_bonus_eligibility_rules" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"plan_id" text NOT NULL,
	"legal_entity_code" text,
	"department_id" text,
	"grade" text,
	"job_role" text,
	"employment_type" text,
	"min_tenure_months" integer,
	"max_tenure_months" integer,
	"performance_rating" text,
	"sales_team_code" text,
	"employee_status" text,
	"active" boolean DEFAULT true NOT NULL,
	"effective_from" timestamp with time zone DEFAULT now() NOT NULL,
	"effective_to" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_bonus_plan_participants" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"plan_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"assignment_status" "hr_bonus_plan_participant_status" DEFAULT 'assigned' NOT NULL,
	"eligible" boolean DEFAULT true NOT NULL,
	"ineligibility_reason" text,
	"assigned_by_user_id" text NOT NULL,
	"assigned_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_bonus_payout_approval_steps" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"payout_id" text NOT NULL,
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
DROP INDEX "hr_bonus_targets_org_cycle_employee_kind_uidx";--> statement-breakpoint
ALTER TABLE "hr_bonus_targets" ALTER COLUMN "employee_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "hr_bonus_cycles" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "hr_bonus_cycles" ADD COLUMN "cycle_status" "hr_bonus_cycle_status" DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "hr_bonus_plans" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "hr_bonus_plans" ADD COLUMN "approval_routing_config" jsonb;--> statement-breakpoint
ALTER TABLE "hr_bonus_plans" ADD COLUMN "effective_from" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "hr_bonus_plans" ADD COLUMN "effective_to" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "hr_bonus_plans" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "hr_bonus_targets" ADD COLUMN "scope_key" text NOT NULL;--> statement-breakpoint
ALTER TABLE "hr_bonus_targets" ADD COLUMN "label" text;--> statement-breakpoint
ALTER TABLE "hr_bonus_targets" ADD COLUMN "department_id" text;--> statement-breakpoint
ALTER TABLE "hr_bonus_targets" ADD COLUMN "team_ref" text;--> statement-breakpoint
ALTER TABLE "hr_bonus_targets" ADD COLUMN "project_ref" text;--> statement-breakpoint
ALTER TABLE "hr_bonus_payouts" ADD COLUMN "validation_flags" jsonb;--> statement-breakpoint
ALTER TABLE "hr_bonus_payouts" ADD COLUMN "performance_rating" numeric(8, 4);--> statement-breakpoint
ALTER TABLE "hr_bonus_payouts" ADD COLUMN "return_reason" text;--> statement-breakpoint
ALTER TABLE "hr_bonus_payouts" ADD COLUMN "submitted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "hr_bonus_eligibility_rules" ADD CONSTRAINT "hr_bonus_eligibility_rules_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_eligibility_rules" ADD CONSTRAINT "hr_bonus_eligibility_rules_plan_id_hr_bonus_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."hr_bonus_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_eligibility_rules" ADD CONSTRAINT "hr_bonus_eligibility_rules_department_id_hr_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."hr_departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_plan_participants" ADD CONSTRAINT "hr_bonus_plan_participants_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_plan_participants" ADD CONSTRAINT "hr_bonus_plan_participants_plan_id_hr_bonus_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."hr_bonus_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_plan_participants" ADD CONSTRAINT "hr_bonus_plan_participants_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_payout_approval_steps" ADD CONSTRAINT "hr_bonus_payout_approval_steps_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_bonus_payout_approval_steps" ADD CONSTRAINT "hr_bonus_payout_approval_steps_payout_id_hr_bonus_payouts_id_fk" FOREIGN KEY ("payout_id") REFERENCES "public"."hr_bonus_payouts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "hr_bonus_eligibility_rules_org_plan_idx" ON "hr_bonus_eligibility_rules" USING btree ("organization_id","plan_id","active");--> statement-breakpoint
CREATE INDEX "hr_bonus_eligibility_rules_org_scope_idx" ON "hr_bonus_eligibility_rules" USING btree ("organization_id","legal_entity_code","department_id","employment_type");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_bonus_plan_participants_org_plan_employee_uidx" ON "hr_bonus_plan_participants" USING btree ("organization_id","plan_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_bonus_plan_participants_org_plan_idx" ON "hr_bonus_plan_participants" USING btree ("organization_id","plan_id");--> statement-breakpoint
CREATE INDEX "hr_bonus_plan_participants_org_employee_idx" ON "hr_bonus_plan_participants" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_bonus_payout_approval_steps_org_payout_idx" ON "hr_bonus_payout_approval_steps" USING btree ("organization_id","payout_id","step_order");--> statement-breakpoint
ALTER TABLE "hr_bonus_targets" ADD CONSTRAINT "hr_bonus_targets_department_id_hr_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."hr_departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "hr_bonus_cycles_org_status_idx" ON "hr_bonus_cycles" USING btree ("organization_id","cycle_status");--> statement-breakpoint
CREATE INDEX "hr_bonus_plans_org_effective_idx" ON "hr_bonus_plans" USING btree ("organization_id","effective_from","effective_to");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_bonus_targets_org_cycle_kind_scope_uidx" ON "hr_bonus_targets" USING btree ("organization_id","cycle_id","target_kind","scope_key");