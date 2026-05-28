CREATE TYPE "public"."cron_run_status" AS ENUM('started', 'success', 'failed', 'rejected');--> statement-breakpoint
CREATE TABLE "cron_run_history" (
	"id" text PRIMARY KEY NOT NULL,
	"job_name" text NOT NULL,
	"route" text NOT NULL,
	"operation" text NOT NULL,
	"status" "cron_run_status" DEFAULT 'started' NOT NULL,
	"request_id" text,
	"started_at" timestamp with time zone NOT NULL,
	"finished_at" timestamp with time zone,
	"duration_ms" integer,
	"result" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "webhook_deliveries" ADD COLUMN "attempt_count" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "webhook_deliveries" ADD COLUMN "retry_outcome" text;--> statement-breakpoint
ALTER TABLE "webhooks" ADD COLUMN "signing_secret_ciphertext" text;--> statement-breakpoint
CREATE INDEX "cron_run_history_job_started_idx" ON "cron_run_history" USING btree ("job_name","started_at");--> statement-breakpoint
CREATE INDEX "cron_run_history_status_idx" ON "cron_run_history" USING btree ("status");