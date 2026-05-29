CREATE TYPE "public"."hr_assignment_status" AS ENUM('active', 'superseded', 'cancelled');--> statement-breakpoint
CREATE TABLE "hr_employee_assignments" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"department_id" text,
	"position_id" text,
	"manager_employee_id" text,
	"effective_from" timestamp with time zone NOT NULL,
	"effective_to" timestamp with time zone,
	"assignment_status" "hr_assignment_status" DEFAULT 'active' NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hr_employee_assignments" ADD CONSTRAINT "hr_employee_assignments_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_employee_assignments" ADD CONSTRAINT "hr_employee_assignments_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_employee_assignments" ADD CONSTRAINT "hr_employee_assignments_department_id_hr_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."hr_departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_employee_assignments" ADD CONSTRAINT "hr_employee_assignments_position_id_hr_positions_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."hr_positions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "hr_employee_assignments_org_employee_effective_idx" ON "hr_employee_assignments" USING btree ("organization_id","employee_id","effective_from");--> statement-breakpoint
CREATE INDEX "hr_employee_assignments_org_active_idx" ON "hr_employee_assignments" USING btree ("organization_id","assignment_status","effective_to");--> statement-breakpoint
CREATE INDEX "hr_employee_assignments_org_department_idx" ON "hr_employee_assignments" USING btree ("organization_id","department_id");--> statement-breakpoint
CREATE INDEX "hr_employee_assignments_org_position_idx" ON "hr_employee_assignments" USING btree ("organization_id","position_id");