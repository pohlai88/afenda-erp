CREATE TYPE "public"."hr_compliance_exception_severity" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."hr_compliance_exception_status" AS ENUM('open', 'in_progress', 'resolved', 'waived');--> statement-breakpoint
CREATE TYPE "public"."hr_compliance_obligation_status" AS ENUM('active', 'archived');--> statement-breakpoint
CREATE TABLE "hr_compliance_exceptions" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"employee_id" text,
	"compliance_area" text NOT NULL,
	"item_type" text NOT NULL,
	"title" text NOT NULL,
	"severity" "hr_compliance_exception_severity" DEFAULT 'medium' NOT NULL,
	"status" "hr_compliance_exception_status" DEFAULT 'open' NOT NULL,
	"corrective_action_description" text,
	"corrective_action_due_date" timestamp with time zone,
	"resolution_note" text,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_compliance_obligations" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"code" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"compliance_area" text NOT NULL,
	"requirement_kind" text NOT NULL,
	"status" "hr_compliance_obligation_status" DEFAULT 'active' NOT NULL,
	"department_id" text,
	"due_date" timestamp with time zone,
	"effective_from" timestamp with time zone,
	"effective_to" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hr_compliance_exceptions" ADD CONSTRAINT "hr_compliance_exceptions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_compliance_exceptions" ADD CONSTRAINT "hr_compliance_exceptions_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_compliance_obligations" ADD CONSTRAINT "hr_compliance_obligations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_compliance_obligations" ADD CONSTRAINT "hr_compliance_obligations_department_id_hr_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."hr_departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "hr_compliance_exceptions_org_status_idx" ON "hr_compliance_exceptions" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "hr_compliance_exceptions_org_employee_idx" ON "hr_compliance_exceptions" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_compliance_exceptions_org_area_idx" ON "hr_compliance_exceptions" USING btree ("organization_id","compliance_area","status");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_compliance_obligations_org_code_uidx" ON "hr_compliance_obligations" USING btree ("organization_id","code");--> statement-breakpoint
CREATE INDEX "hr_compliance_obligations_org_status_idx" ON "hr_compliance_obligations" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "hr_compliance_obligations_org_area_idx" ON "hr_compliance_obligations" USING btree ("organization_id","compliance_area","status");