CREATE TYPE "public"."hr_attendance_day_state" AS ENUM('open', 'computed', 'locked');--> statement-breakpoint
CREATE TYPE "public"."hr_attendance_day_status" AS ENUM('present', 'absent', 'late', 'early_out', 'half_day', 'rest_day', 'off_day', 'public_holiday', 'missing_punch');--> statement-breakpoint
CREATE TYPE "public"."hr_leave_approval_stage" AS ENUM('manager', 'hr', 'complete');--> statement-breakpoint
CREATE TYPE "public"."hr_leave_balance_ledger_kind" AS ENUM('pending_reserve', 'pending_release', 'used', 'manual_correction', 'carry_forward', 'forfeiture', 'reversal', 'amendment_delta');--> statement-breakpoint
ALTER TYPE "public"."hr_leave_request_status" ADD VALUE 'returned' BEFORE 'approved';--> statement-breakpoint
ALTER TYPE "public"."hr_leave_request_status" ADD VALUE 'clarification_requested' BEFORE 'approved';--> statement-breakpoint
ALTER TYPE "public"."hr_leave_type" ADD VALUE 'medical' BEFORE 'unpaid';--> statement-breakpoint
ALTER TYPE "public"."hr_leave_type" ADD VALUE 'maternity' BEFORE 'compassionate';--> statement-breakpoint
ALTER TYPE "public"."hr_leave_type" ADD VALUE 'paternity' BEFORE 'compassionate';--> statement-breakpoint
ALTER TYPE "public"."hr_leave_type" ADD VALUE 'emergency' BEFORE 'other';--> statement-breakpoint
ALTER TYPE "public"."hr_leave_type" ADD VALUE 'study' BEFORE 'other';--> statement-breakpoint
ALTER TYPE "public"."hr_leave_type" ADD VALUE 'replacement' BEFORE 'other';--> statement-breakpoint
ALTER TYPE "public"."hr_leave_type" ADD VALUE 'hospitalization' BEFORE 'other';--> statement-breakpoint
CREATE TABLE "hr_attendance_days" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"work_date" timestamp with time zone NOT NULL,
	"work_calendar_code" text DEFAULT 'default' NOT NULL,
	"status" "hr_attendance_day_status" NOT NULL,
	"day_state" "hr_attendance_day_state" DEFAULT 'open' NOT NULL,
	"calculation_snapshot" jsonb,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_leave_balance_ledger" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"balance_id" text NOT NULL,
	"leave_request_id" text,
	"kind" "hr_leave_balance_ledger_kind" NOT NULL,
	"amount_days" numeric(8, 2) NOT NULL,
	"reason" text NOT NULL,
	"authorized_by_auth_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_leave_balances" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"leave_type" "hr_leave_type" NOT NULL,
	"entitlement_year" integer NOT NULL,
	"opening_days" numeric(8, 2) DEFAULT '0' NOT NULL,
	"earned_days" numeric(8, 2) DEFAULT '0' NOT NULL,
	"used_days" numeric(8, 2) DEFAULT '0' NOT NULL,
	"pending_days" numeric(8, 2) DEFAULT '0' NOT NULL,
	"adjusted_days" numeric(8, 2) DEFAULT '0' NOT NULL,
	"forfeited_days" numeric(8, 2) DEFAULT '0' NOT NULL,
	"carried_forward_days" numeric(8, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_leave_blackout_periods" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"label" text NOT NULL,
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone NOT NULL,
	"leave_types" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_leave_entitlement_rules" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"policy_group_code" text DEFAULT 'default' NOT NULL,
	"leave_type" "hr_leave_type" NOT NULL,
	"legal_entity_code" text,
	"country_code" text,
	"work_location_code" text,
	"employment_type" text,
	"grade" text,
	"min_tenure_months" integer,
	"max_tenure_months" integer,
	"annual_entitlement_days" numeric(8, 2) NOT NULL,
	"requires_confirmation" boolean DEFAULT false NOT NULL,
	"effective_from" timestamp with time zone DEFAULT now() NOT NULL,
	"effective_to" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_leave_policies" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"policy_group_code" text DEFAULT 'default' NOT NULL,
	"min_notice_days" integer DEFAULT 1 NOT NULL,
	"max_consecutive_days" integer,
	"require_hr_approval_when_days_gte" integer,
	"require_hr_approval_leave_types" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"manager_chain_max_depth" integer DEFAULT 3 NOT NULL,
	"allow_cancellation_while_pending" boolean DEFAULT true NOT NULL,
	"allow_amendment_after_approval" boolean DEFAULT false NOT NULL,
	"carry_forward_enabled" boolean DEFAULT true NOT NULL,
	"max_carry_forward_days" numeric(6, 2),
	"forfeiture_at_year_end" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_leave_type_configs" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"policy_group_code" text DEFAULT 'default' NOT NULL,
	"leave_type" "hr_leave_type" NOT NULL,
	"label" text NOT NULL,
	"requires_supporting_document" boolean DEFAULT false NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hr_leave_requests" ADD COLUMN "policy_group_code" text DEFAULT 'default' NOT NULL;--> statement-breakpoint
ALTER TABLE "hr_leave_requests" ADD COLUMN "approval_stage" "hr_leave_approval_stage" DEFAULT 'manager' NOT NULL;--> statement-breakpoint
ALTER TABLE "hr_leave_requests" ADD COLUMN "current_approver_auth_user_id" text;--> statement-breakpoint
ALTER TABLE "hr_leave_requests" ADD COLUMN IF NOT EXISTS "entitlement_year" integer;--> statement-breakpoint
UPDATE "hr_leave_requests"
SET "entitlement_year" = COALESCE(
  EXTRACT(YEAR FROM "start_at" AT TIME ZONE 'UTC')::integer,
  EXTRACT(YEAR FROM "submitted_at" AT TIME ZONE 'UTC')::integer,
  EXTRACT(YEAR FROM CURRENT_DATE)::integer
)
WHERE "entitlement_year" IS NULL;--> statement-breakpoint
ALTER TABLE "hr_leave_requests" ALTER COLUMN "entitlement_year" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "hr_leave_requests" ADD COLUMN "supporting_document_id" text;--> statement-breakpoint
ALTER TABLE "hr_leave_requests" ADD COLUMN "rejection_reason" text;--> statement-breakpoint
ALTER TABLE "hr_leave_requests" ADD COLUMN "returned_note" text;--> statement-breakpoint
ALTER TABLE "hr_leave_requests" ADD COLUMN "clarification_note" text;--> statement-breakpoint
ALTER TABLE "hr_leave_requests" ADD COLUMN "amendment_of_request_id" text;--> statement-breakpoint
ALTER TABLE "hr_leave_requests" ADD COLUMN "policy_snapshot" jsonb;--> statement-breakpoint
ALTER TABLE "hr_leave_requests" ADD COLUMN "payroll_deduction_reference" text;--> statement-breakpoint
ALTER TABLE "hr_attendance_days" ADD CONSTRAINT "hr_attendance_days_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_attendance_days" ADD CONSTRAINT "hr_attendance_days_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_leave_balance_ledger" ADD CONSTRAINT "hr_leave_balance_ledger_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_leave_balance_ledger" ADD CONSTRAINT "hr_leave_balance_ledger_balance_id_hr_leave_balances_id_fk" FOREIGN KEY ("balance_id") REFERENCES "public"."hr_leave_balances"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_leave_balance_ledger" ADD CONSTRAINT "hr_leave_balance_ledger_leave_request_id_hr_leave_requests_id_fk" FOREIGN KEY ("leave_request_id") REFERENCES "public"."hr_leave_requests"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_leave_balances" ADD CONSTRAINT "hr_leave_balances_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_leave_balances" ADD CONSTRAINT "hr_leave_balances_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_leave_blackout_periods" ADD CONSTRAINT "hr_leave_blackout_periods_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_leave_entitlement_rules" ADD CONSTRAINT "hr_leave_entitlement_rules_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_leave_policies" ADD CONSTRAINT "hr_leave_policies_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_leave_type_configs" ADD CONSTRAINT "hr_leave_type_configs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "hr_attendance_days_org_employee_date_uidx" ON "hr_attendance_days" USING btree ("organization_id","employee_id","work_date");--> statement-breakpoint
CREATE INDEX "hr_attendance_days_org_status_idx" ON "hr_attendance_days" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "hr_attendance_days_org_calendar_idx" ON "hr_attendance_days" USING btree ("organization_id","work_calendar_code");--> statement-breakpoint
CREATE INDEX "hr_leave_balance_ledger_org_balance_idx" ON "hr_leave_balance_ledger" USING btree ("organization_id","balance_id");--> statement-breakpoint
CREATE INDEX "hr_leave_balance_ledger_org_request_idx" ON "hr_leave_balance_ledger" USING btree ("organization_id","leave_request_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_leave_balances_org_employee_type_year_uidx" ON "hr_leave_balances" USING btree ("organization_id","employee_id","leave_type","entitlement_year");--> statement-breakpoint
CREATE INDEX "hr_leave_balances_org_employee_idx" ON "hr_leave_balances" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_leave_blackout_org_start_idx" ON "hr_leave_blackout_periods" USING btree ("organization_id","start_at");--> statement-breakpoint
CREATE INDEX "hr_leave_entitlement_rules_org_group_type_idx" ON "hr_leave_entitlement_rules" USING btree ("organization_id","policy_group_code","leave_type");--> statement-breakpoint
CREATE INDEX "hr_leave_entitlement_rules_org_effective_idx" ON "hr_leave_entitlement_rules" USING btree ("organization_id","effective_from","effective_to");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_leave_policies_org_group_uidx" ON "hr_leave_policies" USING btree ("organization_id","policy_group_code");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_leave_type_configs_org_group_type_uidx" ON "hr_leave_type_configs" USING btree ("organization_id","policy_group_code","leave_type");--> statement-breakpoint
CREATE INDEX "hr_leave_type_configs_org_group_idx" ON "hr_leave_type_configs" USING btree ("organization_id","policy_group_code");--> statement-breakpoint
ALTER TABLE "hr_leave_requests" ADD CONSTRAINT "hr_leave_requests_supporting_document_id_hr_employee_documents_id_fk" FOREIGN KEY ("supporting_document_id") REFERENCES "public"."hr_employee_documents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "hr_leave_requests_org_approver_idx" ON "hr_leave_requests" USING btree ("organization_id","current_approver_auth_user_id");--> statement-breakpoint
CREATE INDEX "hr_leave_requests_org_payroll_ref_idx" ON "hr_leave_requests" USING btree ("organization_id","payroll_deduction_reference");