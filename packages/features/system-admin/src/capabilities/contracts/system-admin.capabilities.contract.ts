export type CapabilityCoverageVerdict =
  | "covered"
  | "missing_permission"
  | "missing_route"
  | "missing_audit"
  | "missing_docs"
  | "disabled";

export type SystemAdminCapabilityCoverageRow = {
  id: string;
  capability: string;
  module: string;
  route: string;
  routeHref?: string;
  requiredPermission: string;
  status: string;
  accessCoverage: string;
  auditCoverage: string;
  docsCoverage: string;
  verdict: CapabilityCoverageVerdict;
  issues: readonly string[];
};
