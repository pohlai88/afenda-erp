export type CapabilityCoverageVerdict =
  | "covered"
  | "missing_permission"
  | "missing_route"
  | "missing_audit"
  | "missing_docs"
  | "disabled";

export type SystemAdminCapabilityAvailability = "enabled" | "disabled" | "preview";

export type SystemAdminCapabilityReadinessVerdict =
  | "ready"
  | "warning"
  | "blocked";

export type SystemAdminCapabilityCoverageRow = {
  id: string;
  capability: string;
  module: string;
  route: string;
  routeHref?: string;
  requiredPermission: string;
  availability: SystemAdminCapabilityAvailability;
  accessCoverage: string;
  auditCoverage: string;
  docsCoverage: string;
  coverageVerdict: CapabilityCoverageVerdict;
  readinessVerdict: SystemAdminCapabilityReadinessVerdict;
  issues: readonly string[];
};
