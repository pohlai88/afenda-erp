/** CSF-007/008 — requirement mapping scope validation. */
export type HrCsfRequirementScopeInput = {
  readonly scope: string;
  readonly scopeRef?: string | null;
  readonly jobRole?: string | null;
  readonly jobFamily?: string | null;
  readonly grade?: string | null;
  readonly positionId?: string | null;
  readonly departmentId?: string | null;
  readonly legalEntityCode?: string | null;
};

export class HrCsfScopeError extends Error {
  readonly code: "invalid_requirement_scope";

  constructor(message: string) {
    super(message);
    this.name = "HrCsfScopeError";
    this.code = "invalid_requirement_scope";
  }
}

export function assertHrCsfRequirementScopeFields(
  input: HrCsfRequirementScopeInput,
): void {
  switch (input.scope) {
    case "job_role":
      if (!input.jobRole?.trim()) {
        throw new HrCsfScopeError("job_role scope requires jobRole");
      }
      return;
    case "job_family":
      if (!input.jobFamily?.trim()) {
        throw new HrCsfScopeError("job_family scope requires jobFamily");
      }
      return;
    case "grade":
      if (!input.grade?.trim()) {
        throw new HrCsfScopeError("grade scope requires grade");
      }
      return;
    case "position":
      if (!input.positionId?.trim()) {
        throw new HrCsfScopeError("position scope requires positionId");
      }
      return;
    case "department":
      if (!input.departmentId?.trim()) {
        throw new HrCsfScopeError("department scope requires departmentId");
      }
      return;
    case "legal_entity":
      if (!input.legalEntityCode?.trim()) {
        throw new HrCsfScopeError(
          "legal_entity scope requires legalEntityCode",
        );
      }
      return;
    default:
      throw new HrCsfScopeError(`unknown requirement scope: ${input.scope}`);
  }
}

export function deriveHrCsfRequirementScopeRef(
  input: HrCsfRequirementScopeInput,
): string {
  switch (input.scope) {
    case "job_role":
      return input.jobRole!.trim();
    case "job_family":
      return input.jobFamily!.trim();
    case "grade":
      return input.grade!.trim();
    case "position":
      return input.positionId!.trim();
    case "department":
      return input.departmentId!.trim();
    case "legal_entity":
      return input.legalEntityCode!.trim();
    default:
      return input.scopeRef?.trim() ?? "";
  }
}
