CREATE TYPE "public"."hr_leave_request_status" AS ENUM('pending', 'approved', 'rejected', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."hr_leave_type" AS ENUM('annual', 'sick', 'unpaid', 'compassionate', 'other');--> statement-breakpoint
CREATE TABLE "hr_leave_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"leave_type" "hr_leave_type" NOT NULL,
	"status" "hr_leave_request_status" DEFAULT 'pending' NOT NULL,
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone NOT NULL,
	"duration_days" numeric(6, 2) NOT NULL,
	"reason" text,
	"decision_note" text,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"decided_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hr_leave_requests" ADD CONSTRAINT "hr_leave_requests_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_leave_requests" ADD CONSTRAINT "hr_leave_requests_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "hr_leave_requests_org_status_idx" ON "hr_leave_requests" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "hr_leave_requests_org_employee_idx" ON "hr_leave_requests" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_leave_requests_org_submitted_idx" ON "hr_leave_requests" USING btree ("organization_id","submitted_at");