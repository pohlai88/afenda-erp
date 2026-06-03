ALTER TABLE "audit_logs" ADD COLUMN "subject_type" text;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "subject_id" text;--> statement-breakpoint
CREATE INDEX "audit_logs_org_subject_idx" ON "audit_logs" USING btree ("organization_id","subject_type","subject_id");