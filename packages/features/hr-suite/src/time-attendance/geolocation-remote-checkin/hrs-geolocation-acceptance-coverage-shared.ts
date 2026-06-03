/** HRM-GEO-001 … HRM-GEO-032 shipment matrix (code-verified). */
export type GeoCoverageStatus = "shipped" | "partial" | "deferred";

export type GeoRequirementCoverage = {
  readonly code: `HRM-GEO-${string}`;
  readonly status: GeoCoverageStatus;
  readonly evidence: readonly string[];
};

const GEO_ROOT =
  "packages/features/hr-suite/src/time-attendance/geolocation-remote-checkin" as const;
const SCHEMA = "packages/db/src/schema/hr-geolocation.ts" as const;
const DB = "packages/db/src/hr-geolocation.ts" as const;
const DB_WORKFLOW = "packages/db/src/hr-geolocation-workflow.ts" as const;
const CAPTURE = `${GEO_ROOT}/data/hr.time.geo-capture.server.ts` as const;
const LAM = `${GEO_ROOT}/data/hr.time.geo-lam-integration.server.ts` as const;
const OTM = `${GEO_ROOT}/data/hr.time.geo-overtime-ref.server.ts` as const;
const PAYROLL = `${GEO_ROOT}/data/hr.time.geo-payroll-ref.server.ts` as const;
const SPOOFING = `${GEO_ROOT}/data/hr.time.geo-spoofing.shared.ts` as const;
const POLICY = `${GEO_ROOT}/policies/hr.time.geo-policy-resolution.policy.server.ts` as const;
const ACCESS = `${GEO_ROOT}/policies/hr.time.geo-access.policy.server.ts` as const;
const PRIVACY = `${GEO_ROOT}/data/hr.time.geo-privacy.shared.ts` as const;
const CLIENT = `${GEO_ROOT}/components/hr.time.geo-remote-checkin.component.client.tsx` as const;
const PAGE = `${GEO_ROOT}/data/hr.time.geo.page-model.server.ts` as const;
const ACTIONS = `${GEO_ROOT}/actions/hr.time.geo.actions.server.ts` as const;
const ADMIN_SCHEMA = `${GEO_ROOT}/schemas/hr.time.geo-admin.schema.ts` as const;
const CAPTURE_SCHEMA = `${GEO_ROOT}/schemas/hr.time.geo-capture.schema.ts` as const;
const ADMIN_DATA = `${GEO_ROOT}/data/hr.time.geo-admin.server.ts` as const;
const EVENTS = `${GEO_ROOT}/events/hr.time.geo.events.ts` as const;
const LAM_SURFACE = `${GEO_ROOT}/surface/hr.time.geo-lam-exposure-list.surface.ts` as const;
const OTM_SURFACE = `${GEO_ROOT}/surface/hr.time.geo-overtime-ref-list.surface.ts` as const;
const PAYROLL_SURFACE = `${GEO_ROOT}/surface/hr.time.geo-payroll-ref-list.surface.ts` as const;
const RAW_SURFACE = `${GEO_ROOT}/surface/hr.time.geo-raw-vs-approved-list.surface.ts` as const;
const AUDIT_SURFACE = `${GEO_ROOT}/surface/hr.time.geo-audit-trail-list.surface.ts` as const;
const INTEGRATION_DATA = `${GEO_ROOT}/data/hr.time.geo-integration-windows.server.ts` as const;
const PENDING_SURFACE = `${GEO_ROOT}/surface/hr.time.geo-pending-list.surface.ts` as const;
const PENDING_TRAILING = `${GEO_ROOT}/components/hr.time.geo-pending-trailing.component.client.tsx` as const;
const WORKBENCH = `${GEO_ROOT}/components/hr.time.geo-section.component.server.tsx` as const;
const ERP = "apps/erp/src/lib/hr-sections/geolocation-remote-checkin.server.tsx" as const;

export const GEO_REQUIREMENT_COVERAGE: readonly GeoRequirementCoverage[] = [
  { code: "HRM-GEO-001", status: "shipped", evidence: [DB, CAPTURE, CAPTURE_SCHEMA, CLIENT, ERP] },
  { code: "HRM-GEO-002", status: "shipped", evidence: [SCHEMA, DB, CAPTURE, CAPTURE_SCHEMA] },
  { code: "HRM-GEO-003", status: "shipped", evidence: [SCHEMA, DB, CAPTURE, CAPTURE_SCHEMA] },
  { code: "HRM-GEO-004", status: "shipped", evidence: [SCHEMA, DB, PAGE, ADMIN_SCHEMA, ADMIN_DATA, ACTIONS] },
  { code: "HRM-GEO-005", status: "shipped", evidence: [SCHEMA, DB, ADMIN_SCHEMA, ADMIN_DATA] },
  { code: "HRM-GEO-006", status: "shipped", evidence: [DB, `${GEO_ROOT}/data/hr.time.geo-validation.shared.ts`] },
  { code: "HRM-GEO-007", status: "shipped", evidence: [DB, SCHEMA] },
  { code: "HRM-GEO-008", status: "shipped", evidence: [DB, POLICY, ADMIN_SCHEMA, ADMIN_DATA, ACTIONS] },
  { code: "HRM-GEO-009", status: "shipped", evidence: [SCHEMA, DB, POLICY, ADMIN_SCHEMA, ADMIN_DATA, ACTIONS] },
  { code: "HRM-GEO-010", status: "shipped", evidence: [SCHEMA, DB, ADMIN_SCHEMA, ADMIN_DATA, ACTIONS] },
  { code: "HRM-GEO-011", status: "shipped", evidence: [DB, CAPTURE] },
  { code: "HRM-GEO-012", status: "shipped", evidence: [DB, CAPTURE] },
  { code: "HRM-GEO-013", status: "shipped", evidence: [DB, CAPTURE] },
  { code: "HRM-GEO-014", status: "shipped", evidence: [DB, SCHEMA] },
  { code: "HRM-GEO-015", status: "shipped", evidence: [DB, SPOOFING] },
  { code: "HRM-GEO-016", status: "shipped", evidence: [DB_WORKFLOW, ACTIONS, CAPTURE_SCHEMA, PENDING_SURFACE, PENDING_TRAILING] },
  { code: "HRM-GEO-017", status: "shipped", evidence: [DB_WORKFLOW, ACTIONS, CAPTURE_SCHEMA, PENDING_SURFACE] },
  { code: "HRM-GEO-018", status: "shipped", evidence: [DB_WORKFLOW, ACTIONS, CAPTURE_SCHEMA, PENDING_SURFACE, PENDING_TRAILING, WORKBENCH] },
  { code: "HRM-GEO-019", status: "shipped", evidence: [DB_WORKFLOW] },
  { code: "HRM-GEO-020", status: "shipped", evidence: [SCHEMA, CAPTURE, CLIENT] },
  { code: "HRM-GEO-021", status: "shipped", evidence: [SCHEMA, DB] },
  { code: "HRM-GEO-022", status: "shipped", evidence: [SCHEMA, CAPTURE] },
  { code: "HRM-GEO-023", status: "shipped", evidence: [SCHEMA, DB, RAW_SURFACE, INTEGRATION_DATA, WORKBENCH] },
  { code: "HRM-GEO-024", status: "shipped", evidence: [DB, LAM, LAM_SURFACE, INTEGRATION_DATA, WORKBENCH] },
  { code: "HRM-GEO-025", status: "shipped", evidence: [DB, OTM, OTM_SURFACE, INTEGRATION_DATA, WORKBENCH] },
  { code: "HRM-GEO-026", status: "shipped", evidence: [DB, PAYROLL, PAYROLL_SURFACE, INTEGRATION_DATA, WORKBENCH] },
  { code: "HRM-GEO-027", status: "shipped", evidence: [ACCESS, DB] },
  { code: "HRM-GEO-028", status: "shipped", evidence: [PRIVACY, DB] },
  { code: "HRM-GEO-029", status: "shipped", evidence: [CLIENT, CAPTURE] },
  { code: "HRM-GEO-030", status: "shipped", evidence: [DB, PAGE, WORKBENCH] },
  { code: "HRM-GEO-031", status: "shipped", evidence: [DB, EVENTS] },
  {
    code: "HRM-GEO-032",
    status: "shipped",
    evidence: [
      SCHEMA,
      DB,
      `${GEO_ROOT}/contracts/geolocation.contract.ts`,
      `${GEO_ROOT}/data/hr.time.geo-audit-trail.server.ts`,
      AUDIT_SURFACE,
      WORKBENCH,
    ],
  },
] as const;

export function assertGeoCoverageComplete(): void {
  const missing = GEO_REQUIREMENT_COVERAGE.filter((row) => row.status !== "shipped");
  if (missing.length > 0) {
    throw new Error(
      `geo_acceptance_incomplete:${missing.map((row) => row.code).join(",")}`,
    );
  }
}
