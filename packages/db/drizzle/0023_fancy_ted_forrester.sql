CREATE TYPE "public"."hr_compliance_work_auth_document_status" AS ENUM('missing', 'pending_verification', 'verified', 'rejected', 'waived');--> statement-breakpoint
CREATE TYPE "public"."hr_compliance_work_auth_document_type" AS ENUM('work_permit', 'visa', 'passport', 'right_to_work');--> statement-breakpoint
CREATE TABLE "hr_compliance_work_authorization_documents" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"document_type" "hr_compliance_work_auth_document_type" NOT NULL,
	"status" "hr_compliance_work_auth_document_status" DEFAULT 'missing' NOT NULL,
	"document_number" text,
	"issued_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"verified_at" timestamp with time zone,
	"review_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hr_compliance_work_authorization_documents" ADD CONSTRAINT "hr_compliance_work_authorization_documents_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_compliance_work_authorization_documents" ADD CONSTRAINT "hr_compliance_work_authorization_documents_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "hr_compliance_work_auth_docs_org_emp_type_uidx" ON "hr_compliance_work_authorization_documents" USING btree ("organization_id","employee_id","document_type");--> statement-breakpoint
CREATE INDEX "hr_compliance_work_auth_docs_org_status_idx" ON "hr_compliance_work_authorization_documents" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "hr_compliance_work_auth_docs_org_employee_idx" ON "hr_compliance_work_authorization_documents" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_compliance_work_auth_docs_org_type_idx" ON "hr_compliance_work_authorization_documents" USING btree ("organization_id","document_type");