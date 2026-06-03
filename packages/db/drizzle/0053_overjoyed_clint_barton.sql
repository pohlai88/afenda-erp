ALTER TABLE "audit_logs" ADD COLUMN "actor_type" text;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "actor_role" text;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "outcome" text;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "target_type" text;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "target_id" text;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "target_display_name" text;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "module" text;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "surface" text;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "route" text;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "channel" text;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "reason" text;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "policy_reference" text;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "approval_id" text;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "request_id" text;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "operation_id" text;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "before_json" jsonb;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "after_json" jsonb;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "diff_json" jsonb;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "occurred_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE INDEX "audit_logs_org_occurred_idx" ON "audit_logs" USING btree ("organization_id","occurred_at");--> statement-breakpoint
CREATE INDEX "audit_logs_org_action_idx" ON "audit_logs" USING btree ("organization_id","action");--> statement-breakpoint
CREATE INDEX "audit_logs_org_target_idx" ON "audit_logs" USING btree ("organization_id","target_type","target_id");