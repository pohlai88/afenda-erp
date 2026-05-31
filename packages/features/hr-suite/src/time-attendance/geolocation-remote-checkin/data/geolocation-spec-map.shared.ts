/** Stable implementation area slug per HRM-GEO requirement code. */
export const GEO_SPEC_MAP = {
  "HRM-GEO-001": "remote-checkin-capture",
  "HRM-GEO-002": "remote-checkin-capture",
  "HRM-GEO-003": "remote-checkin-capture",
  "HRM-GEO-004": "geofence-administration",
  "HRM-GEO-005": "geofence-administration",
  "HRM-GEO-006": "geofence-validation",
  "HRM-GEO-007": "shift-time-validation",
  "HRM-GEO-008": "eligibility-policy",
  "HRM-GEO-009": "eligibility-policy",
  "HRM-GEO-010": "device-verification",
  "HRM-GEO-011": "device-verification",
  "HRM-GEO-012": "gps-quality-detection",
  "HRM-GEO-013": "geofence-validation",
  "HRM-GEO-014": "gps-quality-detection",
  "HRM-GEO-015": "spoofing-detection",
  "HRM-GEO-016": "exception-workflow",
  "HRM-GEO-017": "exception-workflow",
  "HRM-GEO-018": "exception-workflow",
  "HRM-GEO-019": "exception-workflow",
  "HRM-GEO-020": "selfie-verification",
  "HRM-GEO-021": "field-multi-site",
  "HRM-GEO-022": "site-references",
  "HRM-GEO-023": "raw-outcome-separation",
  "HRM-GEO-024": "lam-integration",
  "HRM-GEO-025": "overtime-integration",
  "HRM-GEO-026": "payroll-integration",
  "HRM-GEO-027": "access-control",
  "HRM-GEO-028": "privacy-masking",
  "HRM-GEO-029": "event-only-capture",
  "HRM-GEO-030": "reporting",
  "HRM-GEO-031": "notifications",
  "HRM-GEO-032": "audit-trail",
} as const satisfies Record<`HRM-GEO-${string}`, string>;

export type HrmGeoRequirementCode = keyof typeof GEO_SPEC_MAP;

export const GEO_REQUIREMENT_CODES = Object.keys(GEO_SPEC_MAP) as HrmGeoRequirementCode[];

export function geoAreaForRequirement(code: HrmGeoRequirementCode): string {
  return GEO_SPEC_MAP[code];
}
