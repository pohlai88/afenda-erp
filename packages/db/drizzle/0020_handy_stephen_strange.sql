CREATE TYPE "public"."hr_compliance_evidence_submission_state" AS ENUM('draft', 'submitted', 'acknowledged');--> statement-breakpoint
CREATE TYPE "public"."hr_compliance_filing_status" AS ENUM('pending', 'submitted', 'confirmed', 'overdue', 'waived');--> statement-breakpoint
ALTER TABLE "hr_compliance_obligations" ADD COLUMN "country_code" text;--> statement-breakpoint
ALTER TABLE "hr_compliance_obligations" ADD COLUMN "legal_entity_code" text;--> statement-breakpoint
ALTER TABLE "hr_compliance_obligations" ADD COLUMN "work_location_code" text;--> statement-breakpoint
ALTER TABLE "hr_compliance_obligations" ADD COLUMN "employment_type" text;--> statement-breakpoint
ALTER TABLE "hr_compliance_obligations" ADD COLUMN "worker_category" text;--> statement-breakpoint
CREATE INDEX "hr_compliance_obligations_org_scope_idx" ON "hr_compliance_obligations" USING btree ("organization_id","country_code","legal_entity_code","status");