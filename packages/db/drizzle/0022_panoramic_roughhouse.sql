CREATE TYPE "public"."hr_compliance_work_eligibility_status" AS ENUM('not_applicable', 'pending_verification', 'eligible', 'conditional', 'ineligible', 'expired');--> statement-breakpoint
CREATE TABLE "hr_compliance_work_eligibility" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"status" "hr_compliance_work_eligibility_status" DEFAULT 'pending_verification' NOT NULL,
	"verified_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"review_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hr_compliance_work_eligibility" ADD CONSTRAINT "hr_compliance_work_eligibility_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_compliance_work_eligibility" ADD CONSTRAINT "hr_compliance_work_eligibility_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "hr_compliance_work_eligibility_org_employee_uidx" ON "hr_compliance_work_eligibility" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_compliance_work_eligibility_org_status_idx" ON "hr_compliance_work_eligibility" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "hr_compliance_work_eligibility_org_employee_idx" ON "hr_compliance_work_eligibility" USING btree ("organization_id","employee_id");