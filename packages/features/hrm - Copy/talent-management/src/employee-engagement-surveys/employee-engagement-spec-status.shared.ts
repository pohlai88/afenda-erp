import {
  HRM_ENGAGEMENT_SPEC_MAP,
  type HrmEngagementSpecCode,
} from "./employee-engagement-spec-map.shared"

export type HrmEngagementSpecDeliveryStatus =
  | "complete"
  | "partial"
  | "prepared"

/** Slice 1 (HRM-ENG-001–005): survey design and templates. */
export const HRM_ENGAGEMENT_SLICE_1_SPEC_CODES = [
  "HRM-ENG-001",
  "HRM-ENG-002",
  "HRM-ENG-003",
  "HRM-ENG-004",
  "HRM-ENG-005",
] as const satisfies readonly HrmEngagementSpecCode[]

/** Slice 2 (HRM-ENG-006–011, 031, 032): audience, anonymity, schedule. */
export const HRM_ENGAGEMENT_SLICE_2_SPEC_CODES = [
  "HRM-ENG-006",
  "HRM-ENG-007",
  "HRM-ENG-008",
  "HRM-ENG-009",
  "HRM-ENG-010",
  "HRM-ENG-011",
  "HRM-ENG-031",
  "HRM-ENG-032",
] as const satisfies readonly HrmEngagementSpecCode[]

/** Slice 3 (HRM-ENG-012–017): publish, respond, drafts, completion tracking. */
export const HRM_ENGAGEMENT_SLICE_3_SPEC_CODES = [
  "HRM-ENG-012",
  "HRM-ENG-013",
  "HRM-ENG-014",
  "HRM-ENG-015",
  "HRM-ENG-016",
  "HRM-ENG-017",
] as const satisfies readonly HrmEngagementSpecCode[]

/** Slice 4 (HRM-ENG-018–024, 029–033): analytics, overviews, reports, cycle history. */
export const HRM_ENGAGEMENT_SLICE_4_SPEC_CODES = [
  "HRM-ENG-018",
  "HRM-ENG-019",
  "HRM-ENG-020",
  "HRM-ENG-021",
  "HRM-ENG-022",
  "HRM-ENG-023",
  "HRM-ENG-024",
  "HRM-ENG-029",
  "HRM-ENG-030",
  "HRM-ENG-033",
] as const satisfies readonly HrmEngagementSpecCode[]

/** Slice 5 (HRM-ENG-025–028, 034): improvement actions, overdue notify, audit matrix. */
export const HRM_ENGAGEMENT_SLICE_5_SPEC_CODES = [
  "HRM-ENG-025",
  "HRM-ENG-026",
  "HRM-ENG-027",
  "HRM-ENG-028",
  "HRM-ENG-034",
] as const satisfies readonly HrmEngagementSpecCode[]

/**
 * Delivery status per requirement code — aligned with shipped behavior in
 * `lib/features/hrm/talent-management/employee-engagement-surveys/`.
 */
export const HRM_ENGAGEMENT_SPEC_DELIVERY_STATUS: Record<
  HrmEngagementSpecCode,
  HrmEngagementSpecDeliveryStatus
> = {
  "HRM-ENG-001": "complete",
  "HRM-ENG-002": "complete",
  "HRM-ENG-003": "complete",
  "HRM-ENG-004": "complete",
  "HRM-ENG-005": "complete",
  "HRM-ENG-006": "complete",
  "HRM-ENG-007": "complete",
  "HRM-ENG-008": "complete",
  "HRM-ENG-009": "complete",
  "HRM-ENG-010": "complete",
  "HRM-ENG-011": "complete",
  "HRM-ENG-012": "complete",
  "HRM-ENG-013": "complete",
  "HRM-ENG-014": "complete",
  "HRM-ENG-015": "complete",
  "HRM-ENG-016": "complete",
  "HRM-ENG-017": "complete",
  "HRM-ENG-018": "complete",
  "HRM-ENG-019": "complete",
  "HRM-ENG-020": "complete",
  "HRM-ENG-021": "partial",
  "HRM-ENG-022": "complete",
  "HRM-ENG-023": "complete",
  "HRM-ENG-024": "partial",
  "HRM-ENG-025": "complete",
  "HRM-ENG-026": "complete",
  "HRM-ENG-027": "complete",
  "HRM-ENG-028": "complete",
  "HRM-ENG-029": "complete",
  "HRM-ENG-030": "complete",
  "HRM-ENG-031": "complete",
  "HRM-ENG-032": "complete",
  "HRM-ENG-033": "partial",
  "HRM-ENG-034": "partial",
}

export function listHrmEngagementSpecCodesByStatus(
  status: HrmEngagementSpecDeliveryStatus
): HrmEngagementSpecCode[] {
  return (
    Object.keys(HRM_ENGAGEMENT_SPEC_MAP) as HrmEngagementSpecCode[]
  ).filter((code) => HRM_ENGAGEMENT_SPEC_DELIVERY_STATUS[code] === status)
}
