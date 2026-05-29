CREATE TYPE "public"."hr_compliance_requirement_status" AS ENUM('compliant', 'pending', 'at_risk', 'overdue', 'expired', 'waived', 'non_compliant');--> statement-breakpoint
CREATE TABLE "hr_compliance_employee_requirements" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"obligation_id" text NOT NULL,
	"status" "hr_compliance_requirement_status" DEFAULT 'pending' NOT NULL,
	"due_date" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"review_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hr_employees" ADD COLUMN "country_code" text;--> statement-breakpoint
ALTER TABLE "hr_employees" ADD COLUMN "legal_entity_code" text;--> statement-breakpoint
ALTER TABLE "hr_employees" ADD COLUMN "work_location_code" text;--> statement-breakpoint
ALTER TABLE "hr_employees" ADD COLUMN "employment_type" text;--> statement-breakpoint
ALTER TABLE "hr_employees" ADD COLUMN "worker_category" text;--> statement-breakpoint
ALTER TABLE "hr_compliance_employee_requirements" ADD CONSTRAINT "hr_compliance_employee_requirements_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_compliance_employee_requirements" ADD CONSTRAINT "hr_compliance_employee_requirements_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_compliance_employee_requirements" ADD CONSTRAINT "hr_compliance_employee_requirements_obligation_id_hr_compliance_obligations_id_fk" FOREIGN KEY ("obligation_id") REFERENCES "public"."hr_compliance_obligations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "hr_compliance_employee_requirements_org_emp_obl_uidx" ON "hr_compliance_employee_requirements" USING btree ("organization_id","employee_id","obligation_id");--> statement-breakpoint
CREATE INDEX "hr_compliance_employee_requirements_org_status_idx" ON "hr_compliance_employee_requirements" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "hr_compliance_employee_requirements_org_employee_idx" ON "hr_compliance_employee_requirements" USING btree ("organization_id","employee_id");