CREATE TYPE "public"."hr_sbs_benchmark_version_status" AS ENUM('draft', 'active', 'superseded', 'archived');--> statement-breakpoint
CREATE TYPE "public"."hr_sbs_currency_rate_source" AS ENUM('manual', 'ecb', 'survey_provider', 'internal');--> statement-breakpoint
CREATE TYPE "public"."hr_sbs_mapping_status" AS ENUM('draft', 'pending_approval', 'approved', 'rejected', 'superseded');--> statement-breakpoint
CREATE TYPE "public"."hr_payroll_adjustment_kind" AS ENUM('one_time_earning', 'one_time_deduction', 'manual', 'proration', 'retro');--> statement-breakpoint
CREATE TYPE "public"."hr_payroll_adjustment_status" AS ENUM('draft', 'pending_approval', 'approved', 'rejected', 'applied', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."hr_payroll_approval_step_status" AS ENUM('pending', 'approved', 'rejected', 'returned');--> statement-breakpoint
CREATE TYPE "public"."hr_payroll_calculation_method" AS ENUM('fixed_amount', 'hourly_rate', 'daily_rate', 'percentage', 'formula');--> statement-breakpoint
CREATE TYPE "public"."hr_payroll_component_category" AS ENUM('basic_salary', 'hourly_wage', 'daily_wage', 'fixed_earning', 'allowance_fixed', 'allowance_variable', 'overtime', 'unpaid_leave', 'absence', 'lateness', 'loan', 'advance', 'penalty', 'tax_employee', 'statutory_employee', 'statutory_employer', 'employer_cost', 'recurring_earning', 'recurring_deduction', 'other');--> statement-breakpoint
CREATE TYPE "public"."hr_payroll_component_kind" AS ENUM('earning', 'deduction');--> statement-breakpoint
CREATE TYPE "public"."hr_payroll_correction_kind" AS ENUM('correction', 'reversal');--> statement-breakpoint
CREATE TYPE "public"."hr_payroll_correction_status" AS ENUM('draft', 'pending_authorization', 'authorized', 'applied', 'rejected', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."hr_payroll_cycle_status" AS ENUM('draft', 'open', 'input_collection', 'validation', 'preview', 'pending_approval', 'approved', 'locked', 'closed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."hr_payroll_employee_assignment_status" AS ENUM('active', 'inactive', 'pending');--> statement-breakpoint
CREATE TYPE "public"."hr_payroll_input_source" AS ENUM('attendance', 'leave', 'claims', 'benefits', 'commissions', 'employee_records', 'manual');--> statement-breakpoint
CREATE TYPE "public"."hr_payroll_input_status" AS ENUM('staged', 'approved', 'rejected', 'consumed');--> statement-breakpoint
CREATE TYPE "public"."hr_payroll_pay_group_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."hr_payroll_pay_schedule" AS ENUM('monthly', 'weekly', 'bi_weekly', 'semi_monthly', 'ad_hoc');--> statement-breakpoint
CREATE TYPE "public"."hr_payroll_payment_batch_status" AS ENUM('draft', 'generated', 'submitted', 'processing', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."hr_payroll_payment_status" AS ENUM('pending', 'processing', 'paid', 'failed', 'reversed');--> statement-breakpoint
CREATE TYPE "public"."hr_payroll_payslip_status" AS ENUM('draft', 'finalized', 'published', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."hr_payroll_proration_scenario" AS ENUM('new_joiner', 'resignation', 'unpaid_leave', 'mid_period_salary_change', 'other');--> statement-breakpoint
CREATE TYPE "public"."hr_payroll_run_kind" AS ENUM('preview', 'final');--> statement-breakpoint
CREATE TYPE "public"."hr_payroll_run_status" AS ENUM('draft', 'open', 'input_collection', 'validation', 'preview', 'pending_approval', 'approved', 'locked', 'closed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."hr_payroll_validation_kind" AS ENUM('missing_data', 'negative_pay', 'variance', 'statutory_readiness', 'blocking_error', 'readiness');--> statement-breakpoint
CREATE TYPE "public"."hr_payroll_validation_severity" AS ENUM('info', 'warning', 'error', 'blocking');--> statement-breakpoint
CREATE TYPE "public"."hr_career_path_framework_status" AS ENUM('draft', 'active', 'archived');--> statement-breakpoint
CREATE TYPE "public"."hr_career_path_kind" AS ENUM('vertical', 'lateral', 'specialist', 'leadership', 'functional', 'cross_functional');--> statement-breakpoint
CREATE TYPE "public"."hr_development_goal_status" AS ENUM('not_started', 'in_progress', 'completed', 'overdue', 'blocked', 'cancelled', 'deferred');--> statement-breakpoint
CREATE TYPE "public"."hr_development_goal_type" AS ENUM('skill', 'competency', 'certification', 'leadership', 'project', 'mentoring', 'coaching');--> statement-breakpoint
CREATE TYPE "public"."hr_development_learning_action_status" AS ENUM('planned', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."hr_development_mentor_coach_status" AS ENUM('active', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."hr_development_milestone_status" AS ENUM('not_started', 'in_progress', 'completed', 'overdue', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."hr_development_plan_status" AS ENUM('draft', 'active', 'on_hold', 'completed', 'cancelled', 'archived');--> statement-breakpoint
CREATE TYPE "public"."hr_development_session_kind" AS ENUM('mentor', 'coach');--> statement-breakpoint
CREATE TYPE "public"."hr_development_stretch_assignment_kind" AS ENUM('project', 'acting_role', 'cross_functional', 'leadership_exposure');--> statement-breakpoint
CREATE TYPE "public"."hr_development_stretch_assignment_status" AS ENUM('planned', 'active', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."hr_employee_readiness_level" AS ENUM('not_ready', 'developing', 'near_ready', 'ready', 'role_ready');--> statement-breakpoint
CREATE TYPE "public"."hr_employee_target_role_source" AS ENUM('employee', 'manager', 'hr');--> statement-breakpoint
CREATE TYPE "public"."hr_mcp_calendar_period_kind" AS ENUM('weekly', 'biweekly', 'semi_monthly', 'monthly', 'custom');--> statement-breakpoint
CREATE TYPE "public"."hr_mcp_export_format_kind" AS ENUM('bank_payment', 'statutory_portal', 'payroll_vendor');--> statement-breakpoint
CREATE TYPE "public"."hr_mcp_leave_payroll_impact" AS ENUM('paid', 'unpaid', 'statutory_paid', 'no_pay');--> statement-breakpoint
CREATE TYPE "public"."hr_mcp_pay_component_contribution_treatment" AS ENUM('contributable', 'non_contributable');--> statement-breakpoint
CREATE TYPE "public"."hr_mcp_pay_component_pension_treatment" AS ENUM('pensionable', 'non_pensionable');--> statement-breakpoint
CREATE TYPE "public"."hr_mcp_pay_component_tax_treatment" AS ENUM('taxable', 'non_taxable');--> statement-breakpoint
CREATE TYPE "public"."hr_mcp_proration_basis" AS ENUM('calendar_days', 'working_days', 'monthly_fraction');--> statement-breakpoint
CREATE TYPE "public"."hr_mcp_proration_scenario" AS ENUM('new_joiner', 'termination', 'unpaid_leave', 'mid_period_salary_change', 'other');--> statement-breakpoint
CREATE TYPE "public"."hr_mcp_report_generation_status" AS ENUM('pending', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."hr_mcp_report_kind" AS ENUM('statutory', 'tax', 'contribution');--> statement-breakpoint
CREATE TYPE "public"."hr_mcp_rule_version_status" AS ENUM('draft', 'published', 'superseded', 'archived');--> statement-breakpoint
CREATE TYPE "public"."hr_mcp_statutory_deadline_kind" AS ENUM('tax_filing', 'contribution_filing', 'employer_declaration', 'employee_income_statement', 'other');--> statement-breakpoint
CREATE TYPE "public"."hr_mcp_statutory_eligibility" AS ENUM('eligible', 'ineligible', 'pending');--> statement-breakpoint
CREATE TYPE "public"."hr_mcp_tax_residency" AS ENUM('resident', 'non_resident', 'dual');--> statement-breakpoint
CREATE TYPE "public"."hr_mcp_worker_category" AS ENUM('full_time', 'part_time', 'contractor', 'intern', 'temporary', 'director', 'other');--> statement-breakpoint
CREATE TYPE "public"."hr_lms_assessment_result" AS ENUM('passed', 'failed', 'in_progress');--> statement-breakpoint
CREATE TYPE "public"."hr_lms_assignment_kind" AS ENUM('mandatory', 'optional');--> statement-breakpoint
CREATE TYPE "public"."hr_lms_audit_action" AS ENUM('course_setup', 'learning_path_setup', 'assignment', 'enrollment', 'progress_update', 'assessment', 'completion', 'failure', 'certification', 'renewal', 'reminder', 'report_export');--> statement-breakpoint
CREATE TYPE "public"."hr_lms_certification_status" AS ENUM('active', 'expired', 'renewed', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."hr_lms_content_ref_kind" AS ENUM('internal', 'external', 'scorm', 'xapi', 'external_lms');--> statement-breakpoint
CREATE TYPE "public"."hr_lms_course_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."hr_lms_course_type" AS ENUM('online_course', 'video_lesson', 'reading_module', 'quiz', 'assessment', 'certification', 'compliance_training', 'blended_learning_reference');--> statement-breakpoint
CREATE TYPE "public"."hr_lms_delivery_mode" AS ENUM('self_paced', 'instructor_led', 'blended', 'external_reference');--> statement-breakpoint
CREATE TYPE "public"."hr_lms_enrollment_status" AS ENUM('pending_approval', 'enrolled', 'rejected', 'withdrawn');--> statement-breakpoint
CREATE TYPE "public"."hr_lms_path_kind" AS ENUM('role_based', 'department_based', 'onboarding', 'compliance', 'safety', 'leadership', 'certification', 'general');--> statement-breakpoint
CREATE TYPE "public"."hr_lms_progress_status" AS ENUM('not_started', 'in_progress', 'completed', 'failed', 'overdue', 'expired', 'renewed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."hr_lms_reminder_kind" AS ENUM('due_soon', 'overdue', 'incomplete', 'failed', 'certification_expiring');--> statement-breakpoint
CREATE TYPE "public"."hr_csf_assessment_status" AS ENUM('draft', 'submitted', 'validated', 'superseded');--> statement-breakpoint
CREATE TYPE "public"."hr_csf_assessment_target" AS ENUM('competency', 'skill');--> statement-breakpoint
CREATE TYPE "public"."hr_csf_assessment_type" AS ENUM('self', 'manager', 'hr_validation');--> statement-breakpoint
CREATE TYPE "public"."hr_csf_competency_category" AS ENUM('core', 'leadership', 'technical', 'behavioral', 'functional', 'safety', 'compliance');--> statement-breakpoint
CREATE TYPE "public"."hr_csf_development_action_type" AS ENUM('training', 'coaching', 'mentoring', 'certification', 'stretch_assignment', 'self_study', 'peer_learning');--> statement-breakpoint
CREATE TYPE "public"."hr_csf_development_link_type" AS ENUM('course', 'learning_path', 'certification', 'coaching', 'development_plan');--> statement-breakpoint
CREATE TYPE "public"."hr_csf_development_recommendation_status" AS ENUM('recommended', 'accepted', 'in_progress', 'completed', 'dismissed');--> statement-breakpoint
CREATE TYPE "public"."hr_csf_development_urgency" AS ENUM('deferred', 'planned', 'soon', 'immediate');--> statement-breakpoint
CREATE TYPE "public"."hr_csf_gap_kind" AS ENUM('skill', 'competency');--> statement-breakpoint
CREATE TYPE "public"."hr_csf_gap_priority" AS ENUM('low', 'medium', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."hr_csf_gap_severity" AS ENUM('none', 'low', 'moderate', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."hr_csf_gap_status" AS ENUM('open', 'closed', 'superseded');--> statement-breakpoint
CREATE TYPE "public"."hr_csf_library_status" AS ENUM('draft', 'active', 'inactive', 'archived');--> statement-breakpoint
CREATE TYPE "public"."hr_csf_profile_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."hr_csf_requirement_scope" AS ENUM('job_role', 'job_family', 'grade', 'position', 'department', 'legal_entity');--> statement-breakpoint
CREATE TYPE "public"."hr_csf_role_impact" AS ENUM('minimal', 'moderate', 'significant', 'critical');--> statement-breakpoint
CREATE TYPE "public"."hr_csf_skill_category" AS ENUM('job_family', 'department', 'function', 'role', 'capability_domain');--> statement-breakpoint
CREATE TYPE "public"."hr_csf_skill_requirement_class" AS ENUM('mandatory', 'preferred', 'critical', 'optional');--> statement-breakpoint
ALTER TYPE "public"."hr_expense_audit_action" ADD VALUE 'payment_payroll_staged';--> statement-breakpoint
ALTER TYPE "public"."hr_expense_audit_action" ADD VALUE 'payment_ap_staged';--> statement-breakpoint
ALTER TYPE "public"."hr_expense_audit_action" ADD VALUE 'payment_reference_recorded';--> statement-breakpoint
ALTER TYPE "public"."hr_expense_audit_action" ADD VALUE 'accounting_allocated';--> statement-breakpoint
ALTER TYPE "public"."hr_expense_audit_action" ADD VALUE 'report_exported';--> statement-breakpoint
ALTER TYPE "public"."hr_expense_audit_action" ADD VALUE 'notification_enqueued';--> statement-breakpoint
ALTER TYPE "public"."hr_expense_audit_action" ADD VALUE 'receipt_uploaded';--> statement-breakpoint
CREATE TABLE "hr_sbs_audit_events" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"benchmark_version_id" text,
	"mapping_id" text,
	"analysis_id" text,
	"employee_id" text,
	"actor_user_id" text NOT NULL,
	"action" text NOT NULL,
	"summary" text,
	"metadata" jsonb,
	"occurred_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_sbs_benchmark_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"benchmark_version_id" text NOT NULL,
	"industry" text NOT NULL,
	"country" text NOT NULL,
	"location" text NOT NULL,
	"job_family" text NOT NULL,
	"job_level" text NOT NULL,
	"currency_code" text DEFAULT 'USD' NOT NULL,
	"salary_minimum" numeric(14, 2),
	"salary_midpoint" numeric(14, 2),
	"salary_median" numeric(14, 2),
	"salary_maximum" numeric(14, 2),
	"salary_average" numeric(14, 2),
	"percentile_25" numeric(14, 2),
	"percentile_50" numeric(14, 2),
	"percentile_75" numeric(14, 2),
	"percentile_90" numeric(14, 2),
	"created_by_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_sbs_benchmark_mappings" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"benchmark_version_id" text NOT NULL,
	"benchmark_entry_id" text NOT NULL,
	"employee_id" text,
	"legal_entity_code" text,
	"country" text,
	"location_code" text,
	"job_family" text,
	"job_title" text,
	"grade" text,
	"employment_category" text,
	"mapping_status" "hr_sbs_mapping_status" DEFAULT 'draft' NOT NULL,
	"created_by_user_id" text NOT NULL,
	"approved_by_user_id" text,
	"approved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_sbs_benchmark_versions" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"code" text NOT NULL,
	"label" text NOT NULL,
	"provider" text NOT NULL,
	"survey_year" numeric(4, 0) NOT NULL,
	"effective_date" timestamp with time zone NOT NULL,
	"source_reference" text,
	"currency_code" text DEFAULT 'USD' NOT NULL,
	"version_status" "hr_sbs_benchmark_version_status" DEFAULT 'draft' NOT NULL,
	"created_by_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_sbs_compensation_analyses" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"benchmark_version_id" text NOT NULL,
	"label" text,
	"compensation_cycle_id" text,
	"threshold_config" jsonb,
	"snapshot" jsonb NOT NULL,
	"analyzed_employee_count" numeric(8, 0) NOT NULL,
	"flagged_below_target_count" numeric(8, 0) NOT NULL,
	"flagged_above_range_count" numeric(8, 0) NOT NULL,
	"created_by_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_sbs_cpm_recommendation_refs" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"analysis_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"compensation_recommendation_id" text,
	"benchmark_version_id" text NOT NULL,
	"market_position" text NOT NULL,
	"market_ratio" numeric(8, 4),
	"suggested_adjustment_percent" numeric(8, 4),
	"band_adjustment_indicator" text,
	"created_by_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_sbs_currency_refs" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"benchmark_version_id" text,
	"from_currency_code" text NOT NULL,
	"to_currency_code" text NOT NULL,
	"exchange_rate" numeric(18, 8) NOT NULL,
	"effective_date" timestamp with time zone NOT NULL,
	"rate_source" "hr_sbs_currency_rate_source" DEFAULT 'manual' NOT NULL,
	"created_by_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_sbs_mapping_approvals" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"mapping_id" text NOT NULL,
	"requested_by_user_id" text NOT NULL,
	"reviewed_by_user_id" text,
	"decision" text,
	"decision_note" text,
	"requested_at" timestamp with time zone NOT NULL,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_payroll_adjustments" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"cycle_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"adjustment_kind" "hr_payroll_adjustment_kind" NOT NULL,
	"adjustment_status" "hr_payroll_adjustment_status" DEFAULT 'draft' NOT NULL,
	"component_kind" "hr_payroll_component_kind" NOT NULL,
	"component_category" "hr_payroll_component_category" NOT NULL,
	"proration_scenario" "hr_payroll_proration_scenario",
	"amount" numeric(14, 2) NOT NULL,
	"currency_code" text DEFAULT 'USD' NOT NULL,
	"reason" text NOT NULL,
	"approval_reference" text,
	"retro_effective_from" timestamp with time zone,
	"retro_effective_to" timestamp with time zone,
	"applied_run_id" text,
	"created_by_user_id" text NOT NULL,
	"approved_by_user_id" text,
	"approved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_payroll_approvals" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"run_id" text NOT NULL,
	"cycle_id" text NOT NULL,
	"step_order" integer NOT NULL,
	"approver_role" text NOT NULL,
	"approver_user_id" text,
	"step_status" "hr_payroll_approval_step_status" DEFAULT 'pending' NOT NULL,
	"decided_at" timestamp with time zone,
	"decision_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_payroll_audit_events" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"cycle_id" text,
	"run_id" text,
	"employee_id" text,
	"actor_user_id" text NOT NULL,
	"action" text NOT NULL,
	"summary" text,
	"metadata" jsonb,
	"occurred_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_payroll_corrections" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"source_run_id" text NOT NULL,
	"correction_run_id" text,
	"cycle_id" text NOT NULL,
	"employee_id" text,
	"correction_kind" "hr_payroll_correction_kind" NOT NULL,
	"correction_status" "hr_payroll_correction_status" DEFAULT 'draft' NOT NULL,
	"reason" text NOT NULL,
	"amount_delta" numeric(14, 2),
	"currency_code" text DEFAULT 'USD' NOT NULL,
	"requested_by_user_id" text NOT NULL,
	"authorized_by_user_id" text,
	"authorized_at" timestamp with time zone,
	"applied_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_payroll_cycle_inputs" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"cycle_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"input_source" "hr_payroll_input_source" NOT NULL,
	"input_status" "hr_payroll_input_status" DEFAULT 'staged' NOT NULL,
	"external_ref" text,
	"component_category" "hr_payroll_component_category",
	"quantity" numeric(12, 4),
	"amount" numeric(14, 2),
	"currency_code" text DEFAULT 'USD' NOT NULL,
	"payload" jsonb,
	"approved_by_user_id" text,
	"approved_at" timestamp with time zone,
	"consumed_run_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_payroll_cycles" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"pay_group_id" text NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"cycle_status" "hr_payroll_cycle_status" DEFAULT 'draft' NOT NULL,
	"period_start_at" timestamp with time zone NOT NULL,
	"period_end_at" timestamp with time zone NOT NULL,
	"cutoff_at" timestamp with time zone NOT NULL,
	"pay_date_at" timestamp with time zone NOT NULL,
	"currency_code" text DEFAULT 'USD' NOT NULL,
	"locked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_payroll_earning_deduction_definitions" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"pay_group_id" text,
	"employee_id" text,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"component_kind" "hr_payroll_component_kind" NOT NULL,
	"component_category" "hr_payroll_component_category" NOT NULL,
	"calculation_method" "hr_payroll_calculation_method" DEFAULT 'fixed_amount' NOT NULL,
	"default_amount" numeric(14, 2),
	"default_rate" numeric(10, 4),
	"is_recurring" boolean DEFAULT true NOT NULL,
	"taxable" boolean DEFAULT true NOT NULL,
	"contributable" boolean DEFAULT true NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"effective_from" timestamp with time zone NOT NULL,
	"effective_to" timestamp with time zone,
	"currency_code" text DEFAULT 'USD' NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_payroll_employee_assignments" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"pay_group_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"assignment_status" "hr_payroll_employee_assignment_status" DEFAULT 'active' NOT NULL,
	"effective_from" timestamp with time zone NOT NULL,
	"effective_to" timestamp with time zone,
	"primary_assignment" boolean DEFAULT true NOT NULL,
	"assigned_by_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_payroll_journal_refs" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"run_id" text NOT NULL,
	"cycle_id" text NOT NULL,
	"journal_reference" text NOT NULL,
	"cost_center_code" text,
	"legal_entity_code" text,
	"total_debit" numeric(16, 2) NOT NULL,
	"total_credit" numeric(16, 2) NOT NULL,
	"currency_code" text DEFAULT 'USD' NOT NULL,
	"posted_at" timestamp with time zone,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_payroll_pay_groups" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"pay_schedule" "hr_payroll_pay_schedule" NOT NULL,
	"pay_group_status" "hr_payroll_pay_group_status" DEFAULT 'active' NOT NULL,
	"currency_code" text DEFAULT 'USD' NOT NULL,
	"legal_entity_code" text,
	"approval_rules" jsonb DEFAULT '{"steps":[]}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_payroll_payment_batches" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"run_id" text NOT NULL,
	"cycle_id" text NOT NULL,
	"batch_number" text NOT NULL,
	"batch_status" "hr_payroll_payment_batch_status" DEFAULT 'draft' NOT NULL,
	"payment_count" integer DEFAULT 0 NOT NULL,
	"total_amount" numeric(16, 2) DEFAULT '0' NOT NULL,
	"currency_code" text DEFAULT 'USD' NOT NULL,
	"bank_file_reference" text,
	"generated_at" timestamp with time zone,
	"submitted_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_by_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_payroll_payments" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"batch_id" text NOT NULL,
	"run_id" text NOT NULL,
	"cycle_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"payslip_id" text,
	"payment_status" "hr_payroll_payment_status" DEFAULT 'pending' NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"currency_code" text DEFAULT 'USD' NOT NULL,
	"bank_account_ref" text,
	"payment_reference" text,
	"paid_at" timestamp with time zone,
	"failed_at" timestamp with time zone,
	"failure_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_payroll_payslips" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"run_id" text NOT NULL,
	"cycle_id" text NOT NULL,
	"run_line_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"payslip_status" "hr_payroll_payslip_status" DEFAULT 'draft' NOT NULL,
	"payslip_number" text NOT NULL,
	"gross_pay" numeric(14, 2) NOT NULL,
	"net_pay" numeric(14, 2) NOT NULL,
	"currency_code" text DEFAULT 'USD' NOT NULL,
	"line_items" jsonb,
	"ess_accessible" boolean DEFAULT false NOT NULL,
	"ess_published_at" timestamp with time zone,
	"finalized_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_payroll_run_lines" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"run_id" text NOT NULL,
	"cycle_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"gross_pay" numeric(14, 2) NOT NULL,
	"total_deductions" numeric(14, 2) DEFAULT '0' NOT NULL,
	"total_tax" numeric(14, 2) DEFAULT '0' NOT NULL,
	"total_statutory_employee" numeric(14, 2) DEFAULT '0' NOT NULL,
	"total_statutory_employer" numeric(14, 2) DEFAULT '0' NOT NULL,
	"total_employer_cost" numeric(14, 2) DEFAULT '0' NOT NULL,
	"net_pay" numeric(14, 2) NOT NULL,
	"currency_code" text DEFAULT 'USD' NOT NULL,
	"line_snapshot" jsonb NOT NULL,
	"previous_net_pay" numeric(14, 2),
	"variance_percent" numeric(8, 4),
	"has_blocking_errors" boolean DEFAULT false NOT NULL,
	"missing_data_flags" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_payroll_runs" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"cycle_id" text NOT NULL,
	"run_kind" "hr_payroll_run_kind" DEFAULT 'preview' NOT NULL,
	"run_status" "hr_payroll_run_status" DEFAULT 'draft' NOT NULL,
	"run_number" integer DEFAULT 1 NOT NULL,
	"employee_count" integer DEFAULT 0 NOT NULL,
	"total_gross_pay" numeric(16, 2) DEFAULT '0' NOT NULL,
	"total_net_pay" numeric(16, 2) DEFAULT '0' NOT NULL,
	"total_employer_cost" numeric(16, 2) DEFAULT '0' NOT NULL,
	"currency_code" text DEFAULT 'USD' NOT NULL,
	"blocking_error_count" integer DEFAULT 0 NOT NULL,
	"validation_passed" boolean DEFAULT false NOT NULL,
	"locked_at" timestamp with time zone,
	"finalized_at" timestamp with time zone,
	"created_by_user_id" text NOT NULL,
	"approved_by_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_payroll_validations" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"run_id" text NOT NULL,
	"cycle_id" text NOT NULL,
	"employee_id" text,
	"validation_kind" "hr_payroll_validation_kind" NOT NULL,
	"severity" "hr_payroll_validation_severity" NOT NULL,
	"code" text NOT NULL,
	"message" text NOT NULL,
	"is_blocking" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hrm_career_discussion" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"plan_id" text,
	"discussion_date" timestamp with time zone NOT NULL,
	"participants" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"notes" text,
	"agreed_actions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"next_review_date" timestamp with time zone,
	"recorded_by_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hrm_career_path_framework" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"path_kind" "hr_career_path_kind" NOT NULL,
	"framework_status" "hr_career_path_framework_status" DEFAULT 'draft' NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hrm_career_path_stage" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"framework_id" text NOT NULL,
	"stage_order" integer NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"expected_duration_months" integer,
	"required_skill_refs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"required_competency_refs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hrm_development_coach_assignment" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"plan_id" text NOT NULL,
	"coach_employee_id" text NOT NULL,
	"assignment_status" "hr_development_mentor_coach_status" DEFAULT 'active' NOT NULL,
	"coaching_objective" text,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"assigned_by_user_id" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hrm_development_goal" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"plan_id" text NOT NULL,
	"goal_type" "hr_development_goal_type" NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"goal_status" "hr_development_goal_status" DEFAULT 'not_started' NOT NULL,
	"priority" "erp_priority" DEFAULT 'medium' NOT NULL,
	"target_completion_date" timestamp with time zone,
	"skill_code" text,
	"competency_code" text,
	"progress_percent" integer DEFAULT 0 NOT NULL,
	"evidence_notes" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hrm_development_learning_action" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"plan_id" text NOT NULL,
	"goal_id" text,
	"title" text NOT NULL,
	"description" text,
	"training_course_id" text,
	"external_training_ref" text,
	"learning_action_status" "hr_development_learning_action_status" DEFAULT 'planned' NOT NULL,
	"due_date" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hrm_development_mentor_assignment" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"plan_id" text NOT NULL,
	"mentor_employee_id" text NOT NULL,
	"assignment_status" "hr_development_mentor_coach_status" DEFAULT 'active' NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"assigned_by_user_id" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hrm_development_milestone" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"goal_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"target_date" timestamp with time zone NOT NULL,
	"owner_employee_id" text,
	"owner_user_id" text,
	"priority" "erp_priority" DEFAULT 'medium' NOT NULL,
	"completion_criteria" text,
	"milestone_status" "hr_development_milestone_status" DEFAULT 'not_started' NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hrm_development_plan" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"target_role_id" text,
	"code" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"plan_status" "hr_development_plan_status" DEFAULT 'draft' NOT NULL,
	"start_date" timestamp with time zone,
	"target_completion_date" timestamp with time zone,
	"manager_review_notes" text,
	"manager_reviewed_at" timestamp with time zone,
	"manager_reviewed_by_user_id" text,
	"created_by_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hrm_development_session" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"plan_id" text NOT NULL,
	"session_kind" "hr_development_session_kind" NOT NULL,
	"mentor_assignment_id" text,
	"coach_assignment_id" text,
	"session_date" timestamp with time zone NOT NULL,
	"duration_minutes" integer,
	"notes" text,
	"actions" text,
	"outcome" text,
	"logged_by_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hrm_development_stretch_assignment" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"plan_id" text NOT NULL,
	"assignment_kind" "hr_development_stretch_assignment_kind" NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"department_id" text,
	"position_id" text,
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"assignment_status" "hr_development_stretch_assignment_status" DEFAULT 'planned' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hrm_employee_career_aspiration" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"preferred_role_title" text,
	"preferred_department_id" text,
	"preferred_location_code" text,
	"mobility_preference" text,
	"career_interest_notes" text,
	"updated_by_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hrm_employee_readiness_snapshot" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"target_role_id" text,
	"readiness_level" "hr_employee_readiness_level" NOT NULL,
	"readiness_score" numeric(5, 2),
	"gap_summary" jsonb,
	"snapshot_notes" text,
	"computed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"computed_by_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hrm_employee_target_role" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"primary_target" boolean DEFAULT true NOT NULL,
	"target_role_title" text NOT NULL,
	"job_family" text,
	"grade" text,
	"position_id" text,
	"department_id" text,
	"framework_id" text,
	"stage_id" text,
	"target_role_source" "hr_employee_target_role_source" DEFAULT 'employee' NOT NULL,
	"recommended_by_user_id" text,
	"required_skill_requirements" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"required_competency_requirements" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"expected_readiness_date" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_mcp_audit_events" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"country_config_id" text,
	"legal_entity_setup_id" text,
	"rule_version_id" text,
	"employee_id" text,
	"payroll_run_ref" text,
	"actor_user_id" text NOT NULL,
	"action" text NOT NULL,
	"summary" text,
	"metadata" jsonb,
	"occurred_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_mcp_bank_export_configs" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"country_config_id" text NOT NULL,
	"legal_entity_setup_id" text,
	"format_code" text NOT NULL,
	"name" text NOT NULL,
	"format_kind" "hr_mcp_export_format_kind" DEFAULT 'bank_payment' NOT NULL,
	"config" jsonb NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_mcp_calendar_periods" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"calendar_id" text NOT NULL,
	"period_code" text NOT NULL,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"cutoff_date" date NOT NULL,
	"pay_date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_mcp_country_configs" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"country_code" text NOT NULL,
	"name" text NOT NULL,
	"default_currency_code" text DEFAULT 'USD' NOT NULL,
	"default_locale" text,
	"settings" jsonb,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_mcp_cross_country_cost_lines" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"report_period_id" text NOT NULL,
	"country_config_id" text NOT NULL,
	"legal_entity_setup_id" text,
	"pay_group_code" text,
	"currency_code" text NOT NULL,
	"employer_cost_total" numeric(16, 2) NOT NULL,
	"headcount" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_mcp_cross_country_report_periods" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"period_ref" text NOT NULL,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"reporting_currency_code" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_mcp_currency_configs" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"country_config_id" text NOT NULL,
	"legal_entity_setup_id" text,
	"payroll_currency_code" text NOT NULL,
	"reporting_currency_code" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_mcp_employee_classifications" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"country_config_id" text NOT NULL,
	"legal_entity_setup_id" text,
	"tax_residency" "hr_mcp_tax_residency" NOT NULL,
	"worker_category" "hr_mcp_worker_category" NOT NULL,
	"statutory_eligibility" "hr_mcp_statutory_eligibility" DEFAULT 'pending' NOT NULL,
	"effective_from" timestamp with time zone NOT NULL,
	"effective_to" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_mcp_employer_contribution_rules" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"country_config_id" text NOT NULL,
	"rule_version_id" text,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"contribution_type" text NOT NULL,
	"reference_code" text,
	"rule_config" jsonb NOT NULL,
	"effective_from" timestamp with time zone NOT NULL,
	"effective_to" timestamp with time zone,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_mcp_exchange_rates" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"from_currency_code" text NOT NULL,
	"to_currency_code" text NOT NULL,
	"rate" numeric(18, 8) NOT NULL,
	"rate_date" date NOT NULL,
	"source_reference" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_mcp_finalized_rule_snapshots" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"country_config_id" text NOT NULL,
	"legal_entity_setup_id" text,
	"rule_version_id" text NOT NULL,
	"payroll_run_ref" text NOT NULL,
	"period_ref" text,
	"snapshot" jsonb NOT NULL,
	"finalized_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_mcp_leave_payroll_treatments" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"country_config_id" text NOT NULL,
	"rule_version_id" text,
	"leave_type_code" text NOT NULL,
	"leave_type_name" text,
	"payroll_impact" "hr_mcp_leave_payroll_impact" NOT NULL,
	"statutory_leave" boolean DEFAULT false NOT NULL,
	"rule_config" jsonb,
	"effective_from" timestamp with time zone NOT NULL,
	"effective_to" timestamp with time zone,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_mcp_legal_entity_setups" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"country_config_id" text NOT NULL,
	"legal_entity_code" text NOT NULL,
	"name" text NOT NULL,
	"registration_number" text,
	"statutory_employer_account" text,
	"payroll_country_code" text NOT NULL,
	"pay_group_code" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_mcp_overtime_rules" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"country_config_id" text NOT NULL,
	"rule_version_id" text,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"overtime_rate_multiplier" numeric(8, 4) NOT NULL,
	"rest_day_rate_multiplier" numeric(8, 4),
	"public_holiday_rate_multiplier" numeric(8, 4),
	"max_weekly_hours" numeric(6, 2),
	"rule_config" jsonb,
	"effective_from" timestamp with time zone NOT NULL,
	"effective_to" timestamp with time zone,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_mcp_pay_component_treatments" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"country_config_id" text NOT NULL,
	"rule_version_id" text,
	"pay_component_code" text NOT NULL,
	"pay_component_name" text,
	"tax_treatment" "hr_mcp_pay_component_tax_treatment" NOT NULL,
	"contribution_treatment" "hr_mcp_pay_component_contribution_treatment" NOT NULL,
	"pension_treatment" "hr_mcp_pay_component_pension_treatment" NOT NULL,
	"rule_config" jsonb,
	"effective_from" timestamp with time zone NOT NULL,
	"effective_to" timestamp with time zone,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_mcp_payroll_calendars" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"country_config_id" text NOT NULL,
	"legal_entity_setup_id" text,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"period_kind" "hr_mcp_calendar_period_kind" NOT NULL,
	"pay_group_code" text,
	"calendar_year" integer NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_mcp_payslip_field_configs" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"country_config_id" text NOT NULL,
	"field_key" text NOT NULL,
	"label" text NOT NULL,
	"required" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"statutory_breakdown" boolean DEFAULT false NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_mcp_proration_rules" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"country_config_id" text NOT NULL,
	"rule_version_id" text,
	"scenario" "hr_mcp_proration_scenario" NOT NULL,
	"basis" "hr_mcp_proration_basis" NOT NULL,
	"rule_config" jsonb NOT NULL,
	"effective_from" timestamp with time zone NOT NULL,
	"effective_to" timestamp with time zone,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_mcp_public_holidays" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"country_config_id" text NOT NULL,
	"holiday_date" date NOT NULL,
	"name" text NOT NULL,
	"region_code" text,
	"recurring_annually" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_mcp_report_configs" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"country_config_id" text NOT NULL,
	"report_kind" "hr_mcp_report_kind" NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"template_reference" text,
	"config" jsonb NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_mcp_report_generations" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"report_config_id" text NOT NULL,
	"period_ref" text NOT NULL,
	"generation_status" "hr_mcp_report_generation_status" DEFAULT 'pending' NOT NULL,
	"output_reference" text,
	"generated_at" timestamp with time zone,
	"generated_by_user_id" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_mcp_rule_versions" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"country_config_id" text NOT NULL,
	"version_number" integer NOT NULL,
	"version_status" "hr_mcp_rule_version_status" DEFAULT 'draft' NOT NULL,
	"effective_from" timestamp with time zone NOT NULL,
	"effective_to" timestamp with time zone,
	"published_at" timestamp with time zone,
	"published_by_user_id" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_mcp_statutory_contribution_rules" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"country_config_id" text NOT NULL,
	"rule_version_id" text,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"contribution_type" text NOT NULL,
	"reference_code" text,
	"rule_config" jsonb NOT NULL,
	"effective_from" timestamp with time zone NOT NULL,
	"effective_to" timestamp with time zone,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_mcp_statutory_deadlines" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"country_config_id" text NOT NULL,
	"deadline_kind" "hr_mcp_statutory_deadline_kind" NOT NULL,
	"due_date" date NOT NULL,
	"period_ref" text,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_mcp_tax_rules" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"country_config_id" text NOT NULL,
	"rule_version_id" text,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"reference_code" text,
	"rule_config" jsonb NOT NULL,
	"effective_from" timestamp with time zone NOT NULL,
	"effective_to" timestamp with time zone,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_mcp_vendor_export_configs" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"country_config_id" text NOT NULL,
	"vendor_code" text NOT NULL,
	"format_code" text NOT NULL,
	"name" text NOT NULL,
	"format_kind" "hr_mcp_export_format_kind" NOT NULL,
	"config" jsonb NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_lms_assessment_attempts" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"enrollment_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"course_id" text NOT NULL,
	"attempt_number" integer NOT NULL,
	"score" numeric(5, 2),
	"passing_score" numeric(5, 2),
	"result" "hr_lms_assessment_result" DEFAULT 'in_progress' NOT NULL,
	"completed_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_lms_assignments" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"course_id" text,
	"path_id" text,
	"assignment_kind" "hr_lms_assignment_kind" DEFAULT 'optional' NOT NULL,
	"due_at" timestamp with time zone,
	"assigned_by_user_id" text NOT NULL,
	"is_compliance_mandatory" boolean DEFAULT false NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_lms_audit_events" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"action" "hr_lms_audit_action" NOT NULL,
	"actor_user_id" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"summary" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_lms_certifications" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"course_id" text NOT NULL,
	"enrollment_id" text,
	"certificate_code" text NOT NULL,
	"certification_status" "hr_lms_certification_status" DEFAULT 'active' NOT NULL,
	"issued_at" timestamp with time zone NOT NULL,
	"expires_at" timestamp with time zone,
	"renewed_at" timestamp with time zone,
	"evidence_uri" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_lms_course_content_refs" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"course_id" text NOT NULL,
	"ref_kind" "hr_lms_content_ref_kind" NOT NULL,
	"label" text NOT NULL,
	"uri" text NOT NULL,
	"provider_name" text,
	"is_primary" boolean DEFAULT false NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_lms_courses" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"code" text NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"description" text,
	"provider" text NOT NULL,
	"duration_minutes" integer DEFAULT 0 NOT NULL,
	"level" text DEFAULT 'beginner' NOT NULL,
	"language" text DEFAULT 'en' NOT NULL,
	"delivery_mode" "hr_lms_delivery_mode" DEFAULT 'self_paced' NOT NULL,
	"course_type" "hr_lms_course_type" DEFAULT 'online_course' NOT NULL,
	"validity_days" integer,
	"passing_score" numeric(5, 2),
	"attempt_limit" integer,
	"self_enrollment_enabled" boolean DEFAULT false NOT NULL,
	"approval_required" boolean DEFAULT false NOT NULL,
	"scorm_enabled" boolean DEFAULT false NOT NULL,
	"xapi_enabled" boolean DEFAULT false NOT NULL,
	"external_lms_enabled" boolean DEFAULT false NOT NULL,
	"training_course_id" text,
	"course_status" "hr_lms_course_status" DEFAULT 'draft' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_lms_enrollments" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"course_id" text NOT NULL,
	"assignment_id" text,
	"enrollment_status" "hr_lms_enrollment_status" DEFAULT 'enrolled' NOT NULL,
	"self_enrolled" boolean DEFAULT false NOT NULL,
	"approved_by_user_id" text,
	"enrolled_by_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_lms_learning_path_courses" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"path_id" text NOT NULL,
	"course_id" text NOT NULL,
	"sequence_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_lms_learning_paths" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"path_kind" "hr_lms_path_kind" DEFAULT 'general' NOT NULL,
	"target_role_code" text,
	"target_department_id" text,
	"path_status" "hr_lms_course_status" DEFAULT 'draft' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_lms_progress" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"enrollment_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"course_id" text NOT NULL,
	"progress_status" "hr_lms_progress_status" DEFAULT 'not_started' NOT NULL,
	"completion_percent" numeric(5, 2) DEFAULT '0' NOT NULL,
	"time_spent_minutes" integer DEFAULT 0 NOT NULL,
	"last_accessed_at" timestamp with time zone,
	"lesson_progress" jsonb DEFAULT '{}'::jsonb,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_lms_reminders" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"course_id" text,
	"certification_id" text,
	"reminder_kind" "hr_lms_reminder_kind" NOT NULL,
	"due_at" timestamp with time zone,
	"sent_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_csf_assessment_evidence" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"assessment_id" text NOT NULL,
	"evidence_summary" text NOT NULL,
	"source" text NOT NULL,
	"evidence_date" timestamp with time zone NOT NULL,
	"assessor_user_id" text NOT NULL,
	"confidence_level" integer DEFAULT 3 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_csf_assessments" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"assessment_type" "hr_csf_assessment_type" NOT NULL,
	"target_type" "hr_csf_assessment_target" NOT NULL,
	"competency_profile_id" text,
	"skill_profile_id" text,
	"competency_id" text,
	"skill_id" text,
	"proficiency_level_id" text NOT NULL,
	"assessor_user_id" text NOT NULL,
	"assessor_employee_id" text,
	"assessment_date" timestamp with time zone NOT NULL,
	"confidence_level" integer DEFAULT 3 NOT NULL,
	"assessment_status" "hr_csf_assessment_status" DEFAULT 'submitted' NOT NULL,
	"notes" text,
	"validated_by_user_id" text,
	"validated_at" timestamp with time zone,
	"supersedes_assessment_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_csf_audit_events" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"competency_id" text,
	"skill_id" text,
	"proficiency_scale_id" text,
	"requirement_id" text,
	"actor_user_id" text NOT NULL,
	"action" text NOT NULL,
	"summary" text,
	"metadata" jsonb,
	"occurred_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_csf_competencies" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"category" "hr_csf_competency_category" NOT NULL,
	"description" text,
	"library_status" "hr_csf_library_status" DEFAULT 'draft' NOT NULL,
	"proficiency_scale_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_csf_competency_requirements" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"competency_id" text NOT NULL,
	"scope" "hr_csf_requirement_scope" NOT NULL,
	"scope_ref" text NOT NULL,
	"job_role" text,
	"job_family" text,
	"grade" text,
	"position_id" text,
	"department_id" text,
	"legal_entity_code" text,
	"required_proficiency_level_id" text NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_csf_development_links" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"recommendation_id" text NOT NULL,
	"link_type" "hr_csf_development_link_type" NOT NULL,
	"external_ref" text NOT NULL,
	"title" text,
	"url" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_csf_development_recommendations" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"gap_id" text NOT NULL,
	"action_type" "hr_csf_development_action_type" NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"priority" "hr_csf_gap_priority" NOT NULL,
	"recommendation_status" "hr_csf_development_recommendation_status" DEFAULT 'recommended' NOT NULL,
	"recommended_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_csf_employee_competency_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"competency_id" text NOT NULL,
	"current_proficiency_level_id" text,
	"self_assessment_enabled" boolean DEFAULT true NOT NULL,
	"hr_validation_required" boolean DEFAULT false NOT NULL,
	"profile_status" "hr_csf_profile_status" DEFAULT 'active' NOT NULL,
	"last_assessed_at" timestamp with time zone,
	"last_assessment_id" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_csf_employee_skill_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"skill_id" text NOT NULL,
	"current_proficiency_level_id" text,
	"self_assessment_enabled" boolean DEFAULT true NOT NULL,
	"hr_validation_required" boolean DEFAULT false NOT NULL,
	"profile_status" "hr_csf_profile_status" DEFAULT 'active' NOT NULL,
	"last_assessed_at" timestamp with time zone,
	"last_assessment_id" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_csf_gap_classifications" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"gap_id" text NOT NULL,
	"severity" "hr_csf_gap_severity" NOT NULL,
	"priority" "hr_csf_gap_priority" NOT NULL,
	"role_impact" "hr_csf_role_impact" NOT NULL,
	"development_urgency" "hr_csf_development_urgency" NOT NULL,
	"rationale" text,
	"classified_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_csf_gaps" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"gap_kind" "hr_csf_gap_kind" NOT NULL,
	"skill_id" text,
	"competency_id" text,
	"requirement_id" text NOT NULL,
	"requirement_class" "hr_csf_skill_requirement_class",
	"required_proficiency_level_id" text NOT NULL,
	"current_proficiency_level_id" text,
	"required_level_order" integer NOT NULL,
	"current_level_order" integer DEFAULT 0 NOT NULL,
	"gap_size" integer DEFAULT 0 NOT NULL,
	"has_gap" boolean DEFAULT false NOT NULL,
	"gap_status" "hr_csf_gap_status" DEFAULT 'open' NOT NULL,
	"calculated_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_csf_proficiency_levels" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"scale_id" text NOT NULL,
	"level_order" integer NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"assessment_criteria" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_csf_proficiency_scales" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"scale_status" "hr_csf_library_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_csf_skill_requirements" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"skill_id" text NOT NULL,
	"scope" "hr_csf_requirement_scope" NOT NULL,
	"scope_ref" text NOT NULL,
	"job_role" text,
	"job_family" text,
	"grade" text,
	"position_id" text,
	"department_id" text,
	"legal_entity_code" text,
	"requirement_class" "hr_csf_skill_requirement_class" DEFAULT 'mandatory' NOT NULL,
	"required_proficiency_level_id" text NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_csf_skills" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"category" "hr_csf_skill_category" NOT NULL,
	"description" text,
	"library_status" "hr_csf_library_status" DEFAULT 'draft' NOT NULL,
	"proficiency_scale_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hr_expense_approval_routes" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "hr_expense_approvals" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "hr_expense_exceptions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "hr_expense_approval_routes" CASCADE;--> statement-breakpoint
DROP TABLE "hr_expense_approvals" CASCADE;--> statement-breakpoint
DROP TABLE "hr_expense_exceptions" CASCADE;--> statement-breakpoint
ALTER TABLE "hr_expense_claims" DROP CONSTRAINT "hr_expense_claims_employee_id_hr_employees_id_fk";
--> statement-breakpoint
DROP INDEX "hr_expense_claims_org_status_idx";--> statement-breakpoint
DROP INDEX "hr_expense_eligibility_rules_org_group_cat_idx";--> statement-breakpoint
DROP INDEX "hr_expense_policy_category_rules_policy_cat_uidx";--> statement-breakpoint
ALTER TABLE "hr_expense_audit_events" ALTER COLUMN "action" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "hr_expense_audit_events" ADD COLUMN "actor_user_id" text;--> statement-breakpoint
ALTER TABLE "hr_expense_audit_events" ADD COLUMN "reason" text;--> statement-breakpoint
ALTER TABLE "hr_expense_claims" ADD COLUMN "claim_number" text NOT NULL;--> statement-breakpoint
ALTER TABLE "hr_expense_claims" ADD COLUMN "claim_status" "hr_expense_claim_status" DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "hr_expense_claims" ADD COLUMN "primary_expense_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "hr_expense_claims" ADD COLUMN "merchant_name" text;--> statement-breakpoint
ALTER TABLE "hr_expense_claims" ADD COLUMN "claim_currency_code" text DEFAULT 'USD' NOT NULL;--> statement-breakpoint
ALTER TABLE "hr_expense_claims" ADD COLUMN "claim_amount" numeric(14, 2);--> statement-breakpoint
ALTER TABLE "hr_expense_claims" ADD COLUMN "approved_amount" numeric(14, 2);--> statement-breakpoint
ALTER TABLE "hr_expense_claims" ADD COLUMN "rejected_amount" numeric(14, 2);--> statement-breakpoint
ALTER TABLE "hr_expense_claims" ADD COLUMN "reimbursable_amount" numeric(14, 2);--> statement-breakpoint
ALTER TABLE "hr_expense_claims" ADD COLUMN "net_payable_amount" numeric(14, 2);--> statement-breakpoint
ALTER TABLE "hr_expense_claims" ADD COLUMN "gl_reference" text;--> statement-breakpoint
ALTER TABLE "hr_expense_claims" ADD COLUMN "approved_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "hr_expense_claims" ADD COLUMN "approved_by_user_id" text;--> statement-breakpoint
ALTER TABLE "hr_expense_claims" ADD COLUMN "period_start" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "hr_expense_claims" ADD COLUMN "period_end" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "hr_expense_claims" ADD COLUMN "line_items_snapshot" jsonb;--> statement-breakpoint
ALTER TABLE "hr_expense_policies" ADD COLUMN "name" text DEFAULT 'Default expense policy' NOT NULL;--> statement-breakpoint
ALTER TABLE "hr_expense_policies" ADD COLUMN "default_currency_code" text DEFAULT 'USD' NOT NULL;--> statement-breakpoint
ALTER TABLE "hr_expense_policies" ADD COLUMN "max_claim_amount_cents" integer;--> statement-breakpoint
ALTER TABLE "hr_expense_policies" ADD COLUMN "active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "hr_expense_eligibility_rules" ADD COLUMN "category_code" text;--> statement-breakpoint
ALTER TABLE "hr_expense_policy_category_rules" ADD COLUMN "category_code" text NOT NULL;--> statement-breakpoint
ALTER TABLE "hr_sbs_audit_events" ADD CONSTRAINT "hr_sbs_audit_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_sbs_audit_events" ADD CONSTRAINT "hr_sbs_audit_events_benchmark_version_id_hr_sbs_benchmark_versions_id_fk" FOREIGN KEY ("benchmark_version_id") REFERENCES "public"."hr_sbs_benchmark_versions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_sbs_audit_events" ADD CONSTRAINT "hr_sbs_audit_events_mapping_id_hr_sbs_benchmark_mappings_id_fk" FOREIGN KEY ("mapping_id") REFERENCES "public"."hr_sbs_benchmark_mappings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_sbs_audit_events" ADD CONSTRAINT "hr_sbs_audit_events_analysis_id_hr_sbs_compensation_analyses_id_fk" FOREIGN KEY ("analysis_id") REFERENCES "public"."hr_sbs_compensation_analyses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_sbs_audit_events" ADD CONSTRAINT "hr_sbs_audit_events_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_sbs_benchmark_entries" ADD CONSTRAINT "hr_sbs_benchmark_entries_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_sbs_benchmark_entries" ADD CONSTRAINT "hr_sbs_benchmark_entries_benchmark_version_id_hr_sbs_benchmark_versions_id_fk" FOREIGN KEY ("benchmark_version_id") REFERENCES "public"."hr_sbs_benchmark_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_sbs_benchmark_mappings" ADD CONSTRAINT "hr_sbs_benchmark_mappings_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_sbs_benchmark_mappings" ADD CONSTRAINT "hr_sbs_benchmark_mappings_benchmark_version_id_hr_sbs_benchmark_versions_id_fk" FOREIGN KEY ("benchmark_version_id") REFERENCES "public"."hr_sbs_benchmark_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_sbs_benchmark_mappings" ADD CONSTRAINT "hr_sbs_benchmark_mappings_benchmark_entry_id_hr_sbs_benchmark_entries_id_fk" FOREIGN KEY ("benchmark_entry_id") REFERENCES "public"."hr_sbs_benchmark_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_sbs_benchmark_mappings" ADD CONSTRAINT "hr_sbs_benchmark_mappings_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_sbs_benchmark_versions" ADD CONSTRAINT "hr_sbs_benchmark_versions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_sbs_compensation_analyses" ADD CONSTRAINT "hr_sbs_compensation_analyses_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_sbs_compensation_analyses" ADD CONSTRAINT "hr_sbs_compensation_analyses_benchmark_version_id_hr_sbs_benchmark_versions_id_fk" FOREIGN KEY ("benchmark_version_id") REFERENCES "public"."hr_sbs_benchmark_versions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_sbs_cpm_recommendation_refs" ADD CONSTRAINT "hr_sbs_cpm_recommendation_refs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_sbs_cpm_recommendation_refs" ADD CONSTRAINT "hr_sbs_cpm_recommendation_refs_analysis_id_hr_sbs_compensation_analyses_id_fk" FOREIGN KEY ("analysis_id") REFERENCES "public"."hr_sbs_compensation_analyses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_sbs_cpm_recommendation_refs" ADD CONSTRAINT "hr_sbs_cpm_recommendation_refs_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_sbs_cpm_recommendation_refs" ADD CONSTRAINT "hr_sbs_cpm_recommendation_refs_compensation_recommendation_id_hr_compensation_recommendations_id_fk" FOREIGN KEY ("compensation_recommendation_id") REFERENCES "public"."hr_compensation_recommendations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_sbs_cpm_recommendation_refs" ADD CONSTRAINT "hr_sbs_cpm_recommendation_refs_benchmark_version_id_hr_sbs_benchmark_versions_id_fk" FOREIGN KEY ("benchmark_version_id") REFERENCES "public"."hr_sbs_benchmark_versions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_sbs_currency_refs" ADD CONSTRAINT "hr_sbs_currency_refs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_sbs_currency_refs" ADD CONSTRAINT "hr_sbs_currency_refs_benchmark_version_id_hr_sbs_benchmark_versions_id_fk" FOREIGN KEY ("benchmark_version_id") REFERENCES "public"."hr_sbs_benchmark_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_sbs_mapping_approvals" ADD CONSTRAINT "hr_sbs_mapping_approvals_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_sbs_mapping_approvals" ADD CONSTRAINT "hr_sbs_mapping_approvals_mapping_id_hr_sbs_benchmark_mappings_id_fk" FOREIGN KEY ("mapping_id") REFERENCES "public"."hr_sbs_benchmark_mappings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_payroll_adjustments" ADD CONSTRAINT "hr_payroll_adjustments_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_payroll_adjustments" ADD CONSTRAINT "hr_payroll_adjustments_cycle_id_hr_payroll_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."hr_payroll_cycles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_payroll_adjustments" ADD CONSTRAINT "hr_payroll_adjustments_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_payroll_approvals" ADD CONSTRAINT "hr_payroll_approvals_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_payroll_approvals" ADD CONSTRAINT "hr_payroll_approvals_run_id_hr_payroll_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."hr_payroll_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_payroll_approvals" ADD CONSTRAINT "hr_payroll_approvals_cycle_id_hr_payroll_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."hr_payroll_cycles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_payroll_audit_events" ADD CONSTRAINT "hr_payroll_audit_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_payroll_audit_events" ADD CONSTRAINT "hr_payroll_audit_events_cycle_id_hr_payroll_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."hr_payroll_cycles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_payroll_audit_events" ADD CONSTRAINT "hr_payroll_audit_events_run_id_hr_payroll_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."hr_payroll_runs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_payroll_audit_events" ADD CONSTRAINT "hr_payroll_audit_events_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_payroll_corrections" ADD CONSTRAINT "hr_payroll_corrections_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_payroll_corrections" ADD CONSTRAINT "hr_payroll_corrections_source_run_id_hr_payroll_runs_id_fk" FOREIGN KEY ("source_run_id") REFERENCES "public"."hr_payroll_runs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_payroll_corrections" ADD CONSTRAINT "hr_payroll_corrections_correction_run_id_hr_payroll_runs_id_fk" FOREIGN KEY ("correction_run_id") REFERENCES "public"."hr_payroll_runs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_payroll_corrections" ADD CONSTRAINT "hr_payroll_corrections_cycle_id_hr_payroll_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."hr_payroll_cycles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_payroll_corrections" ADD CONSTRAINT "hr_payroll_corrections_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_payroll_cycle_inputs" ADD CONSTRAINT "hr_payroll_cycle_inputs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_payroll_cycle_inputs" ADD CONSTRAINT "hr_payroll_cycle_inputs_cycle_id_hr_payroll_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."hr_payroll_cycles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_payroll_cycle_inputs" ADD CONSTRAINT "hr_payroll_cycle_inputs_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_payroll_cycles" ADD CONSTRAINT "hr_payroll_cycles_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_payroll_cycles" ADD CONSTRAINT "hr_payroll_cycles_pay_group_id_hr_payroll_pay_groups_id_fk" FOREIGN KEY ("pay_group_id") REFERENCES "public"."hr_payroll_pay_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_payroll_earning_deduction_definitions" ADD CONSTRAINT "hr_payroll_earning_deduction_definitions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_payroll_earning_deduction_definitions" ADD CONSTRAINT "hr_payroll_earning_deduction_definitions_pay_group_id_hr_payroll_pay_groups_id_fk" FOREIGN KEY ("pay_group_id") REFERENCES "public"."hr_payroll_pay_groups"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_payroll_earning_deduction_definitions" ADD CONSTRAINT "hr_payroll_earning_deduction_definitions_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_payroll_employee_assignments" ADD CONSTRAINT "hr_payroll_employee_assignments_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_payroll_employee_assignments" ADD CONSTRAINT "hr_payroll_employee_assignments_pay_group_id_hr_payroll_pay_groups_id_fk" FOREIGN KEY ("pay_group_id") REFERENCES "public"."hr_payroll_pay_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_payroll_employee_assignments" ADD CONSTRAINT "hr_payroll_employee_assignments_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_payroll_journal_refs" ADD CONSTRAINT "hr_payroll_journal_refs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_payroll_journal_refs" ADD CONSTRAINT "hr_payroll_journal_refs_run_id_hr_payroll_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."hr_payroll_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_payroll_journal_refs" ADD CONSTRAINT "hr_payroll_journal_refs_cycle_id_hr_payroll_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."hr_payroll_cycles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_payroll_pay_groups" ADD CONSTRAINT "hr_payroll_pay_groups_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_payroll_payment_batches" ADD CONSTRAINT "hr_payroll_payment_batches_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_payroll_payment_batches" ADD CONSTRAINT "hr_payroll_payment_batches_run_id_hr_payroll_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."hr_payroll_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_payroll_payment_batches" ADD CONSTRAINT "hr_payroll_payment_batches_cycle_id_hr_payroll_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."hr_payroll_cycles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_payroll_payments" ADD CONSTRAINT "hr_payroll_payments_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_payroll_payments" ADD CONSTRAINT "hr_payroll_payments_batch_id_hr_payroll_payment_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."hr_payroll_payment_batches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_payroll_payments" ADD CONSTRAINT "hr_payroll_payments_run_id_hr_payroll_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."hr_payroll_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_payroll_payments" ADD CONSTRAINT "hr_payroll_payments_cycle_id_hr_payroll_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."hr_payroll_cycles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_payroll_payments" ADD CONSTRAINT "hr_payroll_payments_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_payroll_payments" ADD CONSTRAINT "hr_payroll_payments_payslip_id_hr_payroll_payslips_id_fk" FOREIGN KEY ("payslip_id") REFERENCES "public"."hr_payroll_payslips"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_payroll_payslips" ADD CONSTRAINT "hr_payroll_payslips_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_payroll_payslips" ADD CONSTRAINT "hr_payroll_payslips_run_id_hr_payroll_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."hr_payroll_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_payroll_payslips" ADD CONSTRAINT "hr_payroll_payslips_cycle_id_hr_payroll_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."hr_payroll_cycles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_payroll_payslips" ADD CONSTRAINT "hr_payroll_payslips_run_line_id_hr_payroll_run_lines_id_fk" FOREIGN KEY ("run_line_id") REFERENCES "public"."hr_payroll_run_lines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_payroll_payslips" ADD CONSTRAINT "hr_payroll_payslips_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_payroll_run_lines" ADD CONSTRAINT "hr_payroll_run_lines_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_payroll_run_lines" ADD CONSTRAINT "hr_payroll_run_lines_run_id_hr_payroll_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."hr_payroll_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_payroll_run_lines" ADD CONSTRAINT "hr_payroll_run_lines_cycle_id_hr_payroll_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."hr_payroll_cycles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_payroll_run_lines" ADD CONSTRAINT "hr_payroll_run_lines_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_payroll_runs" ADD CONSTRAINT "hr_payroll_runs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_payroll_runs" ADD CONSTRAINT "hr_payroll_runs_cycle_id_hr_payroll_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."hr_payroll_cycles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_payroll_validations" ADD CONSTRAINT "hr_payroll_validations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_payroll_validations" ADD CONSTRAINT "hr_payroll_validations_run_id_hr_payroll_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."hr_payroll_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_payroll_validations" ADD CONSTRAINT "hr_payroll_validations_cycle_id_hr_payroll_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."hr_payroll_cycles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_payroll_validations" ADD CONSTRAINT "hr_payroll_validations_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_career_discussion" ADD CONSTRAINT "hrm_career_discussion_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_career_discussion" ADD CONSTRAINT "hrm_career_discussion_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_career_discussion" ADD CONSTRAINT "hrm_career_discussion_plan_id_hrm_development_plan_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."hrm_development_plan"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_career_path_framework" ADD CONSTRAINT "hrm_career_path_framework_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_career_path_stage" ADD CONSTRAINT "hrm_career_path_stage_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_career_path_stage" ADD CONSTRAINT "hrm_career_path_stage_framework_id_hrm_career_path_framework_id_fk" FOREIGN KEY ("framework_id") REFERENCES "public"."hrm_career_path_framework"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_development_coach_assignment" ADD CONSTRAINT "hrm_development_coach_assignment_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_development_coach_assignment" ADD CONSTRAINT "hrm_development_coach_assignment_plan_id_hrm_development_plan_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."hrm_development_plan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_development_coach_assignment" ADD CONSTRAINT "hrm_development_coach_assignment_coach_employee_id_hr_employees_id_fk" FOREIGN KEY ("coach_employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_development_goal" ADD CONSTRAINT "hrm_development_goal_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_development_goal" ADD CONSTRAINT "hrm_development_goal_plan_id_hrm_development_plan_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."hrm_development_plan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_development_learning_action" ADD CONSTRAINT "hrm_development_learning_action_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_development_learning_action" ADD CONSTRAINT "hrm_development_learning_action_plan_id_hrm_development_plan_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."hrm_development_plan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_development_learning_action" ADD CONSTRAINT "hrm_development_learning_action_goal_id_hrm_development_goal_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."hrm_development_goal"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_development_mentor_assignment" ADD CONSTRAINT "hrm_development_mentor_assignment_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_development_mentor_assignment" ADD CONSTRAINT "hrm_development_mentor_assignment_plan_id_hrm_development_plan_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."hrm_development_plan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_development_mentor_assignment" ADD CONSTRAINT "hrm_development_mentor_assignment_mentor_employee_id_hr_employees_id_fk" FOREIGN KEY ("mentor_employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_development_milestone" ADD CONSTRAINT "hrm_development_milestone_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_development_milestone" ADD CONSTRAINT "hrm_development_milestone_goal_id_hrm_development_goal_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."hrm_development_goal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_development_milestone" ADD CONSTRAINT "hrm_development_milestone_owner_employee_id_hr_employees_id_fk" FOREIGN KEY ("owner_employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_development_plan" ADD CONSTRAINT "hrm_development_plan_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_development_plan" ADD CONSTRAINT "hrm_development_plan_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_development_plan" ADD CONSTRAINT "hrm_development_plan_target_role_id_hrm_employee_target_role_id_fk" FOREIGN KEY ("target_role_id") REFERENCES "public"."hrm_employee_target_role"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_development_session" ADD CONSTRAINT "hrm_development_session_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_development_session" ADD CONSTRAINT "hrm_development_session_plan_id_hrm_development_plan_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."hrm_development_plan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_development_session" ADD CONSTRAINT "hrm_development_session_mentor_assignment_id_hrm_development_mentor_assignment_id_fk" FOREIGN KEY ("mentor_assignment_id") REFERENCES "public"."hrm_development_mentor_assignment"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_development_session" ADD CONSTRAINT "hrm_development_session_coach_assignment_id_hrm_development_coach_assignment_id_fk" FOREIGN KEY ("coach_assignment_id") REFERENCES "public"."hrm_development_coach_assignment"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_development_stretch_assignment" ADD CONSTRAINT "hrm_development_stretch_assignment_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_development_stretch_assignment" ADD CONSTRAINT "hrm_development_stretch_assignment_plan_id_hrm_development_plan_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."hrm_development_plan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_development_stretch_assignment" ADD CONSTRAINT "hrm_development_stretch_assignment_department_id_hr_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."hr_departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_development_stretch_assignment" ADD CONSTRAINT "hrm_development_stretch_assignment_position_id_hr_positions_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."hr_positions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_employee_career_aspiration" ADD CONSTRAINT "hrm_employee_career_aspiration_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_employee_career_aspiration" ADD CONSTRAINT "hrm_employee_career_aspiration_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_employee_career_aspiration" ADD CONSTRAINT "hrm_employee_career_aspiration_preferred_department_id_hr_departments_id_fk" FOREIGN KEY ("preferred_department_id") REFERENCES "public"."hr_departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_employee_readiness_snapshot" ADD CONSTRAINT "hrm_employee_readiness_snapshot_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_employee_readiness_snapshot" ADD CONSTRAINT "hrm_employee_readiness_snapshot_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_employee_readiness_snapshot" ADD CONSTRAINT "hrm_employee_readiness_snapshot_target_role_id_hrm_employee_target_role_id_fk" FOREIGN KEY ("target_role_id") REFERENCES "public"."hrm_employee_target_role"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_employee_target_role" ADD CONSTRAINT "hrm_employee_target_role_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_employee_target_role" ADD CONSTRAINT "hrm_employee_target_role_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_employee_target_role" ADD CONSTRAINT "hrm_employee_target_role_position_id_hr_positions_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."hr_positions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_employee_target_role" ADD CONSTRAINT "hrm_employee_target_role_department_id_hr_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."hr_departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_employee_target_role" ADD CONSTRAINT "hrm_employee_target_role_framework_id_hrm_career_path_framework_id_fk" FOREIGN KEY ("framework_id") REFERENCES "public"."hrm_career_path_framework"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_employee_target_role" ADD CONSTRAINT "hrm_employee_target_role_stage_id_hrm_career_path_stage_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."hrm_career_path_stage"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_audit_events" ADD CONSTRAINT "hr_mcp_audit_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_audit_events" ADD CONSTRAINT "hr_mcp_audit_events_country_config_id_hr_mcp_country_configs_id_fk" FOREIGN KEY ("country_config_id") REFERENCES "public"."hr_mcp_country_configs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_audit_events" ADD CONSTRAINT "hr_mcp_audit_events_legal_entity_setup_id_hr_mcp_legal_entity_setups_id_fk" FOREIGN KEY ("legal_entity_setup_id") REFERENCES "public"."hr_mcp_legal_entity_setups"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_audit_events" ADD CONSTRAINT "hr_mcp_audit_events_rule_version_id_hr_mcp_rule_versions_id_fk" FOREIGN KEY ("rule_version_id") REFERENCES "public"."hr_mcp_rule_versions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_audit_events" ADD CONSTRAINT "hr_mcp_audit_events_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_bank_export_configs" ADD CONSTRAINT "hr_mcp_bank_export_configs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_bank_export_configs" ADD CONSTRAINT "hr_mcp_bank_export_configs_country_config_id_hr_mcp_country_configs_id_fk" FOREIGN KEY ("country_config_id") REFERENCES "public"."hr_mcp_country_configs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_bank_export_configs" ADD CONSTRAINT "hr_mcp_bank_export_configs_legal_entity_setup_id_hr_mcp_legal_entity_setups_id_fk" FOREIGN KEY ("legal_entity_setup_id") REFERENCES "public"."hr_mcp_legal_entity_setups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_calendar_periods" ADD CONSTRAINT "hr_mcp_calendar_periods_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_calendar_periods" ADD CONSTRAINT "hr_mcp_calendar_periods_calendar_id_hr_mcp_payroll_calendars_id_fk" FOREIGN KEY ("calendar_id") REFERENCES "public"."hr_mcp_payroll_calendars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_country_configs" ADD CONSTRAINT "hr_mcp_country_configs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_cross_country_cost_lines" ADD CONSTRAINT "hr_mcp_cross_country_cost_lines_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_cross_country_cost_lines" ADD CONSTRAINT "hr_mcp_cross_country_cost_lines_report_period_id_hr_mcp_cross_country_report_periods_id_fk" FOREIGN KEY ("report_period_id") REFERENCES "public"."hr_mcp_cross_country_report_periods"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_cross_country_cost_lines" ADD CONSTRAINT "hr_mcp_cross_country_cost_lines_country_config_id_hr_mcp_country_configs_id_fk" FOREIGN KEY ("country_config_id") REFERENCES "public"."hr_mcp_country_configs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_cross_country_cost_lines" ADD CONSTRAINT "hr_mcp_cross_country_cost_lines_legal_entity_setup_id_hr_mcp_legal_entity_setups_id_fk" FOREIGN KEY ("legal_entity_setup_id") REFERENCES "public"."hr_mcp_legal_entity_setups"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_cross_country_report_periods" ADD CONSTRAINT "hr_mcp_cross_country_report_periods_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_currency_configs" ADD CONSTRAINT "hr_mcp_currency_configs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_currency_configs" ADD CONSTRAINT "hr_mcp_currency_configs_country_config_id_hr_mcp_country_configs_id_fk" FOREIGN KEY ("country_config_id") REFERENCES "public"."hr_mcp_country_configs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_currency_configs" ADD CONSTRAINT "hr_mcp_currency_configs_legal_entity_setup_id_hr_mcp_legal_entity_setups_id_fk" FOREIGN KEY ("legal_entity_setup_id") REFERENCES "public"."hr_mcp_legal_entity_setups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_employee_classifications" ADD CONSTRAINT "hr_mcp_employee_classifications_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_employee_classifications" ADD CONSTRAINT "hr_mcp_employee_classifications_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_employee_classifications" ADD CONSTRAINT "hr_mcp_employee_classifications_country_config_id_hr_mcp_country_configs_id_fk" FOREIGN KEY ("country_config_id") REFERENCES "public"."hr_mcp_country_configs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_employee_classifications" ADD CONSTRAINT "hr_mcp_employee_classifications_legal_entity_setup_id_hr_mcp_legal_entity_setups_id_fk" FOREIGN KEY ("legal_entity_setup_id") REFERENCES "public"."hr_mcp_legal_entity_setups"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_employer_contribution_rules" ADD CONSTRAINT "hr_mcp_employer_contribution_rules_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_employer_contribution_rules" ADD CONSTRAINT "hr_mcp_employer_contribution_rules_country_config_id_hr_mcp_country_configs_id_fk" FOREIGN KEY ("country_config_id") REFERENCES "public"."hr_mcp_country_configs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_employer_contribution_rules" ADD CONSTRAINT "hr_mcp_employer_contribution_rules_rule_version_id_hr_mcp_rule_versions_id_fk" FOREIGN KEY ("rule_version_id") REFERENCES "public"."hr_mcp_rule_versions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_exchange_rates" ADD CONSTRAINT "hr_mcp_exchange_rates_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_finalized_rule_snapshots" ADD CONSTRAINT "hr_mcp_finalized_rule_snapshots_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_finalized_rule_snapshots" ADD CONSTRAINT "hr_mcp_finalized_rule_snapshots_country_config_id_hr_mcp_country_configs_id_fk" FOREIGN KEY ("country_config_id") REFERENCES "public"."hr_mcp_country_configs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_finalized_rule_snapshots" ADD CONSTRAINT "hr_mcp_finalized_rule_snapshots_legal_entity_setup_id_hr_mcp_legal_entity_setups_id_fk" FOREIGN KEY ("legal_entity_setup_id") REFERENCES "public"."hr_mcp_legal_entity_setups"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_finalized_rule_snapshots" ADD CONSTRAINT "hr_mcp_finalized_rule_snapshots_rule_version_id_hr_mcp_rule_versions_id_fk" FOREIGN KEY ("rule_version_id") REFERENCES "public"."hr_mcp_rule_versions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_leave_payroll_treatments" ADD CONSTRAINT "hr_mcp_leave_payroll_treatments_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_leave_payroll_treatments" ADD CONSTRAINT "hr_mcp_leave_payroll_treatments_country_config_id_hr_mcp_country_configs_id_fk" FOREIGN KEY ("country_config_id") REFERENCES "public"."hr_mcp_country_configs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_leave_payroll_treatments" ADD CONSTRAINT "hr_mcp_leave_payroll_treatments_rule_version_id_hr_mcp_rule_versions_id_fk" FOREIGN KEY ("rule_version_id") REFERENCES "public"."hr_mcp_rule_versions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_legal_entity_setups" ADD CONSTRAINT "hr_mcp_legal_entity_setups_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_legal_entity_setups" ADD CONSTRAINT "hr_mcp_legal_entity_setups_country_config_id_hr_mcp_country_configs_id_fk" FOREIGN KEY ("country_config_id") REFERENCES "public"."hr_mcp_country_configs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_overtime_rules" ADD CONSTRAINT "hr_mcp_overtime_rules_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_overtime_rules" ADD CONSTRAINT "hr_mcp_overtime_rules_country_config_id_hr_mcp_country_configs_id_fk" FOREIGN KEY ("country_config_id") REFERENCES "public"."hr_mcp_country_configs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_overtime_rules" ADD CONSTRAINT "hr_mcp_overtime_rules_rule_version_id_hr_mcp_rule_versions_id_fk" FOREIGN KEY ("rule_version_id") REFERENCES "public"."hr_mcp_rule_versions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_pay_component_treatments" ADD CONSTRAINT "hr_mcp_pay_component_treatments_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_pay_component_treatments" ADD CONSTRAINT "hr_mcp_pay_component_treatments_country_config_id_hr_mcp_country_configs_id_fk" FOREIGN KEY ("country_config_id") REFERENCES "public"."hr_mcp_country_configs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_pay_component_treatments" ADD CONSTRAINT "hr_mcp_pay_component_treatments_rule_version_id_hr_mcp_rule_versions_id_fk" FOREIGN KEY ("rule_version_id") REFERENCES "public"."hr_mcp_rule_versions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_payroll_calendars" ADD CONSTRAINT "hr_mcp_payroll_calendars_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_payroll_calendars" ADD CONSTRAINT "hr_mcp_payroll_calendars_country_config_id_hr_mcp_country_configs_id_fk" FOREIGN KEY ("country_config_id") REFERENCES "public"."hr_mcp_country_configs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_payroll_calendars" ADD CONSTRAINT "hr_mcp_payroll_calendars_legal_entity_setup_id_hr_mcp_legal_entity_setups_id_fk" FOREIGN KEY ("legal_entity_setup_id") REFERENCES "public"."hr_mcp_legal_entity_setups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_payslip_field_configs" ADD CONSTRAINT "hr_mcp_payslip_field_configs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_payslip_field_configs" ADD CONSTRAINT "hr_mcp_payslip_field_configs_country_config_id_hr_mcp_country_configs_id_fk" FOREIGN KEY ("country_config_id") REFERENCES "public"."hr_mcp_country_configs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_proration_rules" ADD CONSTRAINT "hr_mcp_proration_rules_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_proration_rules" ADD CONSTRAINT "hr_mcp_proration_rules_country_config_id_hr_mcp_country_configs_id_fk" FOREIGN KEY ("country_config_id") REFERENCES "public"."hr_mcp_country_configs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_proration_rules" ADD CONSTRAINT "hr_mcp_proration_rules_rule_version_id_hr_mcp_rule_versions_id_fk" FOREIGN KEY ("rule_version_id") REFERENCES "public"."hr_mcp_rule_versions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_public_holidays" ADD CONSTRAINT "hr_mcp_public_holidays_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_public_holidays" ADD CONSTRAINT "hr_mcp_public_holidays_country_config_id_hr_mcp_country_configs_id_fk" FOREIGN KEY ("country_config_id") REFERENCES "public"."hr_mcp_country_configs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_report_configs" ADD CONSTRAINT "hr_mcp_report_configs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_report_configs" ADD CONSTRAINT "hr_mcp_report_configs_country_config_id_hr_mcp_country_configs_id_fk" FOREIGN KEY ("country_config_id") REFERENCES "public"."hr_mcp_country_configs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_report_generations" ADD CONSTRAINT "hr_mcp_report_generations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_report_generations" ADD CONSTRAINT "hr_mcp_report_generations_report_config_id_hr_mcp_report_configs_id_fk" FOREIGN KEY ("report_config_id") REFERENCES "public"."hr_mcp_report_configs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_rule_versions" ADD CONSTRAINT "hr_mcp_rule_versions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_rule_versions" ADD CONSTRAINT "hr_mcp_rule_versions_country_config_id_hr_mcp_country_configs_id_fk" FOREIGN KEY ("country_config_id") REFERENCES "public"."hr_mcp_country_configs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_statutory_contribution_rules" ADD CONSTRAINT "hr_mcp_statutory_contribution_rules_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_statutory_contribution_rules" ADD CONSTRAINT "hr_mcp_statutory_contribution_rules_country_config_id_hr_mcp_country_configs_id_fk" FOREIGN KEY ("country_config_id") REFERENCES "public"."hr_mcp_country_configs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_statutory_contribution_rules" ADD CONSTRAINT "hr_mcp_statutory_contribution_rules_rule_version_id_hr_mcp_rule_versions_id_fk" FOREIGN KEY ("rule_version_id") REFERENCES "public"."hr_mcp_rule_versions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_statutory_deadlines" ADD CONSTRAINT "hr_mcp_statutory_deadlines_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_statutory_deadlines" ADD CONSTRAINT "hr_mcp_statutory_deadlines_country_config_id_hr_mcp_country_configs_id_fk" FOREIGN KEY ("country_config_id") REFERENCES "public"."hr_mcp_country_configs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_tax_rules" ADD CONSTRAINT "hr_mcp_tax_rules_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_tax_rules" ADD CONSTRAINT "hr_mcp_tax_rules_country_config_id_hr_mcp_country_configs_id_fk" FOREIGN KEY ("country_config_id") REFERENCES "public"."hr_mcp_country_configs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_tax_rules" ADD CONSTRAINT "hr_mcp_tax_rules_rule_version_id_hr_mcp_rule_versions_id_fk" FOREIGN KEY ("rule_version_id") REFERENCES "public"."hr_mcp_rule_versions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_vendor_export_configs" ADD CONSTRAINT "hr_mcp_vendor_export_configs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_mcp_vendor_export_configs" ADD CONSTRAINT "hr_mcp_vendor_export_configs_country_config_id_hr_mcp_country_configs_id_fk" FOREIGN KEY ("country_config_id") REFERENCES "public"."hr_mcp_country_configs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_lms_assessment_attempts" ADD CONSTRAINT "hr_lms_assessment_attempts_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_lms_assessment_attempts" ADD CONSTRAINT "hr_lms_assessment_attempts_enrollment_id_hr_lms_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."hr_lms_enrollments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_lms_assessment_attempts" ADD CONSTRAINT "hr_lms_assessment_attempts_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_lms_assessment_attempts" ADD CONSTRAINT "hr_lms_assessment_attempts_course_id_hr_lms_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."hr_lms_courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_lms_assignments" ADD CONSTRAINT "hr_lms_assignments_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_lms_assignments" ADD CONSTRAINT "hr_lms_assignments_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_lms_assignments" ADD CONSTRAINT "hr_lms_assignments_course_id_hr_lms_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."hr_lms_courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_lms_assignments" ADD CONSTRAINT "hr_lms_assignments_path_id_hr_lms_learning_paths_id_fk" FOREIGN KEY ("path_id") REFERENCES "public"."hr_lms_learning_paths"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_lms_audit_events" ADD CONSTRAINT "hr_lms_audit_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_lms_certifications" ADD CONSTRAINT "hr_lms_certifications_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_lms_certifications" ADD CONSTRAINT "hr_lms_certifications_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_lms_certifications" ADD CONSTRAINT "hr_lms_certifications_course_id_hr_lms_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."hr_lms_courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_lms_certifications" ADD CONSTRAINT "hr_lms_certifications_enrollment_id_hr_lms_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."hr_lms_enrollments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_lms_course_content_refs" ADD CONSTRAINT "hr_lms_course_content_refs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_lms_course_content_refs" ADD CONSTRAINT "hr_lms_course_content_refs_course_id_hr_lms_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."hr_lms_courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_lms_courses" ADD CONSTRAINT "hr_lms_courses_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_lms_enrollments" ADD CONSTRAINT "hr_lms_enrollments_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_lms_enrollments" ADD CONSTRAINT "hr_lms_enrollments_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_lms_enrollments" ADD CONSTRAINT "hr_lms_enrollments_course_id_hr_lms_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."hr_lms_courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_lms_enrollments" ADD CONSTRAINT "hr_lms_enrollments_assignment_id_hr_lms_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."hr_lms_assignments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_lms_learning_path_courses" ADD CONSTRAINT "hr_lms_learning_path_courses_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_lms_learning_path_courses" ADD CONSTRAINT "hr_lms_learning_path_courses_path_id_hr_lms_learning_paths_id_fk" FOREIGN KEY ("path_id") REFERENCES "public"."hr_lms_learning_paths"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_lms_learning_path_courses" ADD CONSTRAINT "hr_lms_learning_path_courses_course_id_hr_lms_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."hr_lms_courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_lms_learning_paths" ADD CONSTRAINT "hr_lms_learning_paths_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_lms_learning_paths" ADD CONSTRAINT "hr_lms_learning_paths_target_department_id_hr_departments_id_fk" FOREIGN KEY ("target_department_id") REFERENCES "public"."hr_departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_lms_progress" ADD CONSTRAINT "hr_lms_progress_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_lms_progress" ADD CONSTRAINT "hr_lms_progress_enrollment_id_hr_lms_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."hr_lms_enrollments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_lms_progress" ADD CONSTRAINT "hr_lms_progress_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_lms_progress" ADD CONSTRAINT "hr_lms_progress_course_id_hr_lms_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."hr_lms_courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_lms_reminders" ADD CONSTRAINT "hr_lms_reminders_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_lms_reminders" ADD CONSTRAINT "hr_lms_reminders_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_lms_reminders" ADD CONSTRAINT "hr_lms_reminders_course_id_hr_lms_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."hr_lms_courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_lms_reminders" ADD CONSTRAINT "hr_lms_reminders_certification_id_hr_lms_certifications_id_fk" FOREIGN KEY ("certification_id") REFERENCES "public"."hr_lms_certifications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_csf_assessment_evidence" ADD CONSTRAINT "hr_csf_assessment_evidence_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_csf_assessment_evidence" ADD CONSTRAINT "hr_csf_assessment_evidence_assessment_id_hr_csf_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."hr_csf_assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_csf_assessments" ADD CONSTRAINT "hr_csf_assessments_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_csf_assessments" ADD CONSTRAINT "hr_csf_assessments_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_csf_assessments" ADD CONSTRAINT "hr_csf_assessments_competency_profile_id_hr_csf_employee_competency_profiles_id_fk" FOREIGN KEY ("competency_profile_id") REFERENCES "public"."hr_csf_employee_competency_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_csf_assessments" ADD CONSTRAINT "hr_csf_assessments_skill_profile_id_hr_csf_employee_skill_profiles_id_fk" FOREIGN KEY ("skill_profile_id") REFERENCES "public"."hr_csf_employee_skill_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_csf_assessments" ADD CONSTRAINT "hr_csf_assessments_competency_id_hr_csf_competencies_id_fk" FOREIGN KEY ("competency_id") REFERENCES "public"."hr_csf_competencies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_csf_assessments" ADD CONSTRAINT "hr_csf_assessments_skill_id_hr_csf_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."hr_csf_skills"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_csf_assessments" ADD CONSTRAINT "hr_csf_assessments_proficiency_level_id_hr_csf_proficiency_levels_id_fk" FOREIGN KEY ("proficiency_level_id") REFERENCES "public"."hr_csf_proficiency_levels"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_csf_assessments" ADD CONSTRAINT "hr_csf_assessments_assessor_employee_id_hr_employees_id_fk" FOREIGN KEY ("assessor_employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_csf_audit_events" ADD CONSTRAINT "hr_csf_audit_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_csf_audit_events" ADD CONSTRAINT "hr_csf_audit_events_competency_id_hr_csf_competencies_id_fk" FOREIGN KEY ("competency_id") REFERENCES "public"."hr_csf_competencies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_csf_audit_events" ADD CONSTRAINT "hr_csf_audit_events_skill_id_hr_csf_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."hr_csf_skills"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_csf_audit_events" ADD CONSTRAINT "hr_csf_audit_events_proficiency_scale_id_hr_csf_proficiency_scales_id_fk" FOREIGN KEY ("proficiency_scale_id") REFERENCES "public"."hr_csf_proficiency_scales"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_csf_competencies" ADD CONSTRAINT "hr_csf_competencies_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_csf_competencies" ADD CONSTRAINT "hr_csf_competencies_proficiency_scale_id_hr_csf_proficiency_scales_id_fk" FOREIGN KEY ("proficiency_scale_id") REFERENCES "public"."hr_csf_proficiency_scales"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_csf_competency_requirements" ADD CONSTRAINT "hr_csf_competency_requirements_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_csf_competency_requirements" ADD CONSTRAINT "hr_csf_competency_requirements_competency_id_hr_csf_competencies_id_fk" FOREIGN KEY ("competency_id") REFERENCES "public"."hr_csf_competencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_csf_competency_requirements" ADD CONSTRAINT "hr_csf_competency_requirements_position_id_hr_positions_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."hr_positions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_csf_competency_requirements" ADD CONSTRAINT "hr_csf_competency_requirements_department_id_hr_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."hr_departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_csf_competency_requirements" ADD CONSTRAINT "hr_csf_competency_requirements_required_proficiency_level_id_hr_csf_proficiency_levels_id_fk" FOREIGN KEY ("required_proficiency_level_id") REFERENCES "public"."hr_csf_proficiency_levels"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_csf_development_links" ADD CONSTRAINT "hr_csf_development_links_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_csf_development_links" ADD CONSTRAINT "hr_csf_development_links_recommendation_id_hr_csf_development_recommendations_id_fk" FOREIGN KEY ("recommendation_id") REFERENCES "public"."hr_csf_development_recommendations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_csf_development_recommendations" ADD CONSTRAINT "hr_csf_development_recommendations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_csf_development_recommendations" ADD CONSTRAINT "hr_csf_development_recommendations_gap_id_hr_csf_gaps_id_fk" FOREIGN KEY ("gap_id") REFERENCES "public"."hr_csf_gaps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_csf_employee_competency_profiles" ADD CONSTRAINT "hr_csf_employee_competency_profiles_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_csf_employee_competency_profiles" ADD CONSTRAINT "hr_csf_employee_competency_profiles_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_csf_employee_competency_profiles" ADD CONSTRAINT "hr_csf_employee_competency_profiles_competency_id_hr_csf_competencies_id_fk" FOREIGN KEY ("competency_id") REFERENCES "public"."hr_csf_competencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_csf_employee_competency_profiles" ADD CONSTRAINT "hr_csf_employee_competency_profiles_current_proficiency_level_id_hr_csf_proficiency_levels_id_fk" FOREIGN KEY ("current_proficiency_level_id") REFERENCES "public"."hr_csf_proficiency_levels"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_csf_employee_skill_profiles" ADD CONSTRAINT "hr_csf_employee_skill_profiles_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_csf_employee_skill_profiles" ADD CONSTRAINT "hr_csf_employee_skill_profiles_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_csf_employee_skill_profiles" ADD CONSTRAINT "hr_csf_employee_skill_profiles_skill_id_hr_csf_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."hr_csf_skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_csf_employee_skill_profiles" ADD CONSTRAINT "hr_csf_employee_skill_profiles_current_proficiency_level_id_hr_csf_proficiency_levels_id_fk" FOREIGN KEY ("current_proficiency_level_id") REFERENCES "public"."hr_csf_proficiency_levels"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_csf_gap_classifications" ADD CONSTRAINT "hr_csf_gap_classifications_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_csf_gap_classifications" ADD CONSTRAINT "hr_csf_gap_classifications_gap_id_hr_csf_gaps_id_fk" FOREIGN KEY ("gap_id") REFERENCES "public"."hr_csf_gaps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_csf_gaps" ADD CONSTRAINT "hr_csf_gaps_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_csf_gaps" ADD CONSTRAINT "hr_csf_gaps_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_csf_gaps" ADD CONSTRAINT "hr_csf_gaps_skill_id_hr_csf_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."hr_csf_skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_csf_gaps" ADD CONSTRAINT "hr_csf_gaps_competency_id_hr_csf_competencies_id_fk" FOREIGN KEY ("competency_id") REFERENCES "public"."hr_csf_competencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_csf_gaps" ADD CONSTRAINT "hr_csf_gaps_required_proficiency_level_id_hr_csf_proficiency_levels_id_fk" FOREIGN KEY ("required_proficiency_level_id") REFERENCES "public"."hr_csf_proficiency_levels"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_csf_gaps" ADD CONSTRAINT "hr_csf_gaps_current_proficiency_level_id_hr_csf_proficiency_levels_id_fk" FOREIGN KEY ("current_proficiency_level_id") REFERENCES "public"."hr_csf_proficiency_levels"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_csf_proficiency_levels" ADD CONSTRAINT "hr_csf_proficiency_levels_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_csf_proficiency_levels" ADD CONSTRAINT "hr_csf_proficiency_levels_scale_id_hr_csf_proficiency_scales_id_fk" FOREIGN KEY ("scale_id") REFERENCES "public"."hr_csf_proficiency_scales"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_csf_proficiency_scales" ADD CONSTRAINT "hr_csf_proficiency_scales_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_csf_skill_requirements" ADD CONSTRAINT "hr_csf_skill_requirements_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_csf_skill_requirements" ADD CONSTRAINT "hr_csf_skill_requirements_skill_id_hr_csf_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."hr_csf_skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_csf_skill_requirements" ADD CONSTRAINT "hr_csf_skill_requirements_position_id_hr_positions_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."hr_positions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_csf_skill_requirements" ADD CONSTRAINT "hr_csf_skill_requirements_department_id_hr_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."hr_departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_csf_skill_requirements" ADD CONSTRAINT "hr_csf_skill_requirements_required_proficiency_level_id_hr_csf_proficiency_levels_id_fk" FOREIGN KEY ("required_proficiency_level_id") REFERENCES "public"."hr_csf_proficiency_levels"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_csf_skills" ADD CONSTRAINT "hr_csf_skills_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_csf_skills" ADD CONSTRAINT "hr_csf_skills_proficiency_scale_id_hr_csf_proficiency_scales_id_fk" FOREIGN KEY ("proficiency_scale_id") REFERENCES "public"."hr_csf_proficiency_scales"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "hr_sbs_audit_events_org_occurred_idx" ON "hr_sbs_audit_events" USING btree ("organization_id","occurred_at");--> statement-breakpoint
CREATE INDEX "hr_sbs_audit_events_org_action_idx" ON "hr_sbs_audit_events" USING btree ("organization_id","action");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_sbs_benchmark_entries_org_version_dims_uidx" ON "hr_sbs_benchmark_entries" USING btree ("organization_id","benchmark_version_id","industry","country","location","job_family","job_level");--> statement-breakpoint
CREATE INDEX "hr_sbs_benchmark_entries_org_version_idx" ON "hr_sbs_benchmark_entries" USING btree ("organization_id","benchmark_version_id");--> statement-breakpoint
CREATE INDEX "hr_sbs_benchmark_mappings_org_version_idx" ON "hr_sbs_benchmark_mappings" USING btree ("organization_id","benchmark_version_id");--> statement-breakpoint
CREATE INDEX "hr_sbs_benchmark_mappings_org_status_idx" ON "hr_sbs_benchmark_mappings" USING btree ("organization_id","mapping_status");--> statement-breakpoint
CREATE INDEX "hr_sbs_benchmark_mappings_org_employee_idx" ON "hr_sbs_benchmark_mappings" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_sbs_benchmark_versions_org_code_uidx" ON "hr_sbs_benchmark_versions" USING btree ("organization_id","code");--> statement-breakpoint
CREATE INDEX "hr_sbs_benchmark_versions_org_status_idx" ON "hr_sbs_benchmark_versions" USING btree ("organization_id","version_status");--> statement-breakpoint
CREATE INDEX "hr_sbs_comp_analyses_org_version_idx" ON "hr_sbs_compensation_analyses" USING btree ("organization_id","benchmark_version_id");--> statement-breakpoint
CREATE INDEX "hr_sbs_comp_analyses_org_created_idx" ON "hr_sbs_compensation_analyses" USING btree ("organization_id","created_at");--> statement-breakpoint
CREATE INDEX "hr_sbs_cpm_rec_refs_org_analysis_idx" ON "hr_sbs_cpm_recommendation_refs" USING btree ("organization_id","analysis_id");--> statement-breakpoint
CREATE INDEX "hr_sbs_cpm_rec_refs_org_employee_idx" ON "hr_sbs_cpm_recommendation_refs" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_sbs_currency_refs_org_pair_date_idx" ON "hr_sbs_currency_refs" USING btree ("organization_id","from_currency_code","to_currency_code","effective_date");--> statement-breakpoint
CREATE INDEX "hr_sbs_mapping_approvals_org_mapping_idx" ON "hr_sbs_mapping_approvals" USING btree ("organization_id","mapping_id");--> statement-breakpoint
CREATE INDEX "hr_payroll_adjustments_org_cycle_idx" ON "hr_payroll_adjustments" USING btree ("organization_id","cycle_id","adjustment_status");--> statement-breakpoint
CREATE INDEX "hr_payroll_adjustments_org_employee_idx" ON "hr_payroll_adjustments" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_payroll_approvals_org_run_idx" ON "hr_payroll_approvals" USING btree ("organization_id","run_id","step_order");--> statement-breakpoint
CREATE INDEX "hr_payroll_audit_events_org_occurred_idx" ON "hr_payroll_audit_events" USING btree ("organization_id","occurred_at");--> statement-breakpoint
CREATE INDEX "hr_payroll_audit_events_org_cycle_idx" ON "hr_payroll_audit_events" USING btree ("organization_id","cycle_id");--> statement-breakpoint
CREATE INDEX "hr_payroll_audit_events_org_run_idx" ON "hr_payroll_audit_events" USING btree ("organization_id","run_id");--> statement-breakpoint
CREATE INDEX "hr_payroll_corrections_org_source_run_idx" ON "hr_payroll_corrections" USING btree ("organization_id","source_run_id");--> statement-breakpoint
CREATE INDEX "hr_payroll_corrections_org_status_idx" ON "hr_payroll_corrections" USING btree ("organization_id","correction_status");--> statement-breakpoint
CREATE INDEX "hr_payroll_cycle_inputs_org_cycle_idx" ON "hr_payroll_cycle_inputs" USING btree ("organization_id","cycle_id","input_status");--> statement-breakpoint
CREATE INDEX "hr_payroll_cycle_inputs_org_employee_idx" ON "hr_payroll_cycle_inputs" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_payroll_cycle_inputs_org_source_ref_idx" ON "hr_payroll_cycle_inputs" USING btree ("organization_id","input_source","external_ref");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_payroll_cycles_org_pay_group_code_uidx" ON "hr_payroll_cycles" USING btree ("organization_id","pay_group_id","code");--> statement-breakpoint
CREATE INDEX "hr_payroll_cycles_org_status_idx" ON "hr_payroll_cycles" USING btree ("organization_id","cycle_status");--> statement-breakpoint
CREATE INDEX "hr_payroll_cycles_org_pay_date_idx" ON "hr_payroll_cycles" USING btree ("organization_id","pay_date_at");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_payroll_ed_definitions_org_code_uidx" ON "hr_payroll_earning_deduction_definitions" USING btree ("organization_id","code","employee_id");--> statement-breakpoint
CREATE INDEX "hr_payroll_ed_definitions_org_employee_idx" ON "hr_payroll_earning_deduction_definitions" USING btree ("organization_id","employee_id","active");--> statement-breakpoint
CREATE INDEX "hr_payroll_ed_definitions_org_pay_group_idx" ON "hr_payroll_earning_deduction_definitions" USING btree ("organization_id","pay_group_id");--> statement-breakpoint
CREATE INDEX "hr_payroll_employee_assignments_org_employee_idx" ON "hr_payroll_employee_assignments" USING btree ("organization_id","employee_id","assignment_status");--> statement-breakpoint
CREATE INDEX "hr_payroll_employee_assignments_org_pay_group_idx" ON "hr_payroll_employee_assignments" USING btree ("organization_id","pay_group_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_payroll_employee_assignments_org_group_employee_from_uidx" ON "hr_payroll_employee_assignments" USING btree ("organization_id","pay_group_id","employee_id","effective_from");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_payroll_journal_refs_org_run_uidx" ON "hr_payroll_journal_refs" USING btree ("organization_id","run_id");--> statement-breakpoint
CREATE INDEX "hr_payroll_journal_refs_org_journal_ref_idx" ON "hr_payroll_journal_refs" USING btree ("organization_id","journal_reference");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_payroll_pay_groups_org_code_uidx" ON "hr_payroll_pay_groups" USING btree ("organization_id","code");--> statement-breakpoint
CREATE INDEX "hr_payroll_pay_groups_org_status_idx" ON "hr_payroll_pay_groups" USING btree ("organization_id","pay_group_status");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_payroll_payment_batches_org_number_uidx" ON "hr_payroll_payment_batches" USING btree ("organization_id","batch_number");--> statement-breakpoint
CREATE INDEX "hr_payroll_payment_batches_org_run_idx" ON "hr_payroll_payment_batches" USING btree ("organization_id","run_id");--> statement-breakpoint
CREATE INDEX "hr_payroll_payments_org_batch_idx" ON "hr_payroll_payments" USING btree ("organization_id","batch_id");--> statement-breakpoint
CREATE INDEX "hr_payroll_payments_org_employee_status_idx" ON "hr_payroll_payments" USING btree ("organization_id","employee_id","payment_status");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_payroll_payslips_org_run_employee_uidx" ON "hr_payroll_payslips" USING btree ("organization_id","run_id","employee_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_payroll_payslips_org_number_uidx" ON "hr_payroll_payslips" USING btree ("organization_id","payslip_number");--> statement-breakpoint
CREATE INDEX "hr_payroll_payslips_org_employee_ess_idx" ON "hr_payroll_payslips" USING btree ("organization_id","employee_id","ess_accessible");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_payroll_run_lines_org_run_employee_uidx" ON "hr_payroll_run_lines" USING btree ("organization_id","run_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_payroll_run_lines_org_cycle_idx" ON "hr_payroll_run_lines" USING btree ("organization_id","cycle_id");--> statement-breakpoint
CREATE INDEX "hr_payroll_run_lines_org_employee_idx" ON "hr_payroll_run_lines" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_payroll_runs_org_cycle_idx" ON "hr_payroll_runs" USING btree ("organization_id","cycle_id","run_status");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_payroll_runs_org_cycle_number_uidx" ON "hr_payroll_runs" USING btree ("organization_id","cycle_id","run_number");--> statement-breakpoint
CREATE INDEX "hr_payroll_validations_org_run_idx" ON "hr_payroll_validations" USING btree ("organization_id","run_id","is_blocking");--> statement-breakpoint
CREATE INDEX "hr_payroll_validations_org_cycle_idx" ON "hr_payroll_validations" USING btree ("organization_id","cycle_id");--> statement-breakpoint
CREATE INDEX "hrm_career_discussion_org_employee_idx" ON "hrm_career_discussion" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hrm_career_discussion_org_employee_date_idx" ON "hrm_career_discussion" USING btree ("organization_id","employee_id","discussion_date");--> statement-breakpoint
CREATE INDEX "hrm_career_discussion_org_next_review_idx" ON "hrm_career_discussion" USING btree ("organization_id","next_review_date");--> statement-breakpoint
CREATE UNIQUE INDEX "hrm_career_path_framework_org_code_uidx" ON "hrm_career_path_framework" USING btree ("organization_id","code");--> statement-breakpoint
CREATE INDEX "hrm_career_path_framework_org_status_idx" ON "hrm_career_path_framework" USING btree ("organization_id","framework_status");--> statement-breakpoint
CREATE INDEX "hrm_career_path_framework_org_path_kind_idx" ON "hrm_career_path_framework" USING btree ("organization_id","path_kind");--> statement-breakpoint
CREATE UNIQUE INDEX "hrm_career_path_stage_org_framework_code_uidx" ON "hrm_career_path_stage" USING btree ("organization_id","framework_id","code");--> statement-breakpoint
CREATE UNIQUE INDEX "hrm_career_path_stage_org_framework_order_uidx" ON "hrm_career_path_stage" USING btree ("organization_id","framework_id","stage_order");--> statement-breakpoint
CREATE INDEX "hrm_career_path_stage_org_framework_idx" ON "hrm_career_path_stage" USING btree ("organization_id","framework_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hrm_development_coach_assignment_org_plan_uidx" ON "hrm_development_coach_assignment" USING btree ("organization_id","plan_id");--> statement-breakpoint
CREATE INDEX "hrm_development_coach_assignment_org_coach_idx" ON "hrm_development_coach_assignment" USING btree ("organization_id","coach_employee_id");--> statement-breakpoint
CREATE INDEX "hrm_development_goal_org_plan_idx" ON "hrm_development_goal" USING btree ("organization_id","plan_id");--> statement-breakpoint
CREATE INDEX "hrm_development_goal_org_plan_status_idx" ON "hrm_development_goal" USING btree ("organization_id","plan_id","goal_status");--> statement-breakpoint
CREATE INDEX "hrm_development_goal_org_plan_type_idx" ON "hrm_development_goal" USING btree ("organization_id","plan_id","goal_type");--> statement-breakpoint
CREATE INDEX "hrm_development_learning_action_org_plan_idx" ON "hrm_development_learning_action" USING btree ("organization_id","plan_id");--> statement-breakpoint
CREATE INDEX "hrm_development_learning_action_org_course_idx" ON "hrm_development_learning_action" USING btree ("organization_id","training_course_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hrm_development_mentor_assignment_org_plan_uidx" ON "hrm_development_mentor_assignment" USING btree ("organization_id","plan_id");--> statement-breakpoint
CREATE INDEX "hrm_development_mentor_assignment_org_mentor_idx" ON "hrm_development_mentor_assignment" USING btree ("organization_id","mentor_employee_id");--> statement-breakpoint
CREATE INDEX "hrm_development_milestone_org_goal_idx" ON "hrm_development_milestone" USING btree ("organization_id","goal_id");--> statement-breakpoint
CREATE INDEX "hrm_development_milestone_org_goal_target_date_idx" ON "hrm_development_milestone" USING btree ("organization_id","goal_id","target_date");--> statement-breakpoint
CREATE INDEX "hrm_development_milestone_org_status_target_date_idx" ON "hrm_development_milestone" USING btree ("organization_id","milestone_status","target_date");--> statement-breakpoint
CREATE UNIQUE INDEX "hrm_development_plan_org_employee_code_uidx" ON "hrm_development_plan" USING btree ("organization_id","employee_id","code");--> statement-breakpoint
CREATE INDEX "hrm_development_plan_org_employee_idx" ON "hrm_development_plan" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hrm_development_plan_org_status_idx" ON "hrm_development_plan" USING btree ("organization_id","plan_status");--> statement-breakpoint
CREATE INDEX "hrm_development_plan_org_target_role_idx" ON "hrm_development_plan" USING btree ("organization_id","target_role_id");--> statement-breakpoint
CREATE INDEX "hrm_development_session_org_plan_idx" ON "hrm_development_session" USING btree ("organization_id","plan_id");--> statement-breakpoint
CREATE INDEX "hrm_development_session_org_plan_date_idx" ON "hrm_development_session" USING btree ("organization_id","plan_id","session_date");--> statement-breakpoint
CREATE INDEX "hrm_development_stretch_assignment_org_plan_idx" ON "hrm_development_stretch_assignment" USING btree ("organization_id","plan_id");--> statement-breakpoint
CREATE INDEX "hrm_development_stretch_assignment_org_status_idx" ON "hrm_development_stretch_assignment" USING btree ("organization_id","assignment_status");--> statement-breakpoint
CREATE UNIQUE INDEX "hrm_employee_career_aspiration_org_employee_uidx" ON "hrm_employee_career_aspiration" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hrm_employee_career_aspiration_org_dept_idx" ON "hrm_employee_career_aspiration" USING btree ("organization_id","preferred_department_id");--> statement-breakpoint
CREATE INDEX "hrm_employee_readiness_snapshot_org_employee_idx" ON "hrm_employee_readiness_snapshot" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hrm_employee_readiness_snapshot_org_employee_computed_idx" ON "hrm_employee_readiness_snapshot" USING btree ("organization_id","employee_id","computed_at");--> statement-breakpoint
CREATE INDEX "hrm_employee_readiness_snapshot_org_level_idx" ON "hrm_employee_readiness_snapshot" USING btree ("organization_id","readiness_level");--> statement-breakpoint
CREATE UNIQUE INDEX "hrm_employee_target_role_org_employee_uidx" ON "hrm_employee_target_role" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hrm_employee_target_role_org_employee_idx" ON "hrm_employee_target_role" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hrm_employee_target_role_org_dept_idx" ON "hrm_employee_target_role" USING btree ("organization_id","department_id");--> statement-breakpoint
CREATE INDEX "hrm_employee_target_role_org_job_family_idx" ON "hrm_employee_target_role" USING btree ("organization_id","job_family");--> statement-breakpoint
CREATE INDEX "hr_mcp_audit_events_org_occurred_idx" ON "hr_mcp_audit_events" USING btree ("organization_id","occurred_at");--> statement-breakpoint
CREATE INDEX "hr_mcp_audit_events_org_country_idx" ON "hr_mcp_audit_events" USING btree ("organization_id","country_config_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_mcp_bank_export_configs_org_country_format_uidx" ON "hr_mcp_bank_export_configs" USING btree ("organization_id","country_config_id","format_code","legal_entity_setup_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_mcp_calendar_periods_org_calendar_code_uidx" ON "hr_mcp_calendar_periods" USING btree ("organization_id","calendar_id","period_code");--> statement-breakpoint
CREATE INDEX "hr_mcp_calendar_periods_org_pay_date_idx" ON "hr_mcp_calendar_periods" USING btree ("organization_id","pay_date");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_mcp_country_configs_org_country_uidx" ON "hr_mcp_country_configs" USING btree ("organization_id","country_code");--> statement-breakpoint
CREATE INDEX "hr_mcp_country_configs_org_active_idx" ON "hr_mcp_country_configs" USING btree ("organization_id","active");--> statement-breakpoint
CREATE INDEX "hr_mcp_cross_country_cost_lines_org_period_idx" ON "hr_mcp_cross_country_cost_lines" USING btree ("organization_id","report_period_id");--> statement-breakpoint
CREATE INDEX "hr_mcp_cross_country_cost_lines_org_country_idx" ON "hr_mcp_cross_country_cost_lines" USING btree ("organization_id","country_config_id","currency_code");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_mcp_cross_country_periods_org_ref_uidx" ON "hr_mcp_cross_country_report_periods" USING btree ("organization_id","period_ref");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_mcp_currency_configs_org_country_entity_uidx" ON "hr_mcp_currency_configs" USING btree ("organization_id","country_config_id","legal_entity_setup_id");--> statement-breakpoint
CREATE INDEX "hr_mcp_currency_configs_org_active_idx" ON "hr_mcp_currency_configs" USING btree ("organization_id","active");--> statement-breakpoint
CREATE INDEX "hr_mcp_employee_classifications_org_employee_idx" ON "hr_mcp_employee_classifications" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_mcp_employee_classifications_org_country_idx" ON "hr_mcp_employee_classifications" USING btree ("organization_id","country_config_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_mcp_employer_rules_org_country_code_version_uidx" ON "hr_mcp_employer_contribution_rules" USING btree ("organization_id","country_config_id","code","rule_version_id");--> statement-breakpoint
CREATE INDEX "hr_mcp_employer_rules_org_country_active_idx" ON "hr_mcp_employer_contribution_rules" USING btree ("organization_id","country_config_id","active");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_mcp_exchange_rates_org_pair_date_uidx" ON "hr_mcp_exchange_rates" USING btree ("organization_id","from_currency_code","to_currency_code","rate_date");--> statement-breakpoint
CREATE INDEX "hr_mcp_exchange_rates_org_rate_date_idx" ON "hr_mcp_exchange_rates" USING btree ("organization_id","rate_date");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_mcp_finalized_snapshots_org_run_uidx" ON "hr_mcp_finalized_rule_snapshots" USING btree ("organization_id","payroll_run_ref");--> statement-breakpoint
CREATE INDEX "hr_mcp_finalized_snapshots_org_country_idx" ON "hr_mcp_finalized_rule_snapshots" USING btree ("organization_id","country_config_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_mcp_leave_treatments_org_country_type_version_uidx" ON "hr_mcp_leave_payroll_treatments" USING btree ("organization_id","country_config_id","leave_type_code","rule_version_id");--> statement-breakpoint
CREATE INDEX "hr_mcp_leave_treatments_org_country_active_idx" ON "hr_mcp_leave_payroll_treatments" USING btree ("organization_id","country_config_id","active");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_mcp_legal_entity_setups_org_country_entity_uidx" ON "hr_mcp_legal_entity_setups" USING btree ("organization_id","country_config_id","legal_entity_code");--> statement-breakpoint
CREATE INDEX "hr_mcp_legal_entity_setups_org_active_idx" ON "hr_mcp_legal_entity_setups" USING btree ("organization_id","active");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_mcp_overtime_rules_org_country_code_version_uidx" ON "hr_mcp_overtime_rules" USING btree ("organization_id","country_config_id","code","rule_version_id");--> statement-breakpoint
CREATE INDEX "hr_mcp_overtime_rules_org_country_active_idx" ON "hr_mcp_overtime_rules" USING btree ("organization_id","country_config_id","active");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_mcp_pay_treatments_org_country_component_version_uidx" ON "hr_mcp_pay_component_treatments" USING btree ("organization_id","country_config_id","pay_component_code","rule_version_id");--> statement-breakpoint
CREATE INDEX "hr_mcp_pay_treatments_org_country_active_idx" ON "hr_mcp_pay_component_treatments" USING btree ("organization_id","country_config_id","active");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_mcp_payroll_calendars_org_country_code_year_uidx" ON "hr_mcp_payroll_calendars" USING btree ("organization_id","country_config_id","code","calendar_year");--> statement-breakpoint
CREATE INDEX "hr_mcp_payroll_calendars_org_country_idx" ON "hr_mcp_payroll_calendars" USING btree ("organization_id","country_config_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_mcp_payslip_fields_org_country_key_uidx" ON "hr_mcp_payslip_field_configs" USING btree ("organization_id","country_config_id","field_key");--> statement-breakpoint
CREATE INDEX "hr_mcp_payslip_fields_org_country_order_idx" ON "hr_mcp_payslip_field_configs" USING btree ("organization_id","country_config_id","display_order");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_mcp_proration_rules_org_country_scenario_version_uidx" ON "hr_mcp_proration_rules" USING btree ("organization_id","country_config_id","scenario","rule_version_id");--> statement-breakpoint
CREATE INDEX "hr_mcp_proration_rules_org_country_active_idx" ON "hr_mcp_proration_rules" USING btree ("organization_id","country_config_id","active");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_mcp_public_holidays_org_country_date_region_uidx" ON "hr_mcp_public_holidays" USING btree ("organization_id","country_config_id","holiday_date","region_code");--> statement-breakpoint
CREATE INDEX "hr_mcp_public_holidays_org_country_date_idx" ON "hr_mcp_public_holidays" USING btree ("organization_id","country_config_id","holiday_date");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_mcp_report_configs_org_country_kind_code_uidx" ON "hr_mcp_report_configs" USING btree ("organization_id","country_config_id","report_kind","code");--> statement-breakpoint
CREATE INDEX "hr_mcp_report_generations_org_config_period_idx" ON "hr_mcp_report_generations" USING btree ("organization_id","report_config_id","period_ref");--> statement-breakpoint
CREATE INDEX "hr_mcp_report_generations_org_status_idx" ON "hr_mcp_report_generations" USING btree ("organization_id","generation_status");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_mcp_rule_versions_org_country_version_uidx" ON "hr_mcp_rule_versions" USING btree ("organization_id","country_config_id","version_number");--> statement-breakpoint
CREATE INDEX "hr_mcp_rule_versions_org_country_status_idx" ON "hr_mcp_rule_versions" USING btree ("organization_id","country_config_id","version_status");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_mcp_statutory_rules_org_country_code_version_uidx" ON "hr_mcp_statutory_contribution_rules" USING btree ("organization_id","country_config_id","code","rule_version_id");--> statement-breakpoint
CREATE INDEX "hr_mcp_statutory_rules_org_country_active_idx" ON "hr_mcp_statutory_contribution_rules" USING btree ("organization_id","country_config_id","active");--> statement-breakpoint
CREATE INDEX "hr_mcp_statutory_deadlines_org_country_due_idx" ON "hr_mcp_statutory_deadlines" USING btree ("organization_id","country_config_id","due_date");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_mcp_tax_rules_org_country_code_version_uidx" ON "hr_mcp_tax_rules" USING btree ("organization_id","country_config_id","code","rule_version_id");--> statement-breakpoint
CREATE INDEX "hr_mcp_tax_rules_org_country_active_idx" ON "hr_mcp_tax_rules" USING btree ("organization_id","country_config_id","active");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_mcp_vendor_export_configs_org_country_vendor_format_uidx" ON "hr_mcp_vendor_export_configs" USING btree ("organization_id","country_config_id","vendor_code","format_code");--> statement-breakpoint
CREATE INDEX "hr_lms_assessment_attempts_org_enrollment_idx" ON "hr_lms_assessment_attempts" USING btree ("organization_id","enrollment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_lms_assessment_attempts_org_enrollment_attempt_uidx" ON "hr_lms_assessment_attempts" USING btree ("organization_id","enrollment_id","attempt_number");--> statement-breakpoint
CREATE INDEX "hr_lms_assignments_org_employee_idx" ON "hr_lms_assignments" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_lms_assignments_org_course_idx" ON "hr_lms_assignments" USING btree ("organization_id","course_id");--> statement-breakpoint
CREATE INDEX "hr_lms_assignments_org_compliance_idx" ON "hr_lms_assignments" USING btree ("organization_id","is_compliance_mandatory");--> statement-breakpoint
CREATE INDEX "hr_lms_audit_events_org_occurred_idx" ON "hr_lms_audit_events" USING btree ("organization_id","occurred_at");--> statement-breakpoint
CREATE INDEX "hr_lms_audit_events_org_action_idx" ON "hr_lms_audit_events" USING btree ("organization_id","action");--> statement-breakpoint
CREATE INDEX "hr_lms_certifications_org_employee_idx" ON "hr_lms_certifications" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_lms_certifications_org_status_idx" ON "hr_lms_certifications" USING btree ("organization_id","certification_status");--> statement-breakpoint
CREATE INDEX "hr_lms_course_content_refs_org_course_idx" ON "hr_lms_course_content_refs" USING btree ("organization_id","course_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_lms_courses_org_code_uidx" ON "hr_lms_courses" USING btree ("organization_id","code");--> statement-breakpoint
CREATE INDEX "hr_lms_courses_org_status_idx" ON "hr_lms_courses" USING btree ("organization_id","course_status");--> statement-breakpoint
CREATE INDEX "hr_lms_courses_org_type_idx" ON "hr_lms_courses" USING btree ("organization_id","course_type");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_lms_enrollments_org_employee_course_uidx" ON "hr_lms_enrollments" USING btree ("organization_id","employee_id","course_id");--> statement-breakpoint
CREATE INDEX "hr_lms_enrollments_org_status_idx" ON "hr_lms_enrollments" USING btree ("organization_id","enrollment_status");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_lms_learning_path_courses_org_path_order_uidx" ON "hr_lms_learning_path_courses" USING btree ("organization_id","path_id","sequence_order");--> statement-breakpoint
CREATE INDEX "hr_lms_learning_path_courses_org_path_idx" ON "hr_lms_learning_path_courses" USING btree ("organization_id","path_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_lms_learning_paths_org_code_uidx" ON "hr_lms_learning_paths" USING btree ("organization_id","code");--> statement-breakpoint
CREATE INDEX "hr_lms_learning_paths_org_kind_idx" ON "hr_lms_learning_paths" USING btree ("organization_id","path_kind");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_lms_progress_org_enrollment_uidx" ON "hr_lms_progress" USING btree ("organization_id","enrollment_id");--> statement-breakpoint
CREATE INDEX "hr_lms_progress_org_employee_status_idx" ON "hr_lms_progress" USING btree ("organization_id","employee_id","progress_status");--> statement-breakpoint
CREATE INDEX "hr_lms_reminders_org_employee_kind_idx" ON "hr_lms_reminders" USING btree ("organization_id","employee_id","reminder_kind");--> statement-breakpoint
CREATE INDEX "hr_csf_assessment_evidence_org_assessment_idx" ON "hr_csf_assessment_evidence" USING btree ("organization_id","assessment_id");--> statement-breakpoint
CREATE INDEX "hr_csf_assessments_org_employee_idx" ON "hr_csf_assessments" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_csf_assessments_org_type_idx" ON "hr_csf_assessments" USING btree ("organization_id","assessment_type");--> statement-breakpoint
CREATE INDEX "hr_csf_assessments_org_comp_profile_idx" ON "hr_csf_assessments" USING btree ("organization_id","competency_profile_id");--> statement-breakpoint
CREATE INDEX "hr_csf_assessments_org_skill_profile_idx" ON "hr_csf_assessments" USING btree ("organization_id","skill_profile_id");--> statement-breakpoint
CREATE INDEX "hr_csf_audit_events_org_occurred_idx" ON "hr_csf_audit_events" USING btree ("organization_id","occurred_at");--> statement-breakpoint
CREATE INDEX "hr_csf_audit_events_org_competency_idx" ON "hr_csf_audit_events" USING btree ("organization_id","competency_id");--> statement-breakpoint
CREATE INDEX "hr_csf_audit_events_org_skill_idx" ON "hr_csf_audit_events" USING btree ("organization_id","skill_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_csf_competencies_org_code_uidx" ON "hr_csf_competencies" USING btree ("organization_id","code");--> statement-breakpoint
CREATE INDEX "hr_csf_competencies_org_category_idx" ON "hr_csf_competencies" USING btree ("organization_id","category");--> statement-breakpoint
CREATE INDEX "hr_csf_competencies_org_status_idx" ON "hr_csf_competencies" USING btree ("organization_id","library_status");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_csf_competency_req_org_comp_scope_uidx" ON "hr_csf_competency_requirements" USING btree ("organization_id","competency_id","scope","scope_ref");--> statement-breakpoint
CREATE INDEX "hr_csf_competency_req_org_scope_idx" ON "hr_csf_competency_requirements" USING btree ("organization_id","scope","scope_ref");--> statement-breakpoint
CREATE INDEX "hr_csf_dev_links_org_rec_idx" ON "hr_csf_development_links" USING btree ("organization_id","recommendation_id");--> statement-breakpoint
CREATE INDEX "hr_csf_dev_links_org_type_idx" ON "hr_csf_development_links" USING btree ("organization_id","link_type");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_csf_dev_links_org_rec_ref_uidx" ON "hr_csf_development_links" USING btree ("organization_id","recommendation_id","link_type","external_ref");--> statement-breakpoint
CREATE INDEX "hr_csf_dev_recs_org_gap_idx" ON "hr_csf_development_recommendations" USING btree ("organization_id","gap_id");--> statement-breakpoint
CREATE INDEX "hr_csf_dev_recs_org_status_idx" ON "hr_csf_development_recommendations" USING btree ("organization_id","recommendation_status");--> statement-breakpoint
CREATE INDEX "hr_csf_dev_recs_org_action_idx" ON "hr_csf_development_recommendations" USING btree ("organization_id","action_type");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_csf_emp_comp_profiles_org_emp_comp_uidx" ON "hr_csf_employee_competency_profiles" USING btree ("organization_id","employee_id","competency_id");--> statement-breakpoint
CREATE INDEX "hr_csf_emp_comp_profiles_org_employee_idx" ON "hr_csf_employee_competency_profiles" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_csf_emp_comp_profiles_org_competency_idx" ON "hr_csf_employee_competency_profiles" USING btree ("organization_id","competency_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_csf_emp_skill_profiles_org_emp_skill_uidx" ON "hr_csf_employee_skill_profiles" USING btree ("organization_id","employee_id","skill_id");--> statement-breakpoint
CREATE INDEX "hr_csf_emp_skill_profiles_org_employee_idx" ON "hr_csf_employee_skill_profiles" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_csf_emp_skill_profiles_org_skill_idx" ON "hr_csf_employee_skill_profiles" USING btree ("organization_id","skill_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_csf_gap_classifications_org_gap_uidx" ON "hr_csf_gap_classifications" USING btree ("organization_id","gap_id");--> statement-breakpoint
CREATE INDEX "hr_csf_gap_classifications_org_severity_idx" ON "hr_csf_gap_classifications" USING btree ("organization_id","severity");--> statement-breakpoint
CREATE INDEX "hr_csf_gap_classifications_org_priority_idx" ON "hr_csf_gap_classifications" USING btree ("organization_id","priority");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_csf_gaps_org_employee_req_uidx" ON "hr_csf_gaps" USING btree ("organization_id","employee_id","gap_kind","requirement_id");--> statement-breakpoint
CREATE INDEX "hr_csf_gaps_org_employee_idx" ON "hr_csf_gaps" USING btree ("organization_id","employee_id");--> statement-breakpoint
CREATE INDEX "hr_csf_gaps_org_skill_idx" ON "hr_csf_gaps" USING btree ("organization_id","skill_id");--> statement-breakpoint
CREATE INDEX "hr_csf_gaps_org_competency_idx" ON "hr_csf_gaps" USING btree ("organization_id","competency_id");--> statement-breakpoint
CREATE INDEX "hr_csf_gaps_org_status_idx" ON "hr_csf_gaps" USING btree ("organization_id","gap_status");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_csf_proficiency_levels_org_scale_order_uidx" ON "hr_csf_proficiency_levels" USING btree ("organization_id","scale_id","level_order");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_csf_proficiency_levels_org_scale_code_uidx" ON "hr_csf_proficiency_levels" USING btree ("organization_id","scale_id","code");--> statement-breakpoint
CREATE INDEX "hr_csf_proficiency_levels_org_scale_idx" ON "hr_csf_proficiency_levels" USING btree ("organization_id","scale_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_csf_proficiency_scales_org_code_uidx" ON "hr_csf_proficiency_scales" USING btree ("organization_id","code");--> statement-breakpoint
CREATE INDEX "hr_csf_proficiency_scales_org_status_idx" ON "hr_csf_proficiency_scales" USING btree ("organization_id","scale_status");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_csf_skill_req_org_skill_scope_uidx" ON "hr_csf_skill_requirements" USING btree ("organization_id","skill_id","scope","scope_ref");--> statement-breakpoint
CREATE INDEX "hr_csf_skill_req_org_scope_idx" ON "hr_csf_skill_requirements" USING btree ("organization_id","scope","scope_ref");--> statement-breakpoint
CREATE INDEX "hr_csf_skill_req_org_class_idx" ON "hr_csf_skill_requirements" USING btree ("organization_id","requirement_class");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_csf_skills_org_code_uidx" ON "hr_csf_skills" USING btree ("organization_id","code");--> statement-breakpoint
CREATE INDEX "hr_csf_skills_org_category_idx" ON "hr_csf_skills" USING btree ("organization_id","category");--> statement-breakpoint
CREATE INDEX "hr_csf_skills_org_status_idx" ON "hr_csf_skills" USING btree ("organization_id","library_status");--> statement-breakpoint
ALTER TABLE "hr_expense_claims" ADD CONSTRAINT "hr_expense_claims_employee_id_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employees"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "hr_expense_audit_events_org_action_idx" ON "hr_expense_audit_events" USING btree ("organization_id","action");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_expense_claims_org_number_uidx" ON "hr_expense_claims" USING btree ("organization_id","claim_number");--> statement-breakpoint
CREATE INDEX "hr_expense_claims_org_category_idx" ON "hr_expense_claims" USING btree ("organization_id","category_code");--> statement-breakpoint
CREATE INDEX "hr_expense_claims_org_department_idx" ON "hr_expense_claims" USING btree ("organization_id","department_id");--> statement-breakpoint
CREATE INDEX "hr_expense_claims_org_cost_center_idx" ON "hr_expense_claims" USING btree ("organization_id","cost_center_code");--> statement-breakpoint
CREATE INDEX "hr_expense_claims_org_project_idx" ON "hr_expense_claims" USING btree ("organization_id","project_code");--> statement-breakpoint
CREATE INDEX "hr_expense_claims_org_duplicate_probe_idx" ON "hr_expense_claims" USING btree ("organization_id","employee_id","primary_expense_date","claim_amount","merchant_name");--> statement-breakpoint
CREATE INDEX "hr_expense_policies_org_active_idx" ON "hr_expense_policies" USING btree ("organization_id","active");--> statement-breakpoint
CREATE INDEX "hr_expense_claims_org_status_idx" ON "hr_expense_claims" USING btree ("organization_id","claim_status");--> statement-breakpoint
CREATE INDEX "hr_expense_eligibility_rules_org_group_cat_idx" ON "hr_expense_eligibility_rules" USING btree ("organization_id","policy_group_code","category_code");--> statement-breakpoint
CREATE UNIQUE INDEX "hr_expense_policy_category_rules_policy_cat_uidx" ON "hr_expense_policy_category_rules" USING btree ("policy_id","category_code");--> statement-breakpoint
ALTER TABLE "hr_expense_audit_events" DROP COLUMN "actor_auth_user_id";--> statement-breakpoint
ALTER TABLE "hr_expense_claims" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "hr_expense_claims" DROP COLUMN "currency_code";--> statement-breakpoint
ALTER TABLE "hr_expense_claims" DROP COLUMN "amount_cents";--> statement-breakpoint
ALTER TABLE "hr_expense_claims" DROP COLUMN "expense_date";--> statement-breakpoint
ALTER TABLE "hr_expense_claims" DROP COLUMN "approval_stage";--> statement-breakpoint
ALTER TABLE "hr_expense_claims" DROP COLUMN "current_approver_auth_user_id";--> statement-breakpoint
ALTER TABLE "hr_expense_claims" DROP COLUMN "approval_snapshot";--> statement-breakpoint
ALTER TABLE "hr_expense_claims" DROP COLUMN "clarification_request";--> statement-breakpoint
ALTER TABLE "hr_expense_claims" DROP COLUMN "decision_note";--> statement-breakpoint
ALTER TABLE "hr_expense_claims" DROP COLUMN "decided_at";--> statement-breakpoint
ALTER TABLE "hr_expense_policies" DROP COLUMN "require_finance_second_approval";--> statement-breakpoint
ALTER TABLE "hr_expense_policies" DROP COLUMN "require_hr_second_approval";--> statement-breakpoint
ALTER TABLE "hr_expense_policies" DROP COLUMN "manager_chain_max_depth";--> statement-breakpoint
ALTER TABLE "hr_expense_eligibility_rules" DROP COLUMN "category";--> statement-breakpoint
ALTER TABLE "hr_expense_policy_category_rules" DROP COLUMN "category";--> statement-breakpoint
DROP TYPE "public"."hr_expense_claim_category";