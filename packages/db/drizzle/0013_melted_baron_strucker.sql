CREATE TYPE "public"."hr_offboarding_status" AS ENUM('in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TABLE "hr_offboarding_cases" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"status" "hr_offboarding_status" DEFAULT 'in_progress' NOT NULL,
	"prior_employment_status" "hr_employment_status" NOT NULL,
	"reason" text,
	"last_working_date" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hr_offboarding_cases" ADD CONSTRAINT "hr_offboarding_cases_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_offboarding_cases" ADD CONSTRAINT "hr_offboarding_cases_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "hr_offboarding_cases_org_employee_idx" ON "hr_offboarding_cases" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_offboarding_cases_org_status_idx" ON "hr_offboarding_cases" USING btree ("organization_id","status");