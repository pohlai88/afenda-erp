CREATE TABLE "ai_feature_entitlements" (
	"organization_id" text NOT NULL,
	"feature" "ai_feature" NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"updated_by_auth_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ai_feature_entitlements_pk" PRIMARY KEY("organization_id","feature")
);
--> statement-breakpoint
ALTER TABLE "ai_feature_entitlements" ADD CONSTRAINT "ai_feature_entitlements_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_feature_entitlements_org_enabled_idx" ON "ai_feature_entitlements" USING btree ("organization_id","enabled");