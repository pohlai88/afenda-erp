export class HrComplianceOrganizationScopeError extends Error {
  constructor() {
    super("Organization scope mismatch.");
    this.name = "HrComplianceOrganizationScopeError";
  }
}

/** HRM-CMP-024 — raised when a sensitive compliance mutation lacks authorization. */
export class HrComplianceSensitiveAccessError extends Error {
  constructor() {
    super("Sensitive compliance records require additional authorization.");
    this.name = "HrComplianceSensitiveAccessError";
  }
}

export function assertOrganizationScope(
  sessionOrganizationId: string,
  requestedOrganizationId: string,
): void {
  if (sessionOrganizationId === requestedOrganizationId) {
    return;
  }

  throw new HrComplianceOrganizationScopeError();
}
