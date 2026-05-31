CREATE TYPE "public"."hr_expense_approval_stage" AS ENUM('manager', 'finance', 'hr', 'exception', 'complete');--> statement-breakpoint
CREATE TYPE "public"."hr_expense_approval_status" AS ENUM('pending', 'approved', 'rejected', 'returned', 'clarification_requested');--> statement-breakpoint
CREATE TYPE "public"."hr_expense_approver_kind" AS ENUM('direct_manager', 'manager_chain', 'department_head', 'finance_pool', 'hr_owner', 'hr_pool', 'specific_user');--> statement-breakpoint
CREATE TYPE "public"."hr_expense_audit_action" AS ENUM('claim_submit', 'claim_approve', 'claim_reject', 'claim_return', 'claim_clarification_request', 'exception_approve', 'exception_reject');--> statement-breakpoint
CREATE TYPE "public"."hr_expense_claim_status" AS ENUM('draft', 'submitted', 'under_review', 'approved', 'rejected', 'returned', 'clarification_requested', 'paid', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."hr_expense_exception_kind" AS ENUM('over_limit', 'late_submission', 'missing_receipt', 'non_standard');--> statement-breakpoint
CREATE TYPE "public"."hr_expense_exception_status" AS ENUM('open', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."hr_expense_claim_category" AS ENUM('travel', 'meals', 'accommodation', 'transport', 'fuel', 'parking', 'tolls', 'office_supplies', 'medical', 'training', 'other');--> statement-breakpoint
CREATE TYPE "public"."hr_expense_receipt_kind" AS ENUM('receipt', 'invoice', 'proof_of_payment');--> statement-breakpoint
CREATE TYPE "public"."hr_expense_notification_kind" AS ENUM('submitted', 'approved', 'rejected', 'returned', 'overdue', 'paid');--> statement-breakpoint
CREATE TYPE "public"."hr_expense_payment_channel" AS ENUM('payroll', 'accounts_payable');--> statement-breakpoint
CREATE TABLE "hr_expense_approval_routes" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"policy_group_code" text DEFAULT 'default' NOT NULL,
	"name" text NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"department_id" text,
	"cost_center_code" text,
	"legal_entity_code" text,
	"category_code" text,
	"project_code" text,
	"min_amount_cents" integer,
	"max_amount_cents" integer,
	"requires_policy_exception" boolean DEFAULT false NOT NULL,
	"approver_kind" "hr_expense_approver_kind" NOT NULL,
	"specific_approver_auth_user_id" text,
	"manager_chain_max_depth" integer,
	"active" boolean DEFAULT true NOT NULL,
	"effective_from" timestamp with time zone DEFAULT now() NOT NULL,
	"effective_to" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_expense_approvals" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"claim_id" text NOT NULL,
	"status" "hr_expense_approval_status" DEFAULT 'pending' NOT NULL,
	"snapshot" jsonb NOT NULL,
	"assigned_approver_auth_user_id" text,
	"decided_by_auth_user_id" text,
	"decided_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_expense_audit_events" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"claim_id" text,
	"employee_id" text,
	"action" "hr_expense_audit_action" NOT NULL,
	"actor_auth_user_id" text,
	"summary" text NOT NULL,
	"metadata" jsonb,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_expense_claims" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"status" "hr_expense_claim_status" DEFAULT 'draft' NOT NULL,
	"policy_group_code" text DEFAULT 'default' NOT NULL,
	"category_code" text NOT NULL,
	"project_code" text,
	"legal_entity_code" text,
	"cost_center_code" text,
	"department_id" text,
	"currency_code" text DEFAULT 'MYR' NOT NULL,
	"amount_cents" integer NOT NULL,
	"expense_date" timestamp with time zone NOT NULL,
	"description" text,
	"approval_stage" "hr_expense_approval_stage" DEFAULT 'manager' NOT NULL,
	"current_approver_auth_user_id" text,
	"approval_snapshot" jsonb,
	"rejection_reason" text,
	"return_reason" text,
	"clarification_request" text,
	"decision_note" text,
	"submitted_at" timestamp with time zone,
	"decided_at" timestamp with time zone,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_expense_exceptions" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"claim_id" text NOT NULL,
	"kind" "hr_expense_exception_kind" NOT NULL,
	"status" "hr_expense_exception_status" DEFAULT 'open' NOT NULL,
	"message" text NOT NULL,
	"metadata" jsonb,
	"resolved_at" timestamp with time zone,
	"resolved_by_auth_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_expense_policies" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"policy_group_code" text DEFAULT 'default' NOT NULL,
	"require_finance_second_approval" boolean DEFAULT true NOT NULL,
	"require_hr_second_approval" boolean DEFAULT false NOT NULL,
	"manager_chain_max_depth" integer DEFAULT 3 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_expense_claim_receipts" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"claim_id" text NOT NULL,
	"line_item_id" text,
	"kind" "hr_expense_receipt_kind" DEFAULT 'receipt' NOT NULL,
	"title" text NOT NULL,
	"erp_document_id" text,
	"blob_url" text NOT NULL,
	"content_type" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"receipt_fingerprint" text NOT NULL,
	"receipt_date" timestamp with time zone,
	"merchant_name" text,
	"amount_cents" integer,
	"currency_code" text,
	"external_reference" text,
	"uploaded_by_auth_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_expense_eligibility_rules" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"policy_group_code" text DEFAULT 'default' NOT NULL,
	"category" "hr_expense_claim_category",
	"legal_entity_code" text,
	"work_location_code" text,
	"department_id" text,
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
CREATE TABLE "hr_expense_policy_category_rules" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"policy_id" text NOT NULL,
	"category" "hr_expense_claim_category" NOT NULL,
	"mandatory_receipt" boolean DEFAULT false NOT NULL,
	"per_claim_limit_cents" integer,
	"daily_limit_cents" integer,
	"monthly_limit_cents" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_expense_notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"recipient_auth_user_id" text NOT NULL,
	"kind" "hr_expense_notification_kind" NOT NULL,
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
CREATE TABLE "hr_expense_payment_references" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"claim_id" text NOT NULL,
	"payment_channel" "hr_expense_payment_channel" NOT NULL,
	"integration_reference" text NOT NULL,
	"payment_reference" text,
	"amount" numeric(14, 2) NOT NULL,
	"currency_code" text DEFAULT 'USD' NOT NULL,
	"earnings_code" text,
	"active" boolean DEFAULT true NOT NULL,
	"staged_at" timestamp with time zone DEFAULT now() NOT NULL,
	"paid_at" timestamp with time zone,
	"synced_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hr_expense_approval_routes" ADD CONSTRAINT "hr_expense_approval_routes_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_expense_approval_routes" ADD CONSTRAINT "hr_expense_approval_routes_department_id_hr_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."hr_departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_expense_approvals" ADD CONSTRAINT "hr_expense_approvals_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_expense_approvals" ADD CONSTRAINT "hr_expense_approvals_claim_id_hr_expense_claims_id_fk" FOREIGN KEY ("claim_id") REFERENCES "public"."hr_expense_claims"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_expense_audit_events" ADD CONSTRAINT "hr_expense_audit_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_expense_audit_events" ADD CONSTRAINT "hr_expense_audit_events_claim_id_hr_expense_claims_id_fk" FOREIGN KEY ("claim_id") REFERENCES "public"."hr_expense_claims"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_expense_audit_events" ADD CONSTRAINT "hr_expense_audit_events_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_expense_claims" ADD CONSTRAINT "hr_expense_claims_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_expense_claims" ADD CONSTRAINT "hr_expense_claims_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_expense_claims" ADD CONSTRAINT "hr_expense_claims_department_id_hr_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."hr_departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_expense_exceptions" ADD CONSTRAINT "hr_expense_exceptions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_expense_exceptions" ADD CONSTRAINT "hr_expense_exceptions_claim_id_hr_expense_claims_id_fk" FOREIGN KEY ("claim_id") REFERENCES "public"."hr_expense_claims"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_expense_policies" ADD CONSTRAINT "hr_expense_policies_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_expense_claim_receipts" ADD CONSTRAINT "hr_expense_claim_receipts_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_expense_claim_receipts" ADD CONSTRAINT "hr_expense_claim_receipts_claim_id_hr_expense_claims_id_fk" FOREIGN KEY ("claim_id") REFERENCES "public"."hr_expense_claims"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_expense_eligibility_rules" ADD CONSTRAINT "hr_expense_eligibility_rules_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_expense_eligibility_rules" ADD CONSTRAINT "hr_expense_eligibility_rules_department_id_hr_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."hr_departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_expense_policy_category_rules" ADD CONSTRAINT "hr_expense_policy_category_rules_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_expense_policy_category_rules" ADD CONSTRAINT "hr_expense_policy_category_rules_policy_id_hr_expense_policies_id_fk" FOREIGN KEY ("policy_id") REFERENCES "public"."hr_expense_policies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_expense_notifications" ADD CONSTRAINT "hr_expense_notifications_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_expense_notifications" ADD CONSTRAINT "hr_expense_notifications_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_expense_payment_references" ADD CONSTRAINT "hr_expense_payment_references_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_expense_payment_references" ADD CONSTRAINT "hr_expense_payment_references_claim_id_hr_expense_claims_id_fk" FOREIGN KEY ("claim_id") REFERENCES "public"."hr_expense_claims"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "hr_expense_approval_routes_org_group_idx" ON "hr_expense_approval_routes" USING btree ("organization_id","policy_group_code");--> statement-breakpoint
CREATE INDEX "hr_expense_approval_routes_org_priority_idx" ON "hr_expense_approval_routes" USING btree ("organization_id","priority");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_expense_approvals_org_claim_uidx" ON "hr_expense_approvals" USING btree ("organization_id","claim_id");--> statement-breakpoint
CREATE INDEX "hr_expense_approvals_org_status_idx" ON "hr_expense_approvals" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "hr_expense_audit_events_org_occurred_idx" ON "hr_expense_audit_events" USING btree ("organization_id","occurred_at");--> statement-breakpoint
CREATE INDEX "hr_expense_audit_events_org_claim_idx" ON "hr_expense_audit_events" USING btree ("organization_id","claim_id");--> statement-breakpoint
CREATE INDEX "hr_expense_claims_org_status_idx" ON "hr_expense_claims" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "hr_expense_claims_org_employee_idx" ON "hr_expense_claims" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_expense_claims_org_submitted_idx" ON "hr_expense_claims" USING btree ("organization_id","submitted_at");--> statement-breakpoint
CREATE INDEX "hr_expense_exceptions_org_claim_idx" ON "hr_expense_exceptions" USING btree ("organization_id","claim_id");--> statement-breakpoint
CREATE INDEX "hr_expense_exceptions_org_status_idx" ON "hr_expense_exceptions" USING btree ("organization_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_expense_exceptions_org_claim_kind_uidx" ON "hr_expense_exceptions" USING btree ("organization_id","claim_id","kind");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_expense_policies_org_group_uidx" ON "hr_expense_policies" USING btree ("organization_id","policy_group_code");--> statement-breakpoint
CREATE INDEX "hr_expense_claim_receipts_org_claim_idx" ON "hr_expense_claim_receipts" USING btree ("organization_id","claim_id");--> statement-breakpoint
CREATE INDEX "hr_expense_claim_receipts_org_fingerprint_idx" ON "hr_expense_claim_receipts" USING btree ("organization_id","receipt_fingerprint");--> statement-breakpoint
CREATE INDEX "hr_expense_eligibility_rules_org_group_cat_idx" ON "hr_expense_eligibility_rules" USING btree ("organization_id","policy_group_code","category");--> statement-breakpoint
CREATE INDEX "hr_expense_eligibility_rules_org_scope_idx" ON "hr_expense_eligibility_rules" USING btree ("organization_id","legal_entity_code","work_location_code","department_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_expense_policy_category_rules_policy_cat_uidx" ON "hr_expense_policy_category_rules" USING btree ("policy_id","category");--> statement-breakpoint
CREATE INDEX "hr_expense_policy_category_rules_org_policy_idx" ON "hr_expense_policy_category_rules" USING btree ("organization_id","policy_id");--> statement-breakpoint
CREATE INDEX "hr_expense_notifications_org_recipient_idx" ON "hr_expense_notifications" USING btree ("organization_id","recipient_auth_user_id");--> statement-breakpoint
CREATE INDEX "hr_expense_notifications_org_subject_idx" ON "hr_expense_notifications" USING btree ("organization_id","subject_type","subject_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_expense_payment_refs_org_integration_uidx" ON "hr_expense_payment_references" USING btree ("organization_id","integration_reference");--> statement-breakpoint
CREATE INDEX "hr_expense_payment_refs_org_claim_idx" ON "hr_expense_payment_references" USING btree ("organization_id","claim_id");--> statement-breakpoint
CREATE INDEX "hr_expense_payment_refs_org_channel_idx" ON "hr_expense_payment_references" USING btree ("organization_id","payment_channel","active");