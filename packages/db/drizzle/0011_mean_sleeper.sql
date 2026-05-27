CREATE TYPE "public"."erp_document_retention" AS ENUM('standard', 'short-term', 'legal-hold');--> statement-breakpoint
ALTER TABLE "erp_documents" ADD COLUMN "blob_etag" text;--> statement-breakpoint
ALTER TABLE "erp_documents" ADD COLUMN "retention_class" "erp_document_retention" DEFAULT 'standard' NOT NULL;
