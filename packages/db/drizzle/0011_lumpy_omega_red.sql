CREATE TYPE "public"."hr_document_classification" AS ENUM('internal', 'confidential', 'restricted');--> statement-breakpoint
CREATE TYPE "public"."hr_document_lifecycle_status" AS ENUM('active', 'archived');--> statement-breakpoint
CREATE TYPE "public"."hr_document_verification_status" AS ENUM('pending', 'verified', 'rejected');--> statement-breakpoint
CREATE TABLE "hr_employee_documents" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"document_type" text NOT NULL,
	"title" text NOT NULL,
	"blob_url" text NOT NULL,
	"payload_hash" text NOT NULL,
	"mime_type" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"classification" "hr_document_classification" DEFAULT 'internal' NOT NULL,
	"verification_status" "hr_document_verification_status" DEFAULT 'pending' NOT NULL,
	"lifecycle_status" "hr_document_lifecycle_status" DEFAULT 'active' NOT NULL,
	"effective_from" timestamp with time zone NOT NULL,
	"effective_to" timestamp with time zone,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hr_employee_documents" ADD CONSTRAINT "hr_employee_documents_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_employee_documents" ADD CONSTRAINT "hr_employee_documents_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "hr_employee_documents_org_employee_type_idx" ON "hr_employee_documents" USING btree ("organization_id","employee_id","document_type");--> statement-breakpoint
CREATE INDEX "hr_employee_documents_org_lifecycle_idx" ON "hr_employee_documents" USING btree ("organization_id","lifecycle_status","verification_status");--> statement-breakpoint
CREATE INDEX "hr_employee_documents_org_effective_to_idx" ON "hr_employee_documents" USING btree ("organization_id","effective_to");