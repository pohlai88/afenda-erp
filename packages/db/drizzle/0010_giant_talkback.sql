CREATE TYPE "public"."ai_sandbox_status" AS ENUM('pending', 'approved', 'rejected', 'discarded');--> statement-breakpoint
ALTER TYPE "public"."ai_feature" ADD VALUE 'solution-provider';--> statement-breakpoint
CREATE TABLE "ai_action_sandboxes" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"module_id" text NOT NULL,
	"action_type" text NOT NULL,
	"title" text NOT NULL,
	"proposed_by" text DEFAULT 'ai' NOT NULL,
	"status" "ai_sandbox_status" DEFAULT 'pending' NOT NULL,
	"diff" jsonb NOT NULL,
	"risk_assessment" jsonb NOT NULL,
	"source_evidence" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"rollback_metadata" jsonb,
	"approval_proposal_id" text,
	"rejection_reason" text,
	"approved_at" timestamp with time zone,
	"rejected_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_action_sandboxes" ADD CONSTRAINT "ai_action_sandboxes_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_action_sandboxes" ADD CONSTRAINT "ai_action_sandboxes_approval_proposal_id_ai_approval_proposals_id_fk" FOREIGN KEY ("approval_proposal_id") REFERENCES "public"."ai_approval_proposals"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_action_sandboxes_org_status_created_idx" ON "ai_action_sandboxes" USING btree ("organization_id","status","created_at");--> statement-breakpoint
CREATE INDEX "ai_action_sandboxes_org_module_idx" ON "ai_action_sandboxes" USING btree ("organization_id","module_id");--> statement-breakpoint
CREATE INDEX "ai_action_sandboxes_approval_proposal_idx" ON "ai_action_sandboxes" USING btree ("approval_proposal_id");--> statement-breakpoint
CREATE INDEX "audit_logs_org_entity_idx" ON "audit_logs" USING btree ("organization_id","entity_type","entity_id");