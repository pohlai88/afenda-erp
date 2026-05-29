CREATE TYPE "public"."hr_lifecycle_transition_status" AS ENUM('pending', 'applied', 'cancelled', 'rejected', 'failed');--> statement-breakpoint
ALTER TYPE "public"."hr_employment_status" ADD VALUE 'onboarding' BEFORE 'active';--> statement-breakpoint
ALTER TYPE "public"."hr_employment_status" ADD VALUE 'probation' BEFORE 'suspended';--> statement-breakpoint
ALTER TYPE "public"."hr_employment_status" ADD VALUE 'confirmed' BEFORE 'suspended';--> statement-breakpoint
ALTER TYPE "public"."hr_employment_status" ADD VALUE 'notice_period' BEFORE 'terminated';--> statement-breakpoint
ALTER TYPE "public"."hr_employment_status" ADD VALUE 'offboarding' BEFORE 'terminated';--> statement-breakpoint
ALTER TYPE "public"."hr_employment_status" ADD VALUE 'separated' BEFORE 'archived';--> statement-breakpoint
ALTER TYPE "public"."hr_employment_status" ADD VALUE 'retired' BEFORE 'archived';--> statement-breakpoint
CREATE TABLE "hr_lifecycle_events" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"kind" text NOT NULL,
	"previous_status" "hr_employment_status",
	"new_status" "hr_employment_status",
	"effective_date" timestamp with time zone NOT NULL,
	"reason" text,
	"approval_reference" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_lifecycle_transitions" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"transition_kind" text NOT NULL,
	"from_status" "hr_employment_status" NOT NULL,
	"to_status" "hr_employment_status" NOT NULL,
	"effective_date" timestamp with time zone NOT NULL,
	"status" "hr_lifecycle_transition_status" DEFAULT 'pending' NOT NULL,
	"reason" text,
	"approval_reference" text,
	"lifecycle_event_id" text,
	"applied_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hr_employees" ADD COLUMN "employment_start_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "hr_employees" ADD COLUMN "probation_end_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "hr_employees" ADD COLUMN "confirmation_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "hr_lifecycle_events" ADD CONSTRAINT "hr_lifecycle_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_lifecycle_events" ADD CONSTRAINT "hr_lifecycle_events_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_lifecycle_transitions" ADD CONSTRAINT "hr_lifecycle_transitions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_lifecycle_transitions" ADD CONSTRAINT "hr_lifecycle_transitions_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_lifecycle_transitions" ADD CONSTRAINT "hr_lifecycle_transitions_lifecycle_event_id_hr_lifecycle_events_id_fk" FOREIGN KEY ("lifecycle_event_id") REFERENCES "public"."hr_lifecycle_events"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "hr_lifecycle_events_org_employee_idx" ON "hr_lifecycle_events" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_lifecycle_events_org_employee_kind_idx" ON "hr_lifecycle_events" USING btree ("organization_id","employee_id","kind");--> statement-breakpoint
CREATE INDEX "hr_lifecycle_events_org_effective_idx" ON "hr_lifecycle_events" USING btree ("organization_id","effective_date");--> statement-breakpoint
CREATE INDEX "hr_lifecycle_transitions_org_employee_idx" ON "hr_lifecycle_transitions" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_lifecycle_transitions_org_status_effective_idx" ON "hr_lifecycle_transitions" USING btree ("organization_id","status","effective_date");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_lifecycle_transitions_pending_dedupe_uidx" ON "hr_lifecycle_transitions" USING btree ("organization_id","employee_id","transition_kind","effective_date","status");