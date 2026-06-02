CREATE TYPE "public"."erp_document_classification" AS ENUM('public', 'internal', 'confidential', 'restricted', 'highly-restricted', 'regulated');--> statement-breakpoint
CREATE TYPE "public"."erp_document_scan_status" AS ENUM('pending', 'scanning', 'passed', 'failed', 'quarantined');--> statement-breakpoint
ALTER TABLE "erp_documents" ADD COLUMN "classification" "erp_document_classification" DEFAULT 'internal' NOT NULL;--> statement-breakpoint
ALTER TABLE "erp_documents" ADD COLUMN "scan_status" "erp_document_scan_status" DEFAULT 'passed' NOT NULL;--> statement-breakpoint
CREATE INDEX "erp_documents_org_scan_status_idx" ON "erp_documents" USING btree ("organization_id","scan_status");