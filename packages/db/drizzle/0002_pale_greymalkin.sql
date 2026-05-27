CREATE TYPE "public"."erp_module_id" AS ENUM('dashboard', 'finance', 'sales', 'purchasing', 'inventory', 'hr', 'crm', 'approvals', 'reports', 'admin');--> statement-breakpoint
CREATE TYPE "public"."erp_priority" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."erp_record_status" AS ENUM('draft', 'active', 'blocked', 'ready', 'closed');--> statement-breakpoint
CREATE TYPE "public"."erp_view_visibility" AS ENUM('private', 'team', 'tenant');--> statement-breakpoint
CREATE TYPE "public"."erp_work_item_status" AS ENUM('pending', 'in-review', 'escalated', 'scheduled', 'completed');--> statement-breakpoint
ALTER TYPE "public"."audit_entity_type" ADD VALUE 'erp-record' BEFORE 'system';--> statement-breakpoint
ALTER TYPE "public"."audit_entity_type" ADD VALUE 'workflow-item' BEFORE 'system';--> statement-breakpoint
ALTER TYPE "public"."audit_entity_type" ADD VALUE 'saved-view' BEFORE 'system';--> statement-breakpoint
CREATE TABLE "erp_module_records" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"module_id" "erp_module_id" NOT NULL,
	"record_type" text NOT NULL,
	"reference" text NOT NULL,
	"title" text NOT NULL,
	"status" "erp_record_status" NOT NULL,
	"owner" text NOT NULL,
	"amount_cents" integer,
	"currency" text DEFAULT 'MYR' NOT NULL,
	"due_at" timestamp with time zone,
	"created_by_auth_user_id" text NOT NULL,
	"updated_by_auth_user_id" text NOT NULL,
	"metadata" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "erp_saved_views" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"module_id" "erp_module_id" NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"visibility" "erp_view_visibility" NOT NULL,
	"filter" jsonb NOT NULL,
	"created_by_auth_user_id" text NOT NULL,
	"updated_by_auth_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "erp_work_items" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"module_id" "erp_module_id" NOT NULL,
	"subject" text NOT NULL,
	"owner" text NOT NULL,
	"status" "erp_work_item_status" NOT NULL,
	"priority" "erp_priority" NOT NULL,
	"due_at" timestamp with time zone NOT NULL,
	"source_record_id" text,
	"created_by_auth_user_id" text NOT NULL,
	"updated_by_auth_user_id" text NOT NULL,
	"metadata" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "erp_module_records" ADD CONSTRAINT "erp_module_records_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "erp_saved_views" ADD CONSTRAINT "erp_saved_views_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "erp_work_items" ADD CONSTRAINT "erp_work_items_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "erp_work_items" ADD CONSTRAINT "erp_work_items_source_record_id_erp_module_records_id_fk" FOREIGN KEY ("source_record_id") REFERENCES "public"."erp_module_records"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "erp_module_records_org_module_ref_idx" ON "erp_module_records" USING btree ("organization_id","module_id","reference");--> statement-breakpoint
CREATE INDEX "erp_module_records_org_module_status_idx" ON "erp_module_records" USING btree ("organization_id","module_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "erp_saved_views_org_module_name_idx" ON "erp_saved_views" USING btree ("organization_id","module_id","name");--> statement-breakpoint
CREATE INDEX "erp_saved_views_org_module_idx" ON "erp_saved_views" USING btree ("organization_id","module_id");--> statement-breakpoint
CREATE UNIQUE INDEX "erp_work_items_org_module_subject_idx" ON "erp_work_items" USING btree ("organization_id","module_id","subject");--> statement-breakpoint
CREATE INDEX "erp_work_items_org_module_status_idx" ON "erp_work_items" USING btree ("organization_id","module_id","status");--> statement-breakpoint
CREATE INDEX "erp_work_items_due_idx" ON "erp_work_items" USING btree ("due_at");