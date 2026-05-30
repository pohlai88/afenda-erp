CREATE TYPE "public"."hr_aat_absence_risk_level" AS ENUM('normal', 'watch', 'at_risk', 'high_risk', 'critical');--> statement-breakpoint
CREATE TYPE "public"."hr_aat_corrective_action_kind" AS ENUM('coaching', 'hr_review', 'attendance_improvement_plan');--> statement-breakpoint
CREATE TYPE "public"."hr_aat_notification_kind" AS ENUM('risk_threshold_exceeded', 'risk_level_escalated');--> statement-breakpoint
CREATE TYPE "public"."hr_aat_snapshot_period_kind" AS ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly');--> statement-breakpoint
CREATE TABLE "hr_aat_absence_risk_thresholds" (
	"organization_id" text PRIMARY KEY NOT NULL,
	"watch_absence_rate_percent" numeric(5, 2) DEFAULT '5' NOT NULL,
	"at_risk_absence_rate_percent" numeric(5, 2) DEFAULT '10' NOT NULL,
	"high_risk_absence_rate_percent" numeric(5, 2) DEFAULT '15' NOT NULL,
	"critical_absence_rate_percent" numeric(5, 2) DEFAULT '25' NOT NULL,
	"watch_absence_frequency" integer DEFAULT 3 NOT NULL,
	"at_risk_absence_frequency" integer DEFAULT 5 NOT NULL,
	"high_risk_absence_frequency" integer DEFAULT 7 NOT NULL,
	"critical_absence_frequency" integer DEFAULT 10 NOT NULL,
	"updated_by_auth_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_aat_analytics_snapshots" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"period_kind" "hr_aat_snapshot_period_kind" DEFAULT 'monthly' NOT NULL,
	"period_start" timestamp with time zone NOT NULL,
	"period_end" timestamp with time zone NOT NULL,
	"dimension" text NOT NULL,
	"snapshot_payload" jsonb NOT NULL,
	"generated_by_auth_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_aat_corrective_action_refs" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"insight_kind" text NOT NULL,
	"insight_ref" text,
	"action_kind" "hr_aat_corrective_action_kind" NOT NULL,
	"external_reference" text NOT NULL,
	"period_start" timestamp with time zone NOT NULL,
	"period_end" timestamp with time zone NOT NULL,
	"notes" text,
	"created_by_auth_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_aat_notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"recipient_auth_user_id" text NOT NULL,
	"recipient_role" text NOT NULL,
	"kind" "hr_aat_notification_kind" NOT NULL,
	"subject_type" text NOT NULL,
	"subject_id" text NOT NULL,
	"employee_id" text,
	"risk_level" "hr_aat_absence_risk_level" NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hr_aat_absence_risk_thresholds" ADD CONSTRAINT "hr_aat_absence_risk_thresholds_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_aat_analytics_snapshots" ADD CONSTRAINT "hr_aat_analytics_snapshots_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_aat_corrective_action_refs" ADD CONSTRAINT "hr_aat_corrective_action_refs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_aat_corrective_action_refs" ADD CONSTRAINT "hr_aat_corrective_action_refs_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_aat_notifications" ADD CONSTRAINT "hr_aat_notifications_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_aat_notifications" ADD CONSTRAINT "hr_aat_notifications_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "hr_aat_snapshots_org_period_idx" ON "hr_aat_analytics_snapshots" USING btree ("organization_id","period_start","period_end");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_aat_snapshots_org_period_dim_unique" ON "hr_aat_analytics_snapshots" USING btree ("organization_id","period_kind","period_start","period_end","dimension");--> statement-breakpoint
CREATE INDEX "hr_aat_corrective_refs_org_employee_idx" ON "hr_aat_corrective_action_refs" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_aat_corrective_refs_org_insight_idx" ON "hr_aat_corrective_action_refs" USING btree ("organization_id","insight_kind","insight_ref");--> statement-breakpoint
CREATE INDEX "hr_aat_notifications_org_recipient_idx" ON "hr_aat_notifications" USING btree ("organization_id","recipient_auth_user_id");--> statement-breakpoint
CREATE INDEX "hr_aat_notifications_org_employee_idx" ON "hr_aat_notifications" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_aat_notifications_org_subject_idx" ON "hr_aat_notifications" USING btree ("organization_id","subject_type","subject_id");