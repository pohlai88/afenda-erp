CREATE TYPE "public"."hr_employee_record_event_kind" AS ENUM('created', 'updated', 'archived', 'rehired', 'assignment_changed', 'status_changed', 'profile_updated', 'emergency_contact_updated');--> statement-breakpoint
CREATE TYPE "public"."hr_identity_document_type" AS ENUM('national_id', 'passport', 'work_permit', 'other');--> statement-breakpoint
CREATE TABLE "hr_employee_emergency_contacts" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"contact_name" text NOT NULL,
	"relationship" text NOT NULL,
	"phone_number" text NOT NULL,
	"is_priority" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_employee_profiles" (
	"employee_id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"identity_document_type" "hr_identity_document_type",
	"identity_number" text,
	"nationality" text,
	"date_of_birth" timestamp with time zone,
	"gender" text,
	"marital_status" text,
	"language_preference" text,
	"personal_email" text,
	"phone_number" text,
	"residential_address" text,
	"mailing_address" text,
	"profile_photo_url" text,
	"payroll_ready_at" timestamp with time zone,
	"compliance_ready_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_employee_record_events" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"kind" "hr_employee_record_event_kind" NOT NULL,
	"field_name" text,
	"previous_value" text,
	"new_value" text,
	"effective_date" timestamp with time zone NOT NULL,
	"reason" text,
	"approval_reference" text,
	"actor_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hr_employees" ADD COLUMN "grade" text;--> statement-breakpoint
ALTER TABLE "hr_employees" ADD COLUMN "level" text;--> statement-breakpoint
ALTER TABLE "hr_employees" ADD COLUMN "matrix_manager_employee_id" text;--> statement-breakpoint
ALTER TABLE "hr_employees" ADD COLUMN "hr_owner_employee_id" text;--> statement-breakpoint
ALTER TABLE "hr_employees" ADD COLUMN "contract_start_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "hr_employees" ADD COLUMN "contract_end_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "hr_employees" ADD COLUMN "rehired_from_employee_id" text;--> statement-breakpoint
ALTER TABLE "hr_employee_emergency_contacts" ADD CONSTRAINT "hr_employee_emergency_contacts_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_employee_emergency_contacts" ADD CONSTRAINT "hr_employee_emergency_contacts_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_employee_profiles" ADD CONSTRAINT "hr_employee_profiles_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_employee_profiles" ADD CONSTRAINT "hr_employee_profiles_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_employee_record_events" ADD CONSTRAINT "hr_employee_record_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_employee_record_events" ADD CONSTRAINT "hr_employee_record_events_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "hr_employee_emergency_contacts_org_employee_idx" ON "hr_employee_emergency_contacts" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_employee_profiles_org_employee_idx" ON "hr_employee_profiles" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_employee_profiles_org_identity_idx" ON "hr_employee_profiles" USING btree ("organization_id","identity_number");--> statement-breakpoint
CREATE INDEX "hr_employee_profiles_org_phone_idx" ON "hr_employee_profiles" USING btree ("organization_id","phone_number");--> statement-breakpoint
CREATE INDEX "hr_employee_record_events_org_employee_idx" ON "hr_employee_record_events" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_employee_record_events_org_effective_idx" ON "hr_employee_record_events" USING btree ("organization_id","effective_date");--> statement-breakpoint
CREATE INDEX "hr_employee_record_events_org_kind_idx" ON "hr_employee_record_events" USING btree ("organization_id","kind");--> statement-breakpoint
CREATE INDEX "hr_employees_org_rehired_from_idx" ON "hr_employees" USING btree ("organization_id","rehired_from_employee_id");