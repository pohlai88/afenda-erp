export class HrComplianceOrganizationScopeError extends Error {
  constructor() {
    super("Organization scope mismatch.");
    this.name = "HrComplianceOrganizationScopeError";
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
