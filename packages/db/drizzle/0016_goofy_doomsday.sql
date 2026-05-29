CREATE TYPE "public"."hr_onboarding_status" AS ENUM('in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."hr_workflow_checklist_status" AS ENUM('pending', 'done', 'waived');--> statement-breakpoint
CREATE TABLE "hr_document_requirements" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"document_type" text NOT NULL,
	"title" text NOT NULL,
	"required_for_status" "hr_employment_status",
	"grace_days_before_due" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_offboarding_clearance_items" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"case_id" text NOT NULL,
	"code" text NOT NULL,
	"title" text NOT NULL,
	"status" "hr_workflow_checklist_status" DEFAULT 'pending' NOT NULL,
	"completed_at" timestamp with time zone,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_onboarding_cases" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"status" "hr_onboarding_status" DEFAULT 'in_progress' NOT NULL,
	"prior_employment_status" "hr_employment_status" NOT NULL,
	"target_status" "hr_employment_status" DEFAULT 'active' NOT NULL,
	"reason" text,
	"completed_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_onboarding_checklist_items" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"case_id" text NOT NULL,
	"code" text NOT NULL,
	"title" text NOT NULL,
	"status" "hr_workflow_checklist_status" DEFAULT 'pending' NOT NULL,
	"completed_at" timestamp with time zone,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hr_document_requirements" ADD CONSTRAINT "hr_document_requirements_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_offboarding_clearance_items" ADD CONSTRAINT "hr_offboarding_clearance_items_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_offboarding_clearance_items" ADD CONSTRAINT "hr_offboarding_clearance_items_case_id_hr_offboarding_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."hr_offboarding_cases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_onboarding_cases" ADD CONSTRAINT "hr_onboarding_cases_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_onboarding_cases" ADD CONSTRAINT "hr_onboarding_cases_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_onboarding_checklist_items" ADD CONSTRAINT "hr_onboarding_checklist_items_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_onboarding_checklist_items" ADD CONSTRAINT "hr_onboarding_checklist_items_case_id_hr_onboarding_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."hr_onboarding_cases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "hr_document_requirements_org_type_status_uidx" ON "hr_document_requirements" USING btree ("organization_id","document_type","required_for_status");--> statement-breakpoint
CREATE INDEX "hr_document_requirements_org_active_idx" ON "hr_document_requirements" USING btree ("organization_id","active");--> statement-breakpoint
CREATE INDEX "hr_offboarding_clearance_org_case_idx" ON "hr_offboarding_clearance_items" USING btree ("organization_id","case_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_offboarding_clearance_case_code_uidx" ON "hr_offboarding_clearance_items" USING btree ("case_id","code");--> statement-breakpoint
CREATE INDEX "hr_onboarding_cases_org_employee_idx" ON "hr_onboarding_cases" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_onboarding_cases_org_status_idx" ON "hr_onboarding_cases" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "hr_onboarding_checklist_org_case_idx" ON "hr_onboarding_checklist_items" USING btree ("organization_id","case_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_onboarding_checklist_case_code_uidx" ON "hr_onboarding_checklist_items" USING btree ("case_id","code");