CREATE TYPE "public"."system_admin_export_job_status" AS ENUM('ready', 'failed', 'expired');--> statement-breakpoint
CREATE TYPE "public"."system_admin_import_job_status" AS ENUM('uploaded', 'validating', 'ready', 'running', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."system_admin_import_row_status" AS ENUM('pending', 'validated', 'applied', 'failed', 'skipped');--> statement-breakpoint
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
CREATE TABLE "system_admin_data_export_jobs" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"export_type" text NOT NULL,
	"source_label" text NOT NULL,
	"status" "system_admin_export_job_status" DEFAULT 'ready' NOT NULL,
	"row_count" integer DEFAULT 0 NOT NULL,
	"package_digest" text NOT NULL,
	"created_by_auth_user_id" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_admin_data_import_jobs" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"adapter_id" text NOT NULL,
	"template_id" text NOT NULL,
	"source_label" text NOT NULL,
	"filename" text,
	"input_digest" text NOT NULL,
	"status" "system_admin_import_job_status" DEFAULT 'uploaded' NOT NULL,
	"total_rows" integer DEFAULT 0 NOT NULL,
	"validated_rows" integer DEFAULT 0 NOT NULL,
	"applied_rows" integer DEFAULT 0 NOT NULL,
	"failed_rows" integer DEFAULT 0 NOT NULL,
	"skipped_rows" integer DEFAULT 0 NOT NULL,
	"created_by_auth_user_id" text NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"error_summary" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_admin_data_import_rows" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"job_id" text NOT NULL,
	"row_number" integer NOT NULL,
	"status" "system_admin_import_row_status" DEFAULT 'pending' NOT NULL,
	"row_digest" text NOT NULL,
	"validation_code" text,
	"validation_message" text,
	"redacted_preview" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"applied_target_type" text,
	"applied_target_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hr_expense_policies" ADD COLUMN "require_finance_second_approval" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "hr_expense_policies" ADD COLUMN "require_hr_second_approval" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "hr_expense_policies" ADD COLUMN "manager_chain_max_depth" integer DEFAULT 3 NOT NULL;--> statement-breakpoint
ALTER TABLE "hr_expense_approval_routes" ADD CONSTRAINT "hr_expense_approval_routes_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_expense_approval_routes" ADD CONSTRAINT "hr_expense_approval_routes_department_id_hr_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."hr_departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_expense_approvals" ADD CONSTRAINT "hr_expense_approvals_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_expense_approvals" ADD CONSTRAINT "hr_expense_approvals_claim_id_hr_expense_claims_id_fk" FOREIGN KEY ("claim_id") REFERENCES "public"."hr_expense_claims"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_expense_exceptions" ADD CONSTRAINT "hr_expense_exceptions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_expense_exceptions" ADD CONSTRAINT "hr_expense_exceptions_claim_id_hr_expense_claims_id_fk" FOREIGN KEY ("claim_id") REFERENCES "public"."hr_expense_claims"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_admin_data_export_jobs" ADD CONSTRAINT "system_admin_data_export_jobs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_admin_data_import_jobs" ADD CONSTRAINT "system_admin_data_import_jobs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_admin_data_import_rows" ADD CONSTRAINT "system_admin_data_import_rows_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_admin_data_import_rows" ADD CONSTRAINT "system_admin_data_import_rows_job_id_system_admin_data_import_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."system_admin_data_import_jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "hr_expense_approval_routes_org_group_idx" ON "hr_expense_approval_routes" USING btree ("organization_id","policy_group_code");--> statement-breakpoint
CREATE INDEX "hr_expense_approval_routes_org_priority_idx" ON "hr_expense_approval_routes" USING btree ("organization_id","priority");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_expense_approvals_org_claim_uidx" ON "hr_expense_approvals" USING btree ("organization_id","claim_id");--> statement-breakpoint
CREATE INDEX "hr_expense_approvals_org_status_idx" ON "hr_expense_approvals" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "hr_expense_exceptions_org_claim_idx" ON "hr_expense_exceptions" USING btree ("organization_id","claim_id");--> statement-breakpoint
CREATE INDEX "hr_expense_exceptions_org_status_idx" ON "hr_expense_exceptions" USING btree ("organization_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_expense_exceptions_org_claim_kind_uidx" ON "hr_expense_exceptions" USING btree ("organization_id","claim_id","kind");--> statement-breakpoint
CREATE INDEX "system_admin_data_export_jobs_org_created_idx" ON "system_admin_data_export_jobs" USING btree ("organization_id","created_at");--> statement-breakpoint
CREATE INDEX "system_admin_data_export_jobs_org_type_idx" ON "system_admin_data_export_jobs" USING btree ("organization_id","export_type");--> statement-breakpoint
CREATE INDEX "system_admin_data_import_jobs_org_created_idx" ON "system_admin_data_import_jobs" USING btree ("organization_id","created_at");--> statement-breakpoint
CREATE INDEX "system_admin_data_import_jobs_org_status_idx" ON "system_admin_data_import_jobs" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "system_admin_data_import_jobs_org_adapter_idx" ON "system_admin_data_import_jobs" USING btree ("organization_id","adapter_id");--> statement-breakpoint
CREATE UNIQUE INDEX "system_admin_data_import_rows_job_number_idx" ON "system_admin_data_import_rows" USING btree ("job_id","row_number");--> statement-breakpoint
CREATE INDEX "system_admin_data_import_rows_org_job_idx" ON "system_admin_data_import_rows" USING btree ("organization_id","job_id");--> statement-breakpoint
CREATE INDEX "system_admin_data_import_rows_org_status_idx" ON "system_admin_data_import_rows" USING btree ("organization_id","status");