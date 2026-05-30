const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

export class HrBenefitsCommandError extends Error {
  readonly code:
    | "plan_not_found"
    | "plan_archived"
    | "rule_not_found"
    | "window_not_found"
    | "employee_not_found"
    | "employee_ineligible"
    | "open_enrollment_closed"
    | "open_enrollment_plan_not_in_window"
    | "life_event_not_found"
    | "enrollment_not_found"
    | "enrollment_not_pending"
    | "enrollment_not_active"
    | "provider_not_found"
    | "deduction_reference_not_found"
    | "document_not_found"
    | "document_link_not_found"
    | "employee_contribution_missing"
    | "invalid_change_kind"
    | "invalid_window_dates"
    | "invalid_coverage_transition"
    | "coverage_level_not_allowed"
    | "coverage_dates_invalid"
    | "dependents_not_allowed"
    | "dependent_name_required"
    | "dependent_relationship_not_allowed"
    | "dependent_date_of_birth_required"
    | "dependent_not_verified"
    | "plan_dependents_not_supported";

  constructor(code: HrBenefitsCommandError["code"], message?: string) {
    super(message ?? code);
    this.name = "HrBenefitsCommandError";
    this.code = code;
  }
}

export function clampPageSize(limit: number | undefined): number {
  if (limit === undefined || !Number.isFinite(limit)) {
    return DEFAULT_PAGE_SIZE;
  }
  const size = Math.floor(limit);
  if (size < 1) return DEFAULT_PAGE_SIZE;
  return Math.min(size, MAX_PAGE_SIZE);
}

export function buildPaginatedWindow<T>(input: {
  rows: readonly T[];
  pageSize: number;
  offset: number;
  totalCount: number;
}) {
  return {
    rows: input.rows,
    pageSize: input.pageSize,
    totalCount: input.totalCount,
    hasNextPage: input.offset + input.rows.length < input.totalCount,
  };
}

export function normalizeScopeCode(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed.toUpperCase() : null;
}

export function normalizeScopeText(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed || null;
}

export function formatEmployeeLabel(input: {
  preferredName?: string | null;
  legalName: string;
  employeeNumber: string;
}): string {
  const name = input.preferredName?.trim() || input.legalName.trim();
  return `${name} (${input.employeeNumber})`;
}
