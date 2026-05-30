CREATE TYPE "public"."hr_offboarding_approval_step_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."hr_offboarding_asset_status" AS ENUM('outstanding', 'returned', 'damaged', 'missing', 'waived', 'deducted');--> statement-breakpoint
CREATE TYPE "public"."hr_offboarding_assignee_role" AS ENUM('hr', 'manager', 'employee', 'it', 'finance', 'payroll', 'admin', 'asset_owner');--> statement-breakpoint
CREATE TYPE "public"."hr_offboarding_clearance_category" AS ENUM('general', 'handover', 'access', 'asset', 'payroll', 'leave', 'document');--> statement-breakpoint
CREATE TYPE "public"."hr_offboarding_exit_type" AS ENUM('resignation', 'termination', 'retirement', 'contract_expiry', 'redundancy', 'death', 'mutual_separation');--> statement-breakpoint
CREATE TYPE "public"."hr_offboarding_rehire_eligibility" AS ENUM('eligible', 'conditional', 'not_eligible', 'undecided');--> statement-breakpoint
CREATE TYPE "public"."hr_org_structure_audit_action" AS ENUM('created', 'updated', 'archived');--> statement-breakpoint
CREATE TYPE "public"."hr_org_structure_entity_type" AS ENUM('org_unit', 'position', 'reporting_line');--> statement-breakpoint
CREATE TYPE "public"."hr_org_unit_type" AS ENUM('legal_entity', 'business_unit', 'department', 'sub_department', 'team', 'location');--> statement-breakpoint
CREATE TYPE "public"."hr_reporting_relationship_type" AS ENUM('direct', 'dotted_line', 'matrix');--> statement-breakpoint
CREATE TABLE "hr_offboarding_approval_steps" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"case_id" text NOT NULL,
	"step_code" text NOT NULL,
	"title" text NOT NULL,
	"assignee_role" "hr_offboarding_assignee_role" NOT NULL,
	"status" "hr_offboarding_approval_step_status" DEFAULT 'pending' NOT NULL,
	"decided_at" timestamp with time zone,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_offboarding_assets" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"case_id" text NOT NULL,
	"asset_code" text NOT NULL,
	"title" text NOT NULL,
	"status" "hr_offboarding_asset_status" DEFAULT 'outstanding' NOT NULL,
	"notes" text,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_offboarding_audit_events" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"case_id" text,
	"employee_id" text,
	"action" text NOT NULL,
	"actor_user_id" text,
	"summary" text NOT NULL,
	"metadata" text,
	"occurred_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_offboarding_document_links" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"case_id" text NOT NULL,
	"document_kind" text NOT NULL,
	"employee_document_id" text,
	"external_reference" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_offboarding_settlement_blockers" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"case_id" text NOT NULL,
	"blocker_code" text NOT NULL,
	"title" text NOT NULL,
	"source" text DEFAULT 'payroll' NOT NULL,
	"resolved" boolean DEFAULT false NOT NULL,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_org_structure_audit_events" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"entity_type" "hr_org_structure_entity_type" NOT NULL,
	"entity_id" text NOT NULL,
	"action" "hr_org_structure_audit_action" NOT NULL,
	"previous_payload" text,
	"new_payload" text NOT NULL,
	"effective_from" timestamp with time zone,
	"changed_by_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_reporting_relationships" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"manager_employee_id" text NOT NULL,
	"relationship_type" "hr_reporting_relationship_type" DEFAULT 'direct' NOT NULL,
	"effective_from" timestamp with time zone NOT NULL,
	"effective_to" timestamp with time zone,
	"assignment_status" "hr_assignment_status" DEFAULT 'active' NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hr_departments" ADD COLUMN "unit_type" "hr_org_unit_type" DEFAULT 'department' NOT NULL;--> statement-breakpoint
ALTER TABLE "hr_departments" ADD COLUMN "manager_employee_id" text;--> statement-breakpoint
ALTER TABLE "hr_departments" ADD COLUMN "cost_center_code" text;--> statement-breakpoint
ALTER TABLE "hr_departments" ADD COLUMN "location_code" text;--> statement-breakpoint
ALTER TABLE "hr_departments" ADD COLUMN "legal_entity_code" text;--> statement-breakpoint
ALTER TABLE "hr_departments" ADD COLUMN "effective_from" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "hr_departments" ADD COLUMN "effective_to" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "hr_offboarding_cases" ADD COLUMN "exit_type" "hr_offboarding_exit_type" DEFAULT 'resignation' NOT NULL;--> statement-breakpoint
ALTER TABLE "hr_offboarding_cases" ADD COLUMN "effective_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "hr_offboarding_cases" ADD COLUMN "notice_start_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "hr_offboarding_cases" ADD COLUMN "notice_end_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "hr_offboarding_cases" ADD COLUMN "required_notice_days" integer;--> statement-breakpoint
ALTER TABLE "hr_offboarding_cases" ADD COLUMN "exit_interview_scheduled_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "hr_offboarding_cases" ADD COLUMN "exit_interview_feedback" text;--> statement-breakpoint
ALTER TABLE "hr_offboarding_cases" ADD COLUMN "settlement_ready_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "hr_offboarding_cases" ADD COLUMN "rehire_eligibility" "hr_offboarding_rehire_eligibility" DEFAULT 'undecided' NOT NULL;--> statement-breakpoint
ALTER TABLE "hr_offboarding_cases" ADD COLUMN "vacancy_triggered" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "hr_offboarding_cases" ADD COLUMN "sensitive_details" text;--> statement-breakpoint
ALTER TABLE "hr_offboarding_clearance_items" ADD COLUMN "assignee_role" "hr_offboarding_assignee_role" DEFAULT 'hr' NOT NULL;--> statement-breakpoint
ALTER TABLE "hr_offboarding_clearance_items" ADD COLUMN "category" "hr_offboarding_clearance_category" DEFAULT 'general' NOT NULL;--> statement-breakpoint
ALTER TABLE "hr_offboarding_clearance_items" ADD COLUMN "due_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "hr_offboarding_clearance_items" ADD COLUMN "evidence_note" text;--> statement-breakpoint
ALTER TABLE "hr_positions" ADD COLUMN "manager_employee_id" text;--> statement-breakpoint
ALTER TABLE "hr_positions" ADD COLUMN "cost_center_code" text;--> statement-breakpoint
ALTER TABLE "hr_positions" ADD COLUMN "location_code" text;--> statement-breakpoint
ALTER TABLE "hr_positions" ADD COLUMN "effective_from" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "hr_positions" ADD COLUMN "effective_to" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "hr_offboarding_approval_steps" ADD CONSTRAINT "hr_offboarding_approval_steps_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_offboarding_approval_steps" ADD CONSTRAINT "hr_offboarding_approval_steps_case_id_hr_offboarding_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."hr_offboarding_cases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_offboarding_assets" ADD CONSTRAINT "hr_offboarding_assets_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_offboarding_assets" ADD CONSTRAINT "hr_offboarding_assets_case_id_hr_offboarding_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."hr_offboarding_cases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_offboarding_audit_events" ADD CONSTRAINT "hr_offboarding_audit_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_offboarding_audit_events" ADD CONSTRAINT "hr_offboarding_audit_events_case_id_hr_offboarding_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."hr_offboarding_cases"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_offboarding_document_links" ADD CONSTRAINT "hr_offboarding_document_links_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_offboarding_document_links" ADD CONSTRAINT "hr_offboarding_document_links_case_id_hr_offboarding_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."hr_offboarding_cases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_offboarding_document_links" ADD CONSTRAINT "hr_offboarding_document_links_employee_document_id_hr_employee_documents_id_fk" FOREIGN KEY ("employee_document_id") REFERENCES "public"."hr_employee_documents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_offboarding_settlement_blockers" ADD CONSTRAINT "hr_offboarding_settlement_blockers_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_offboarding_settlement_blockers" ADD CONSTRAINT "hr_offboarding_settlement_blockers_case_id_hr_offboarding_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."hr_offboarding_cases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_org_structure_audit_events" ADD CONSTRAINT "hr_org_structure_audit_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_reporting_relationships" ADD CONSTRAINT "hr_reporting_relationships_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_reporting_relationships" ADD CONSTRAINT "hr_reporting_relationships_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_reporting_relationships" ADD CONSTRAINT "hr_reporting_relationships_manager_employee_id_hr_employees_id_fk" FOREIGN KEY ("manager_employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "hr_offboarding_approval_org_case_idx" ON "hr_offboarding_approval_steps" USING btree ("organization_id","case_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_offboarding_approval_case_code_uidx" ON "hr_offboarding_approval_steps" USING btree ("case_id","step_code");--> statement-breakpoint
CREATE INDEX "hr_offboarding_assets_org_case_idx" ON "hr_offboarding_assets" USING btree ("organization_id","case_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_offboarding_assets_case_code_uidx" ON "hr_offboarding_assets" USING btree ("case_id","asset_code");--> statement-breakpoint
CREATE INDEX "hr_offboarding_audit_events_org_occurred_idx" ON "hr_offboarding_audit_events" USING btree ("organization_id","occurred_at");--> statement-breakpoint
CREATE INDEX "hr_offboarding_audit_events_org_case_idx" ON "hr_offboarding_audit_events" USING btree ("organization_id","case_id");--> statement-breakpoint
CREATE INDEX "hr_offboarding_document_links_org_case_idx" ON "hr_offboarding_document_links" USING btree ("organization_id","case_id");--> statement-breakpoint
CREATE INDEX "hr_offboarding_settlement_blockers_org_case_idx" ON "hr_offboarding_settlement_blockers" USING btree ("organization_id","case_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_offboarding_settlement_blockers_case_code_uidx" ON "hr_offboarding_settlement_blockers" USING btree ("case_id","blocker_code");--> statement-breakpoint
CREATE INDEX "hr_org_audit_org_entity_idx" ON "hr_org_structure_audit_events" USING btree ("organization_id","entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "hr_org_audit_org_created_idx" ON "hr_org_structure_audit_events" USING btree ("organization_id","created_at");--> statement-breakpoint
CREATE INDEX "hr_reporting_rel_org_employee_idx" ON "hr_reporting_relationships" USING btree ("organization_id","employee_id","assignment_status");--> statement-breakpoint
CREATE INDEX "hr_reporting_rel_org_manager_idx" ON "hr_reporting_relationships" USING btree ("organization_id","manager_employee_id");--> statement-breakpoint
CREATE INDEX "hr_reporting_rel_org_type_idx" ON "hr_reporting_relationships" USING btree ("organization_id","relationship_type");--> statement-breakpoint
CREATE INDEX "hr_departments_org_unit_type_idx" ON "hr_departments" USING btree ("organization_id","unit_type");--> statement-breakpoint
CREATE INDEX "hr_departments_org_effective_idx" ON "hr_departments" USING btree ("organization_id","effective_from","effective_to");--> statement-breakpoint
CREATE INDEX "hr_offboarding_cases_org_exit_type_idx" ON "hr_offboarding_cases" USING btree ("organization_id","exit_type");--> statement-breakpoint
CREATE INDEX "hr_positions_org_effective_idx" ON "hr_positions" USING btree ("organization_id","effective_from","effective_to");