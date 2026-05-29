CREATE TYPE "public"."hr_shift_assignment_status" AS ENUM('scheduled', 'published', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."hr_shift_template_status" AS ENUM('active', 'archived');--> statement-breakpoint
CREATE TABLE "hr_shift_assignments" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"template_id" text NOT NULL,
	"status" "hr_shift_assignment_status" DEFAULT 'scheduled' NOT NULL,
	"shift_date" timestamp with time zone NOT NULL,
	"shift_start" timestamp with time zone NOT NULL,
	"shift_end" timestamp with time zone NOT NULL,
	"notes" text,
	"published_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_shift_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"status" "hr_shift_template_status" DEFAULT 'active' NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hr_employee_documents" ADD COLUMN "rejection_reason" text;--> statement-breakpoint
ALTER TABLE "hr_shift_assignments" ADD CONSTRAINT "hr_shift_assignments_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_shift_assignments" ADD CONSTRAINT "hr_shift_assignments_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_shift_assignments" ADD CONSTRAINT "hr_shift_assignments_template_id_hr_shift_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."hr_shift_templates"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_shift_templates" ADD CONSTRAINT "hr_shift_templates_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "hr_shift_assignments_org_status_idx" ON "hr_shift_assignments" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "hr_shift_assignments_org_employee_date_idx" ON "hr_shift_assignments" USING btree ("organization_id","employee_id","shift_date");--> statement-breakpoint
CREATE INDEX "hr_shift_assignments_org_shift_start_idx" ON "hr_shift_assignments" USING btree ("organization_id","shift_start");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_shift_templates_org_code_uidx" ON "hr_shift_templates" USING btree ("organization_id","code");--> statement-breakpoint
CREATE INDEX "hr_shift_templates_org_status_idx" ON "hr_shift_templates" USING btree ("organization_id","status");