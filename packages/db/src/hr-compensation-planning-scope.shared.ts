/** CPM-003 — budget pool scope dimension validation. */
export type HrCompensationBudgetPoolScopeInput = {
  readonly scope: string;
  readonly scopeRef?: string | null;
  readonly legalEntityCode?: string | null;
  readonly departmentId?: string | null;
  readonly businessUnitCode?: string | null;
  readonly grade?: string | null;
  readonly locationCode?: string | null;
  readonly managerEmployeeId?: string | null;
};

export class HrCompensationScopeError extends Error {
  readonly code: "invalid_budget_pool_scope";

  constructor(message: string) {
    super(message);
    this.name = "HrCompensationScopeError";
    this.code = "invalid_budget_pool_scope";
  }
}

export function assertBudgetPoolScopeFields(
  input: HrCompensationBudgetPoolScopeInput,
): void {
  switch (input.scope) {
    case "organization":
      return;
    case "legal_entity":
      if (!input.legalEntityCode?.trim()) {
        throw new HrCompensationScopeError(
          "legal_entity scope requires legalEntityCode",
        );
      }
      return;
    case "department":
      if (!input.departmentId?.trim()) {
        throw new HrCompensationScopeError(
          "department scope requires departmentId",
        );
      }
      return;
    case "business_unit":
      if (!input.businessUnitCode?.trim()) {
        throw new HrCompensationScopeError(
          "business_unit scope requires businessUnitCode",
        );
      }
      return;
    case "grade":
      if (!input.grade?.trim()) {
        throw new HrCompensationScopeError("grade scope requires grade");
      }
      return;
    case "location":
      if (!input.locationCode?.trim()) {
        throw new HrCompensationScopeError(
          "location scope requires locationCode",
        );
      }
      return;
    case "manager_group":
      if (!input.managerEmployeeId?.trim()) {
        throw new HrCompensationScopeError(
          "manager_group scope requires managerEmployeeId",
        );
      }
      return;
    default:
      throw new HrCompensationScopeError(`unknown budget pool scope: ${input.scope}`);
  }
}

export function deriveBudgetPoolScopeRef(
  input: HrCompensationBudgetPoolScopeInput,
): string | null {
  switch (input.scope) {
    case "organization":
      return input.scopeRef?.trim() ?? "organization";
    case "legal_entity":
      return input.legalEntityCode?.trim() ?? null;
    case "department":
      return input.departmentId?.trim() ?? null;
    case "business_unit":
      return input.businessUnitCode?.trim() ?? null;
    case "grade":
      return input.grade?.trim() ?? null;
    case "location":
      return input.locationCode?.trim() ?? null;
    case "manager_group":
      return input.managerEmployeeId?.trim() ?? null;
    default:
      return input.scopeRef?.trim() ?? null;
  }
}

/** CPM-001 — allowed cycle status transitions (terminal states are immutable). */
const TERMINAL_CYCLE_STATUSES = new Set(["closed", "cancelled"]);

export function assertHrCompensationCycleStatusTransition(
  currentStatus: string,
  nextStatus: string,
): void {
  if (currentStatus === nextStatus) {
    return;
  }

  if (TERMINAL_CYCLE_STATUSES.has(currentStatus)) {
    throw new Error(
      `cannot transition compensation cycle from ${currentStatus} to ${nextStatus}`,
    );
  }
}
