CREATE TABLE "tenant_role_catalog" (
	"organization_id" text NOT NULL,
	"role" "organization_role" NOT NULL,
	"display_name" text,
	"description" text,
	"deprecated" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tenant_role_catalog_pk" PRIMARY KEY("organization_id","role")
);
--> statement-breakpoint
ALTER TABLE "tenant_role_catalog" ADD CONSTRAINT "tenant_role_catalog_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tenant_role_catalog_org_idx" ON "tenant_role_catalog" USING btree ("organization_id");