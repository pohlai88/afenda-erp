CREATE TYPE "public"."hr_benefit_enrollment_change_kind" AS ENUM('plan_change', 'coverage_change', 'dependent_change', 'contribution_change');--> statement-breakpoint
CREATE TABLE "hr_benefit_enrollment_changes" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"enrollment_id" text NOT NULL,
	"change_kind" "hr_benefit_enrollment_change_kind" NOT NULL,
	"previous_snapshot" text,
	"new_snapshot" text NOT NULL,
	"effective_from" timestamp with time zone DEFAULT now() NOT NULL,
	"changed_by_user_id" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hr_benefit_enrollment_changes" ADD CONSTRAINT "hr_benefit_enrollment_changes_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_benefit_enrollment_changes" ADD CONSTRAINT "hr_benefit_enrollment_changes_enrollment_id_hr_benefit_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."hr_benefit_enrollments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "hr_benefit_enrollment_changes_org_enrollment_idx" ON "hr_benefit_enrollment_changes" USING btree ("organization_id","enrollment_id");--> statement-breakpoint
CREATE INDEX "hr_benefit_enrollment_changes_org_kind_idx" ON "hr_benefit_enrollment_changes" USING btree ("organization_id","change_kind");