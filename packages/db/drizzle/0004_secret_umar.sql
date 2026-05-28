CREATE TYPE "public"."system_admin_readiness" AS ENUM('preview', 'active', 'blocked', 'deprecated');--> statement-breakpoint
CREATE TABLE "tenant_approval_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"approval_key" text NOT NULL,
	"label" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"approver_role" "organization_role",
	"escalation_minutes" integer,
	"configuration" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenant_module_settings" (
	"organization_id" text NOT NULL,
	"module_key" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"readiness" "system_admin_readiness" DEFAULT 'active' NOT NULL,
	"configuration" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tenant_module_settings_pk" PRIMARY KEY("organization_id","module_key")
);
--> statement-breakpoint
CREATE TABLE "tenant_policy_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"policy_key" text NOT NULL,
	"label" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"readiness" "system_admin_readiness" DEFAULT 'active' NOT NULL,
	"configuration" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenant_security_settings" (
	"organization_id" text PRIMARY KEY NOT NULL,
	"mfa_required" boolean DEFAULT false NOT NULL,
	"trusted_domains" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"sensitive_action_confirmation" boolean DEFAULT true NOT NULL,
	"session_policy" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tenant_settings" ADD COLUMN "operating_calendar" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "tenant_settings" ADD COLUMN "numbering" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "tenant_settings" ADD COLUMN "document_prefixes" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "tenant_approval_settings" ADD CONSTRAINT "tenant_approval_settings_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_module_settings" ADD CONSTRAINT "tenant_module_settings_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_policy_settings" ADD CONSTRAINT "tenant_policy_settings_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_security_settings" ADD CONSTRAINT "tenant_security_settings_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "tenant_approval_settings_org_key_idx" ON "tenant_approval_settings" USING btree ("organization_id","approval_key");--> statement-breakpoint
CREATE INDEX "tenant_approval_settings_org_idx" ON "tenant_approval_settings" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "tenant_module_settings_org_idx" ON "tenant_module_settings" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tenant_policy_settings_org_key_idx" ON "tenant_policy_settings" USING btree ("organization_id","policy_key");--> statement-breakpoint
CREATE INDEX "tenant_policy_settings_org_idx" ON "tenant_policy_settings" USING btree ("organization_id");