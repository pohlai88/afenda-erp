CREATE EXTENSION IF NOT EXISTS vector;--> statement-breakpoint
CREATE TYPE "public"."ai_approval_status" AS ENUM('proposed', 'approved', 'rejected', 'executed');--> statement-breakpoint
CREATE TYPE "public"."ai_extraction_status" AS ENUM('completed', 'needs-review', 'failed');--> statement-breakpoint
CREATE TYPE "public"."ai_feature" AS ENUM('assistant', 'document-extraction', 'approval-tool', 'solution-provider', 'lynx-truth', 'lynx-operator');--> statement-breakpoint
CREATE TYPE "public"."ai_request_status" AS ENUM('started', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."ai_sandbox_status" AS ENUM('pending', 'approved', 'rejected', 'discarded');--> statement-breakpoint
CREATE TYPE "public"."audit_entity_type" AS ENUM('organization', 'membership', 'user-profile', 'erp-record', 'workflow-item', 'saved-view', 'document', 'system');--> statement-breakpoint
CREATE TYPE "public"."erp_document_access" AS ENUM('private', 'public');--> statement-breakpoint
CREATE TYPE "public"."erp_document_retention" AS ENUM('standard', 'short-term', 'legal-hold');--> statement-breakpoint
CREATE TYPE "public"."erp_module_id" AS ENUM('dashboard', 'finance', 'sales', 'purchasing', 'inventory', 'hr', 'crm', 'approvals', 'reports', 'system-admin');--> statement-breakpoint
CREATE TYPE "public"."erp_priority" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."erp_record_status" AS ENUM('draft', 'active', 'blocked', 'ready', 'closed');--> statement-breakpoint
CREATE TYPE "public"."erp_view_visibility" AS ENUM('private', 'team', 'tenant');--> statement-breakpoint
CREATE TYPE "public"."erp_work_item_status" AS ENUM('pending', 'in-review', 'escalated', 'scheduled', 'completed');--> statement-breakpoint
CREATE TYPE "public"."lynx_run_feedback_category" AS ENUM('accurate', 'unsupported', 'wrong-tool', 'slow', 'unsafe', 'other');--> statement-breakpoint
CREATE TYPE "public"."lynx_run_feedback_rating" AS ENUM('positive', 'negative');--> statement-breakpoint
CREATE TYPE "public"."lynx_workflow_session_status" AS ENUM('active', 'paused', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."organization_role" AS ENUM('owner', 'admin', 'finance-manager', 'operations-manager', 'staff', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."knowledge_source_kind" AS ENUM('manual', 'github_repo');--> statement-breakpoint
CREATE TYPE "public"."api_credential_status" AS ENUM('active', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."organization_invitation_status" AS ENUM('pending', 'accepted', 'revoked', 'expired');--> statement-breakpoint
CREATE TYPE "public"."webhook_delivery_status" AS ENUM('pending', 'delivered', 'failed');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"actor_auth_user_id" text NOT NULL,
	"entity_type" "audit_entity_type" NOT NULL,
	"entity_id" text NOT NULL,
	"action" text NOT NULL,
	"summary" text NOT NULL,
	"metadata" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
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
CREATE TABLE "lynx_outcome_monitor_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"monitor_id" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"thresholds" jsonb NOT NULL,
	"owner_auth_user_id" text,
	"severity_policy" jsonb NOT NULL,
	"updated_by_auth_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lynx_run_events" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"run_id" text NOT NULL,
	"event_type" text NOT NULL,
	"tool_name" text,
	"summary" text NOT NULL,
	"input_summary" jsonb DEFAULT 'null'::jsonb,
	"output_summary" jsonb DEFAULT 'null'::jsonb,
	"evidence_references" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"validation_metrics" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"approval_proposal_id" text,
	"sandbox_id" text,
	"metadata" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lynx_run_feedback" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"run_id" text NOT NULL,
	"user_auth_id" text NOT NULL,
	"rating" "lynx_run_feedback_rating" NOT NULL,
	"category" "lynx_run_feedback_category" NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"metadata" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lynx_runs" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_auth_id" text NOT NULL,
	"route" text NOT NULL,
	"workflow_id" text,
	"workflow_session_id" text,
	"model" text NOT NULL,
	"status" "ai_request_status" DEFAULT 'started' NOT NULL,
	"prompt_summary" text NOT NULL,
	"latency_ms" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lynx_workflow_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_auth_id" text NOT NULL,
	"workflow_id" text NOT NULL,
	"status" "lynx_workflow_session_status" DEFAULT 'active' NOT NULL,
	"current_stage" text NOT NULL,
	"prompt_summary" text NOT NULL,
	"latest_run_id" text,
	"evidence_summary" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"quality_gate_summary" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"next_recommended_step" text DEFAULT '' NOT NULL,
	"metadata" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
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
	"blob_etag" text,
	"retention_class" "erp_document_retention" DEFAULT 'standard' NOT NULL,
	"uploaded_by_auth_user_id" text NOT NULL,
	"metadata" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "erp_module_records" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"module_id" "erp_module_id" NOT NULL,
	"record_type" text NOT NULL,
	"reference" text NOT NULL,
	"title" text NOT NULL,
	"status" "erp_record_status" NOT NULL,
	"owner" text NOT NULL,
	"amount_cents" integer,
	"currency" text DEFAULT 'MYR' NOT NULL,
	"due_at" timestamp with time zone,
	"created_by_auth_user_id" text NOT NULL,
	"updated_by_auth_user_id" text NOT NULL,
	"metadata" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "erp_saved_views" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"module_id" "erp_module_id" NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"visibility" "erp_view_visibility" NOT NULL,
	"filter" jsonb NOT NULL,
	"created_by_auth_user_id" text NOT NULL,
	"updated_by_auth_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "erp_work_items" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"module_id" "erp_module_id" NOT NULL,
	"subject" text NOT NULL,
	"owner" text NOT NULL,
	"status" "erp_work_item_status" NOT NULL,
	"priority" "erp_priority" NOT NULL,
	"due_at" timestamp with time zone NOT NULL,
	"source_record_id" text,
	"created_by_auth_user_id" text NOT NULL,
	"updated_by_auth_user_id" text NOT NULL,
	"metadata" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"auth_user_id" text NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"default_organization_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_chunks" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"document_id" text NOT NULL,
	"chunk_index" integer NOT NULL,
	"token_count" integer DEFAULT 0 NOT NULL,
	"embedding_model_version" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"embedding" vector(1536) NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_documents" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"source_id" text NOT NULL,
	"external_id" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"input_digest" text NOT NULL,
	"token_count" integer DEFAULT 0 NOT NULL,
	"embedding_model_version" text NOT NULL,
	"last_embedded_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_org_credentials" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"source_id" text,
	"provider" text NOT NULL,
	"secret_ref" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_org_settings" (
	"organization_id" text PRIMARY KEY NOT NULL,
	"retrieval_hybrid_enabled" boolean DEFAULT true NOT NULL,
	"retrieval_rerank_enabled" boolean DEFAULT false NOT NULL,
	"enforce_zdr" boolean DEFAULT false NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_sources" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"kind" "knowledge_source_kind" NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"config" jsonb NOT NULL,
	"last_synced_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lynx_eval_case_results" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"eval_run_id" text NOT NULL,
	"eval_set_row_id" text NOT NULL,
	"eval_case_row_id" text NOT NULL,
	"case_id" text NOT NULL,
	"query" text NOT NULL,
	"observed_answer" text DEFAULT '' NOT NULL,
	"retrieved_evidence_ids" jsonb NOT NULL,
	"metrics" jsonb NOT NULL,
	"failure_reasons" jsonb NOT NULL,
	"semantic_grade" jsonb,
	"representative_failure" boolean DEFAULT false NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lynx_eval_cases" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"eval_set_row_id" text NOT NULL,
	"case_id" text NOT NULL,
	"query" text NOT NULL,
	"expected_evidence_ids" jsonb NOT NULL,
	"expected_behavior" text NOT NULL,
	"should_answer" boolean DEFAULT true NOT NULL,
	"contains_prompt_injection" boolean DEFAULT false NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lynx_eval_runs" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"eval_set_id" text NOT NULL,
	"case_count" integer NOT NULL,
	"recall_at_k" text NOT NULL,
	"mrr" text NOT NULL,
	"evidence_overlap" text NOT NULL,
	"quality_metrics" jsonb NOT NULL,
	"failure_samples" jsonb NOT NULL,
	"ran_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lynx_eval_sets" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"eval_set_id" text NOT NULL,
	"version" integer NOT NULL,
	"workflow_id" text NOT NULL,
	"module_id" text NOT NULL,
	"status" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_memberships" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"auth_user_id" text NOT NULL,
	"role" "organization_role" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"owner_auth_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"key" text PRIMARY KEY NOT NULL,
	"module" text NOT NULL,
	"label" text NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role" "organization_role" NOT NULL,
	"permission_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "role_permissions_pk" PRIMARY KEY("role","permission_key")
);
--> statement-breakpoint
CREATE TABLE "api_credentials" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"label" text NOT NULL,
	"key_prefix" text NOT NULL,
	"key_hash" text NOT NULL,
	"scopes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" "api_credential_status" DEFAULT 'active' NOT NULL,
	"expires_at" timestamp with time zone,
	"last_used_at" timestamp with time zone,
	"created_by_auth_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_invitations" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"email" text NOT NULL,
	"role" "organization_role" NOT NULL,
	"token_hash" text NOT NULL,
	"status" "organization_invitation_status" DEFAULT 'pending' NOT NULL,
	"invited_by_auth_user_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "retention_policies" (
	"organization_id" text NOT NULL,
	"entity_type" "audit_entity_type" NOT NULL,
	"retention_days" integer NOT NULL,
	"legal_hold" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "retention_policies_pk" PRIMARY KEY("organization_id","entity_type")
);
--> statement-breakpoint
CREATE TABLE "sso_connections" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"provider" text NOT NULL,
	"idp_metadata_url" text,
	"audience" text,
	"enabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenant_role_overrides" (
	"organization_id" text NOT NULL,
	"role" "organization_role" NOT NULL,
	"permission_key" text NOT NULL,
	"enabled" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tenant_role_overrides_pk" PRIMARY KEY("organization_id","role","permission_key")
);
--> statement-breakpoint
CREATE TABLE "tenant_settings" (
	"organization_id" text PRIMARY KEY NOT NULL,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"locale" text DEFAULT 'en-US' NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"fiscal_year_start_month" integer DEFAULT 1 NOT NULL,
	"branding" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"zdr_enabled" boolean DEFAULT false NOT NULL,
	"data_region" text DEFAULT 'auto' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhook_deliveries" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"webhook_id" text NOT NULL,
	"event_type" text NOT NULL,
	"status" "webhook_delivery_status" DEFAULT 'pending' NOT NULL,
	"response_code" integer,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhooks" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"label" text NOT NULL,
	"url" text NOT NULL,
	"signing_secret_hash" text NOT NULL,
	"event_filters" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_by_auth_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_action_sandboxes" ADD CONSTRAINT "ai_action_sandboxes_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_action_sandboxes" ADD CONSTRAINT "ai_action_sandboxes_approval_proposal_id_ai_approval_proposals_id_fk" FOREIGN KEY ("approval_proposal_id") REFERENCES "public"."ai_approval_proposals"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_approval_proposals" ADD CONSTRAINT "ai_approval_proposals_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_approval_proposals" ADD CONSTRAINT "ai_approval_proposals_work_item_id_erp_work_items_id_fk" FOREIGN KEY ("work_item_id") REFERENCES "public"."erp_work_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_document_extractions" ADD CONSTRAINT "ai_document_extractions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_document_extractions" ADD CONSTRAINT "ai_document_extractions_document_id_erp_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."erp_documents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_usage_events" ADD CONSTRAINT "ai_usage_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lynx_outcome_monitor_settings" ADD CONSTRAINT "lynx_outcome_monitor_settings_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lynx_run_events" ADD CONSTRAINT "lynx_run_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lynx_run_events" ADD CONSTRAINT "lynx_run_events_run_id_lynx_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."lynx_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lynx_run_events" ADD CONSTRAINT "lynx_run_events_approval_proposal_id_ai_approval_proposals_id_fk" FOREIGN KEY ("approval_proposal_id") REFERENCES "public"."ai_approval_proposals"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lynx_run_events" ADD CONSTRAINT "lynx_run_events_sandbox_id_ai_action_sandboxes_id_fk" FOREIGN KEY ("sandbox_id") REFERENCES "public"."ai_action_sandboxes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lynx_run_feedback" ADD CONSTRAINT "lynx_run_feedback_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lynx_run_feedback" ADD CONSTRAINT "lynx_run_feedback_run_id_lynx_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."lynx_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lynx_runs" ADD CONSTRAINT "lynx_runs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lynx_workflow_sessions" ADD CONSTRAINT "lynx_workflow_sessions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lynx_workflow_sessions" ADD CONSTRAINT "lynx_workflow_sessions_latest_run_id_lynx_runs_id_fk" FOREIGN KEY ("latest_run_id") REFERENCES "public"."lynx_runs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "erp_documents" ADD CONSTRAINT "erp_documents_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "erp_module_records" ADD CONSTRAINT "erp_module_records_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "erp_saved_views" ADD CONSTRAINT "erp_saved_views_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "erp_work_items" ADD CONSTRAINT "erp_work_items_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "erp_work_items" ADD CONSTRAINT "erp_work_items_source_record_id_erp_module_records_id_fk" FOREIGN KEY ("source_record_id") REFERENCES "public"."erp_module_records"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_chunks" ADD CONSTRAINT "knowledge_chunks_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_chunks" ADD CONSTRAINT "knowledge_chunks_document_id_knowledge_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."knowledge_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_documents" ADD CONSTRAINT "knowledge_documents_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_documents" ADD CONSTRAINT "knowledge_documents_source_id_knowledge_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."knowledge_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_org_credentials" ADD CONSTRAINT "knowledge_org_credentials_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_org_credentials" ADD CONSTRAINT "knowledge_org_credentials_source_id_knowledge_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."knowledge_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_org_settings" ADD CONSTRAINT "knowledge_org_settings_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_sources" ADD CONSTRAINT "knowledge_sources_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lynx_eval_case_results" ADD CONSTRAINT "lynx_eval_case_results_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lynx_eval_case_results" ADD CONSTRAINT "lynx_eval_case_results_eval_run_id_lynx_eval_runs_id_fk" FOREIGN KEY ("eval_run_id") REFERENCES "public"."lynx_eval_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lynx_eval_case_results" ADD CONSTRAINT "lynx_eval_case_results_eval_set_row_id_lynx_eval_sets_id_fk" FOREIGN KEY ("eval_set_row_id") REFERENCES "public"."lynx_eval_sets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lynx_eval_case_results" ADD CONSTRAINT "lynx_eval_case_results_eval_case_row_id_lynx_eval_cases_id_fk" FOREIGN KEY ("eval_case_row_id") REFERENCES "public"."lynx_eval_cases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lynx_eval_cases" ADD CONSTRAINT "lynx_eval_cases_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lynx_eval_cases" ADD CONSTRAINT "lynx_eval_cases_eval_set_row_id_lynx_eval_sets_id_fk" FOREIGN KEY ("eval_set_row_id") REFERENCES "public"."lynx_eval_sets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lynx_eval_runs" ADD CONSTRAINT "lynx_eval_runs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lynx_eval_sets" ADD CONSTRAINT "lynx_eval_sets_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_memberships" ADD CONSTRAINT "organization_memberships_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_key_permissions_key_fk" FOREIGN KEY ("permission_key") REFERENCES "public"."permissions"("key") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_credentials" ADD CONSTRAINT "api_credentials_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_invitations" ADD CONSTRAINT "organization_invitations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "retention_policies" ADD CONSTRAINT "retention_policies_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sso_connections" ADD CONSTRAINT "sso_connections_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_role_overrides" ADD CONSTRAINT "tenant_role_overrides_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_settings" ADD CONSTRAINT "tenant_settings_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_deliveries" ADD CONSTRAINT "webhook_deliveries_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_deliveries" ADD CONSTRAINT "webhook_deliveries_webhook_id_webhooks_id_fk" FOREIGN KEY ("webhook_id") REFERENCES "public"."webhooks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhooks" ADD CONSTRAINT "webhooks_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_logs_organization_idx" ON "audit_logs" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "audit_logs_actor_idx" ON "audit_logs" USING btree ("actor_auth_user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_org_entity_idx" ON "audit_logs" USING btree ("organization_id","entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "ai_action_sandboxes_org_status_created_idx" ON "ai_action_sandboxes" USING btree ("organization_id","status","created_at");--> statement-breakpoint
CREATE INDEX "ai_action_sandboxes_org_module_idx" ON "ai_action_sandboxes" USING btree ("organization_id","module_id");--> statement-breakpoint
CREATE INDEX "ai_action_sandboxes_approval_proposal_idx" ON "ai_action_sandboxes" USING btree ("approval_proposal_id");--> statement-breakpoint
CREATE INDEX "ai_approval_proposals_org_status_idx" ON "ai_approval_proposals" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "ai_approval_proposals_work_item_idx" ON "ai_approval_proposals" USING btree ("work_item_id");--> statement-breakpoint
CREATE INDEX "ai_document_extractions_org_module_idx" ON "ai_document_extractions" USING btree ("organization_id","module_id");--> statement-breakpoint
CREATE INDEX "ai_document_extractions_document_idx" ON "ai_document_extractions" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "ai_usage_events_org_feature_created_idx" ON "ai_usage_events" USING btree ("organization_id","feature","created_at");--> statement-breakpoint
CREATE INDEX "ai_usage_events_org_module_idx" ON "ai_usage_events" USING btree ("organization_id","module_id");--> statement-breakpoint
CREATE UNIQUE INDEX "lynx_outcome_monitor_settings_org_monitor_idx" ON "lynx_outcome_monitor_settings" USING btree ("organization_id","monitor_id");--> statement-breakpoint
CREATE INDEX "lynx_outcome_monitor_settings_org_enabled_idx" ON "lynx_outcome_monitor_settings" USING btree ("organization_id","enabled");--> statement-breakpoint
CREATE INDEX "lynx_run_events_org_run_created_idx" ON "lynx_run_events" USING btree ("organization_id","run_id","created_at");--> statement-breakpoint
CREATE INDEX "lynx_run_events_org_type_idx" ON "lynx_run_events" USING btree ("organization_id","event_type");--> statement-breakpoint
CREATE INDEX "lynx_run_events_tool_idx" ON "lynx_run_events" USING btree ("tool_name");--> statement-breakpoint
CREATE INDEX "lynx_run_feedback_org_run_idx" ON "lynx_run_feedback" USING btree ("organization_id","run_id");--> statement-breakpoint
CREATE INDEX "lynx_runs_org_started_idx" ON "lynx_runs" USING btree ("organization_id","started_at");--> statement-breakpoint
CREATE INDEX "lynx_runs_org_route_idx" ON "lynx_runs" USING btree ("organization_id","route");--> statement-breakpoint
CREATE INDEX "lynx_runs_org_workflow_idx" ON "lynx_runs" USING btree ("organization_id","workflow_id");--> statement-breakpoint
CREATE INDEX "lynx_runs_org_workflow_session_idx" ON "lynx_runs" USING btree ("organization_id","workflow_session_id");--> statement-breakpoint
CREATE INDEX "lynx_runs_org_status_idx" ON "lynx_runs" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "lynx_workflow_sessions_org_status_idx" ON "lynx_workflow_sessions" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "lynx_workflow_sessions_org_workflow_idx" ON "lynx_workflow_sessions" USING btree ("organization_id","workflow_id");--> statement-breakpoint
CREATE INDEX "lynx_workflow_sessions_latest_run_idx" ON "lynx_workflow_sessions" USING btree ("latest_run_id");--> statement-breakpoint
CREATE UNIQUE INDEX "erp_documents_org_pathname_idx" ON "erp_documents" USING btree ("organization_id","pathname");--> statement-breakpoint
CREATE INDEX "erp_documents_org_module_idx" ON "erp_documents" USING btree ("organization_id","module_id");--> statement-breakpoint
CREATE INDEX "erp_documents_owner_entity_idx" ON "erp_documents" USING btree ("owner_entity_id");--> statement-breakpoint
CREATE UNIQUE INDEX "erp_module_records_org_module_ref_idx" ON "erp_module_records" USING btree ("organization_id","module_id","reference");--> statement-breakpoint
CREATE INDEX "erp_module_records_org_module_status_idx" ON "erp_module_records" USING btree ("organization_id","module_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "erp_saved_views_org_module_name_idx" ON "erp_saved_views" USING btree ("organization_id","module_id","name");--> statement-breakpoint
CREATE INDEX "erp_saved_views_org_module_idx" ON "erp_saved_views" USING btree ("organization_id","module_id");--> statement-breakpoint
CREATE UNIQUE INDEX "erp_work_items_org_module_subject_idx" ON "erp_work_items" USING btree ("organization_id","module_id","subject");--> statement-breakpoint
CREATE INDEX "erp_work_items_org_module_status_idx" ON "erp_work_items" USING btree ("organization_id","module_id","status");--> statement-breakpoint
CREATE INDEX "erp_work_items_due_idx" ON "erp_work_items" USING btree ("due_at");--> statement-breakpoint
CREATE UNIQUE INDEX "user_profiles_auth_user_id_idx" ON "user_profiles" USING btree ("auth_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_profiles_email_idx" ON "user_profiles" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "knowledge_chunks_document_index_idx" ON "knowledge_chunks" USING btree ("document_id","chunk_index");--> statement-breakpoint
CREATE INDEX "knowledge_chunks_org_created_idx" ON "knowledge_chunks" USING btree ("organization_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "knowledge_documents_org_source_external_idx" ON "knowledge_documents" USING btree ("organization_id","source_id","external_id");--> statement-breakpoint
CREATE INDEX "knowledge_documents_org_source_idx" ON "knowledge_documents" USING btree ("organization_id","source_id");--> statement-breakpoint
CREATE UNIQUE INDEX "knowledge_org_credentials_org_provider_idx" ON "knowledge_org_credentials" USING btree ("organization_id","provider");--> statement-breakpoint
CREATE UNIQUE INDEX "knowledge_sources_org_name_idx" ON "knowledge_sources" USING btree ("organization_id","name");--> statement-breakpoint
CREATE INDEX "knowledge_sources_org_enabled_idx" ON "knowledge_sources" USING btree ("organization_id","enabled");--> statement-breakpoint
CREATE INDEX "lynx_eval_case_results_org_run_idx" ON "lynx_eval_case_results" USING btree ("organization_id","eval_run_id");--> statement-breakpoint
CREATE INDEX "lynx_eval_case_results_org_failure_idx" ON "lynx_eval_case_results" USING btree ("organization_id","representative_failure","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "lynx_eval_cases_org_set_case_idx" ON "lynx_eval_cases" USING btree ("organization_id","eval_set_row_id","case_id");--> statement-breakpoint
CREATE INDEX "lynx_eval_runs_org_ran_idx" ON "lynx_eval_runs" USING btree ("organization_id","ran_at");--> statement-breakpoint
CREATE INDEX "lynx_eval_runs_org_set_idx" ON "lynx_eval_runs" USING btree ("organization_id","eval_set_id");--> statement-breakpoint
CREATE UNIQUE INDEX "lynx_eval_sets_org_set_version_idx" ON "lynx_eval_sets" USING btree ("organization_id","eval_set_id","version");--> statement-breakpoint
CREATE INDEX "lynx_eval_sets_org_workflow_idx" ON "lynx_eval_sets" USING btree ("organization_id","workflow_id");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_memberships_org_user_idx" ON "organization_memberships" USING btree ("organization_id","auth_user_id");--> statement-breakpoint
CREATE INDEX "organization_memberships_user_idx" ON "organization_memberships" USING btree ("auth_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "organizations_slug_idx" ON "organizations" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "role_permissions_permission_idx" ON "role_permissions" USING btree ("permission_key");--> statement-breakpoint
CREATE INDEX "api_credentials_org_idx" ON "api_credentials" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "api_credentials_org_prefix_idx" ON "api_credentials" USING btree ("organization_id","key_prefix");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_invitations_org_email_idx" ON "organization_invitations" USING btree ("organization_id","email");--> statement-breakpoint
CREATE INDEX "organization_invitations_org_status_idx" ON "organization_invitations" USING btree ("organization_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "sso_connections_org_provider_idx" ON "sso_connections" USING btree ("organization_id","provider");--> statement-breakpoint
CREATE INDEX "tenant_role_overrides_org_idx" ON "tenant_role_overrides" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "webhook_deliveries_org_webhook_idx" ON "webhook_deliveries" USING btree ("organization_id","webhook_id");--> statement-breakpoint
CREATE INDEX "webhooks_org_idx" ON "webhooks" USING btree ("organization_id");