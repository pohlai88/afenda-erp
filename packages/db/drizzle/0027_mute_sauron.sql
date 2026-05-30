CREATE TYPE "public"."hr_compliance_evidence_record_kind" AS ENUM('filing', 'employee_requirement', 'work_auth_document', 'work_eligibility', 'exception');--> statement-breakpoint
CREATE TABLE "hr_compliance_evidence_links" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"record_kind" "hr_compliance_evidence_record_kind" NOT NULL,
	"record_id" text NOT NULL,
	"record_label" text NOT NULL,
	"employee_id" text,
	"employee_document_id" text NOT NULL,
	"submission_state" "hr_compliance_evidence_submission_state" DEFAULT 'draft' NOT NULL,
	"notes" text,
	"submitted_at" timestamp with time zone,
	"acknowledged_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hr_compliance_evidence_links" ADD CONSTRAINT "hr_compliance_evidence_links_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_compliance_evidence_links" ADD CONSTRAINT "hr_compliance_evidence_links_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_compliance_evidence_links" ADD CONSTRAINT "hr_compliance_evidence_links_employee_document_id_hr_employee_documents_id_fk" FOREIGN KEY ("employee_document_id") REFERENCES "public"."hr_employee_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "hr_compliance_evidence_links_org_record_doc_uidx" ON "hr_compliance_evidence_links" USING btree ("organization_id","record_kind","record_id","employee_document_id");--> statement-breakpoint
CREATE INDEX "hr_compliance_evidence_links_org_record_idx" ON "hr_compliance_evidence_links" USING btree ("organization_id","record_kind","record_id");--> statement-breakpoint
CREATE INDEX "hr_compliance_evidence_links_org_employee_idx" ON "hr_compliance_evidence_links" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_compliance_evidence_links_org_document_idx" ON "hr_compliance_evidence_links" USING btree ("organization_id","employee_document_id");--> statement-breakpoint
CREATE INDEX "hr_compliance_evidence_links_org_state_idx" ON "hr_compliance_evidence_links" USING btree ("organization_id","submission_state");