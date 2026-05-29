CREATE TYPE "public"."hr_overtime_request_status" AS ENUM('pending', 'approved', 'rejected', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."hr_overtime_type" AS ENUM('regular', 'weekend', 'holiday', 'public_holiday');--> statement-breakpoint
CREATE TABLE "hr_overtime_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"overtime_type" "hr_overtime_type" NOT NULL,
	"status" "hr_overtime_request_status" DEFAULT 'pending' NOT NULL,
	"work_date" timestamp with time zone NOT NULL,
	"hours" numeric(6, 2) NOT NULL,
	"reason" text,
	"decision_note" text,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"decided_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hr_overtime_requests" ADD CONSTRAINT "hr_overtime_requests_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_overtime_requests" ADD CONSTRAINT "hr_overtime_requests_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "hr_overtime_requests_org_status_idx" ON "hr_overtime_requests" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "hr_overtime_requests_org_employee_idx" ON "hr_overtime_requests" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_overtime_requests_org_submitted_idx" ON "hr_overtime_requests" USING btree ("organization_id","submitted_at");