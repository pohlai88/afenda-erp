CREATE TABLE "hr_document_acknowledgments" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"employee_document_id" text,
	"policy_key" text NOT NULL,
	"policy_version" text NOT NULL,
	"acknowledgment_method" text NOT NULL,
	"acknowledged_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_document_audit_events" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"document_id" text,
	"employee_id" text,
	"action" text NOT NULL,
	"actor_user_id" text,
	"summary" text NOT NULL,
	"metadata" text,
	"occurred_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_document_groups" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"group_key" text NOT NULL,
	"label" text NOT NULL,
	"mandatory_by_default" boolean DEFAULT false NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_document_retention_policies" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"document_type" text,
	"document_group" text,
	"retention_days" integer DEFAULT 2555 NOT NULL,
	"archive_on_separation" boolean DEFAULT true NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hr_document_requirements" ADD COLUMN "document_group" text;--> statement-breakpoint
ALTER TABLE "hr_document_requirements" ADD COLUMN "mandatory" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "hr_employee_documents" ADD COLUMN "document_group" text;--> statement-breakpoint
ALTER TABLE "hr_employee_documents" ADD COLUMN "supersedes_document_id" text;--> statement-breakpoint
ALTER TABLE "hr_employee_documents" ADD COLUMN "version_number" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "hr_employee_documents" ADD COLUMN "is_latest_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "hr_document_acknowledgments" ADD CONSTRAINT "hr_document_acknowledgments_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_document_acknowledgments" ADD CONSTRAINT "hr_document_acknowledgments_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_document_acknowledgments" ADD CONSTRAINT "hr_document_acknowledgments_employee_document_id_hr_employee_documents_id_fk" FOREIGN KEY ("employee_document_id") REFERENCES "public"."hr_employee_documents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_document_audit_events" ADD CONSTRAINT "hr_document_audit_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_document_groups" ADD CONSTRAINT "hr_document_groups_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_document_retention_policies" ADD CONSTRAINT "hr_document_retention_policies_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "hr_document_acknowledgments_org_employee_idx" ON "hr_document_acknowledgments" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_document_acknowledgments_org_policy_idx" ON "hr_document_acknowledgments" USING btree ("organization_id","policy_key");--> statement-breakpoint
CREATE INDEX "hr_document_audit_events_org_occurred_idx" ON "hr_document_audit_events" USING btree ("organization_id","occurred_at");--> statement-breakpoint
CREATE INDEX "hr_document_audit_events_org_document_idx" ON "hr_document_audit_events" USING btree ("organization_id","document_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_document_groups_org_key_uidx" ON "hr_document_groups" USING btree ("organization_id","group_key");--> statement-breakpoint
CREATE INDEX "hr_document_retention_policies_org_active_idx" ON "hr_document_retention_policies" USING btree ("organization_id","active");--> statement-breakpoint
CREATE INDEX "hr_employee_documents_org_latest_active_idx" ON "hr_employee_documents" USING btree ("organization_id","is_latest_active","lifecycle_status");