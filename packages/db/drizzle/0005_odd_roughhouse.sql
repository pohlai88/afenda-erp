CREATE TYPE "public"."ai_approval_status" AS ENUM('proposed', 'approved', 'rejected', 'executed');--> statement-breakpoint
CREATE TYPE "public"."ai_extraction_status" AS ENUM('completed', 'needs-review', 'failed');--> statement-breakpoint
CREATE TYPE "public"."ai_feature" AS ENUM('assistant', 'document-extraction', 'approval-tool');--> statement-breakpoint
CREATE TYPE "public"."ai_request_status" AS ENUM('started', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "ai_approval_proposals" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"work_item_id" text,
	"module_id" "erp_module_id" NOT NULL,
	"requested_by_auth_user_id" text NOT NULL,
	"model" text NOT NULL,
	"status" "ai_approval_status" NOT NULL,
	"proposed_action" text NOT NULL,
	"rationale" text NOT NULL,
	"risk_level" text NOT NULL,
	"tool_input" jsonb NOT NULL,
	"tool_output" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_document_extractions" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"document_id" text,
	"module_id" "erp_module_id" NOT NULL,
	"requested_by_auth_user_id" text NOT NULL,
	"model" text NOT NULL,
	"status" "ai_extraction_status" NOT NULL,
	"confidence" integer NOT NULL,
	"extracted" jsonb NOT NULL,
	"review_notes" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_usage_events" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_auth_id" text NOT NULL,
	"module_id" "erp_module_id" NOT NULL,
	"feature" "ai_feature" NOT NULL,
	"model" text NOT NULL,
	"status" "ai_request_status" NOT NULL,
	"prompt_tokens" integer DEFAULT 0 NOT NULL,
	"completion_tokens" integer DEFAULT 0 NOT NULL,
	"total_tokens" integer DEFAULT 0 NOT NULL,
	"latency_ms" integer DEFAULT 0 NOT NULL,
	"error_message" text,
	"metadata" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_approval_proposals" ADD CONSTRAINT "ai_approval_proposals_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_approval_proposals" ADD CONSTRAINT "ai_approval_proposals_work_item_id_erp_work_items_id_fk" FOREIGN KEY ("work_item_id") REFERENCES "public"."erp_work_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_document_extractions" ADD CONSTRAINT "ai_document_extractions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_document_extractions" ADD CONSTRAINT "ai_document_extractions_document_id_erp_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."erp_documents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_usage_events" ADD CONSTRAINT "ai_usage_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_approval_proposals_org_status_idx" ON "ai_approval_proposals" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "ai_approval_proposals_work_item_idx" ON "ai_approval_proposals" USING btree ("work_item_id");--> statement-breakpoint
CREATE INDEX "ai_document_extractions_org_module_idx" ON "ai_document_extractions" USING btree ("organization_id","module_id");--> statement-breakpoint
CREATE INDEX "ai_document_extractions_document_idx" ON "ai_document_extractions" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "ai_usage_events_org_feature_created_idx" ON "ai_usage_events" USING btree ("organization_id","feature","created_at");--> statement-breakpoint
CREATE INDEX "ai_usage_events_org_module_idx" ON "ai_usage_events" USING btree ("organization_id","module_id");