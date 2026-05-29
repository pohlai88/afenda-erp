CREATE TYPE "public"."hr_employment_status" AS ENUM('active', 'suspended', 'terminated', 'archived');--> statement-breakpoint
CREATE TYPE "public"."hr_org_unit_status" AS ENUM('active', 'planned', 'frozen', 'closed');--> statement-breakpoint
CREATE TABLE "hr_departments" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"parent_department_id" text,
	"org_unit_status" "hr_org_unit_status" DEFAULT 'active' NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_employees" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"employee_number" text NOT NULL,
	"legal_name" text NOT NULL,
	"preferred_name" text,
	"email" text,
	"employment_status" "hr_employment_status" DEFAULT 'active' NOT NULL,
	"current_department_id" text,
	"current_position_id" text,
	"manager_employee_id" text,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_positions" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"code" text NOT NULL,
	"title" text NOT NULL,
	"department_id" text NOT NULL,
	"position_status" "hr_org_unit_status" DEFAULT 'active' NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hr_departments" ADD CONSTRAINT "hr_departments_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_employees" ADD CONSTRAINT "hr_employees_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_employees" ADD CONSTRAINT "hr_employees_current_department_id_hr_departments_id_fk" FOREIGN KEY ("current_department_id") REFERENCES "public"."hr_departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_employees" ADD CONSTRAINT "hr_employees_current_position_id_hr_positions_id_fk" FOREIGN KEY ("current_position_id") REFERENCES "public"."hr_positions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_positions" ADD CONSTRAINT "hr_positions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_positions" ADD CONSTRAINT "hr_positions_department_id_hr_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."hr_departments"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "hr_departments_org_code_uidx" ON "hr_departments" USING btree ("organization_id","code");--> statement-breakpoint
CREATE INDEX "hr_departments_org_archived_idx" ON "hr_departments" USING btree ("organization_id","archived_at");--> statement-breakpoint
CREATE INDEX "hr_departments_org_parent_idx" ON "hr_departments" USING btree ("organization_id","parent_department_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_employees_org_number_uidx" ON "hr_employees" USING btree ("organization_id","employee_number");--> statement-breakpoint
CREATE INDEX "hr_employees_org_status_idx" ON "hr_employees" USING btree ("organization_id","employment_status");--> statement-breakpoint
CREATE INDEX "hr_employees_org_archived_idx" ON "hr_employees" USING btree ("organization_id","archived_at");--> statement-breakpoint
CREATE INDEX "hr_employees_org_department_idx" ON "hr_employees" USING btree ("organization_id","current_department_id");--> statement-breakpoint
CREATE INDEX "hr_employees_org_manager_idx" ON "hr_employees" USING btree ("organization_id","manager_employee_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_positions_org_code_uidx" ON "hr_positions" USING btree ("organization_id","code");--> statement-breakpoint
CREATE INDEX "hr_positions_org_department_idx" ON "hr_positions" USING btree ("organization_id","department_id");--> statement-breakpoint
CREATE INDEX "hr_positions_org_archived_idx" ON "hr_positions" USING btree ("organization_id","archived_at");