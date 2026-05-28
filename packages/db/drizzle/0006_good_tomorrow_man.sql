CREATE TYPE "public"."system_admin_availability" AS ENUM('enabled', 'disabled', 'preview');--> statement-breakpoint
CREATE TABLE "tenant_capability_settings" (
	"organization_id" text NOT NULL,
	"capability_key" text NOT NULL,
	"availability" "system_admin_availability" DEFAULT 'enabled' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tenant_capability_settings_pk" PRIMARY KEY("organization_id","capability_key")
);
--> statement-breakpoint
ALTER TABLE "tenant_capability_settings" ADD CONSTRAINT "tenant_capability_settings_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tenant_capability_settings_org_idx" ON "tenant_capability_settings" USING btree ("organization_id");