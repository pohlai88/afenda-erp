CREATE TYPE "public"."hr_attendance_punch_status" AS ENUM('active', 'voided');--> statement-breakpoint
CREATE TYPE "public"."hr_attendance_punch_type" AS ENUM('clock_in', 'clock_out');--> statement-breakpoint
CREATE TYPE "public"."hr_attendance_source" AS ENUM('manual', 'time_clock', 'import');--> statement-breakpoint
CREATE TABLE "hr_attendance_records" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"punch_type" "hr_attendance_punch_type" NOT NULL,
	"status" "hr_attendance_punch_status" DEFAULT 'active' NOT NULL,
	"source" "hr_attendance_source" DEFAULT 'manual' NOT NULL,
	"punched_at" timestamp with time zone NOT NULL,
	"idempotency_key" text,
	"notes" text,
	"voided_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hr_attendance_records" ADD CONSTRAINT "hr_attendance_records_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_attendance_records" ADD CONSTRAINT "hr_attendance_records_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "hr_attendance_records_org_employee_punched_idx" ON "hr_attendance_records" USING btree ("organization_id","employee_id","punched_at");--> statement-breakpoint
CREATE INDEX "hr_attendance_records_org_status_idx" ON "hr_attendance_records" USING btree ("organization_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_attendance_records_org_idempotency_uidx" ON "hr_attendance_records" USING btree ("organization_id","idempotency_key");