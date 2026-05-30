export type RlsEvaluationItem = {
  table: string;
  tenantColumn: string;
  recommendation: "candidate" | "blocked";
  reason: string;
};

export const rlsEvaluation: readonly RlsEvaluationItem[] = [
  {
    table: "organizations",
    tenantColumn: "id",
    recommendation: "candidate",
    reason:
      "Organization root records can be filtered by the active organization identifier.",
  },
  {
    table: "organization_memberships",
    tenantColumn: "organization_id",
    recommendation: "candidate",
    reason:
      "Membership rows are organization scoped and join to the tenant root.",
  },
  {
    table: "erp_module_records",
    tenantColumn: "organization_id",
    recommendation: "candidate",
    reason: "Business records already carry an organization foreign key.",
  },
  {
    table: "hr_employees",
    tenantColumn: "organization_id",
    recommendation: "candidate",
    reason: "Workforce master rows are organization scoped.",
  },
  {
    table: "hr_departments",
    tenantColumn: "organization_id",
    recommendation: "candidate",
    reason: "Org units are organization scoped.",
  },
  {
    table: "hr_positions",
    tenantColumn: "organization_id",
    recommendation: "candidate",
    reason: "Position catalog rows are organization scoped.",
  },
  {
    table: "hr_employee_assignments",
    tenantColumn: "organization_id",
    recommendation: "candidate",
    reason: "Effective-dated placement rows are organization scoped.",
  },
  {
    table: "hr_employee_documents",
    tenantColumn: "organization_id",
    recommendation: "candidate",
    reason: "Employee document vault rows are organization scoped.",
  },
  {
    table: "hr_lifecycle_events",
    tenantColumn: "organization_id",
    recommendation: "candidate",
    reason: "Append-only lifecycle event ledger rows are organization scoped.",
  },
  {
    table: "hr_lifecycle_transitions",
    tenantColumn: "organization_id",
    recommendation: "candidate",
    reason: "Effective-dated lifecycle transition queue rows are organization scoped.",
  },
  {
    table: "hr_offboarding_cases",
    tenantColumn: "organization_id",
    recommendation: "candidate",
    reason: "Employee offboarding case rows are organization scoped.",
  },
  {
    table: "erp_work_items",
    tenantColumn: "organization_id",
    recommendation: "candidate",
    reason: "Workflow rows already carry an organization foreign key.",
  },
  {
    table: "erp_documents",
    tenantColumn: "organization_id",
    recommendation: "candidate",
    reason: "Document registry rows already carry an organization foreign key.",
  },
  {
    table: "ai_usage_events",
    tenantColumn: "organization_id",
    recommendation: "candidate",
    reason: "AI usage events are logged with tenant and user ownership.",
  },
  {
    table: "ai_document_extractions",
    tenantColumn: "organization_id",
    recommendation: "candidate",
    reason: "Extraction outputs are tenant scoped and reviewable.",
  },
  {
    table: "permissions",
    tenantColumn: "none",
    recommendation: "blocked",
    reason:
      "Permission catalog is global reference data and should not use tenant RLS.",
  },
];

export function getRlsEvaluationSummary() {
  const candidates = rlsEvaluation.filter(
    (item) => item.recommendation === "candidate",
  );

  return {
    candidateTables: candidates.length,
    blockedTables: rlsEvaluation.length - candidates.length,
    nextStep:
      "RLS policies are enabled; tenant queries must run through runWithOrganizationContext or runWithAuthUserContext.",
    items: rlsEvaluation,
  };
}
