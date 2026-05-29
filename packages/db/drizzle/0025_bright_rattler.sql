ALTER TABLE "hr_compliance_exceptions" ADD COLUMN "source_reference_id" text;--> statement-breakpoint
ALTER TABLE "hr_compliance_exceptions" ADD COLUMN "gap_kind" text;--> statement-breakpoint
CREATE UNIQUE INDEX "hr_compliance_exceptions_org_source_ref_uidx" ON "hr_compliance_exceptions" USING btree ("organization_id","source_reference_id");