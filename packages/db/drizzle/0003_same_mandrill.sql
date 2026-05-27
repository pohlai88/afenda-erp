CREATE TYPE "public"."erp_document_access" AS ENUM('private', 'public');--> statement-breakpoint
CREATE TABLE "erp_documents" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"module_id" "erp_module_id" NOT NULL,
	"owner_entity_id" text,
	"title" text NOT NULL,
	"blob_url" text NOT NULL,
	"pathname" text NOT NULL,
	"content_type" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"access" "erp_document_access" NOT NULL,
	"uploaded_by_auth_user_id" text NOT NULL,
	"metadata" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "erp_documents" ADD CONSTRAINT "erp_documents_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "erp_documents_org_pathname_idx" ON "erp_documents" USING btree ("organization_id","pathname");--> statement-breakpoint
CREATE INDEX "erp_documents_org_module_idx" ON "erp_documents" USING btree ("organization_id","module_id");--> statement-breakpoint
CREATE INDEX "erp_documents_owner_entity_idx" ON "erp_documents" USING btree ("owner_entity_id");