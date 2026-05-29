CREATE TABLE "hr_compliance_filings" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"obligation_id" text NOT NULL,
	"status" "hr_compliance_filing_status" DEFAULT 'pending' NOT NULL,
	"filing_deadline" timestamp with time zone,
	"submitted_at" timestamp with time zone,
	"confirmed_at" timestamp with time zone,
	"review_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hr_compliance_filings" ADD CONSTRAINT "hr_compliance_filings_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_compliance_filings" ADD CONSTRAINT "hr_compliance_filings_obligation_id_hr_compliance_obligations_id_fk" FOREIGN KEY ("obligation_id") REFERENCES "public"."hr_compliance_obligations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "hr_compliance_filings_org_obl_uidx" ON "hr_compliance_filings" USING btree ("organization_id","obligation_id");--> statement-breakpoint
CREATE INDEX "hr_compliance_filings_org_status_idx" ON "hr_compliance_filings" USING btree ("organization_id","status");