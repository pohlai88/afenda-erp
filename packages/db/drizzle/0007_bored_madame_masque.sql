CREATE TYPE "public"."organization_billing_invoice_status" AS ENUM('draft', 'open', 'paid', 'void', 'uncollectible');--> statement-breakpoint
CREATE TYPE "public"."organization_subscription_status" AS ENUM('trial', 'active', 'past_due', 'suspended', 'cancelled');--> statement-breakpoint
CREATE TABLE "organization_billing" (
	"organization_id" text PRIMARY KEY NOT NULL,
	"stripe_customer_id" text NOT NULL,
	"stripe_subscription_id" text,
	"plan_key" text DEFAULT 'trial' NOT NULL,
	"status" "organization_subscription_status" DEFAULT 'trial' NOT NULL,
	"seats_purchased" integer DEFAULT 0 NOT NULL,
	"current_period_start" timestamp with time zone,
	"current_period_end" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_billing_invoices" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"stripe_invoice_id" text NOT NULL,
	"status" "organization_billing_invoice_status" NOT NULL,
	"amount_due_cents" integer DEFAULT 0 NOT NULL,
	"currency" text DEFAULT 'usd' NOT NULL,
	"period_start" timestamp with time zone,
	"period_end" timestamp with time zone,
	"hosted_invoice_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "organization_billing" ADD CONSTRAINT "organization_billing_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_billing_invoices" ADD CONSTRAINT "organization_billing_invoices_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "organization_billing_stripe_customer_uidx" ON "organization_billing" USING btree ("stripe_customer_id");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_billing_stripe_subscription_uidx" ON "organization_billing" USING btree ("stripe_subscription_id");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_billing_invoices_stripe_uidx" ON "organization_billing_invoices" USING btree ("stripe_invoice_id");--> statement-breakpoint
CREATE INDEX "organization_billing_invoices_org_idx" ON "organization_billing_invoices" USING btree ("organization_id");