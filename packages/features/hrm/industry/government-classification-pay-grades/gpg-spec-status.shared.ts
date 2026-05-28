import { HRM_GPG_SPEC_MAP, type HrmGpgSpecCode } from "./gpg-spec-map.shared"

export type HrmGpgSpecDeliveryStatus = "complete" | "partial" | "prepared"

/** Slice 0 — audit contract + registry scaffold (HRM-GPG-031). */
export const HRM_GPG_SLICE_0_SPEC_CODES = [
  "HRM-GPG-031",
] as const satisfies readonly HrmGpgSpecCode[]

/** Slice 1 — classification and pay structure masters (HRM-GPG-001–008). */
export const HRM_GPG_SLICE_1_SPEC_CODES = [
  "HRM-GPG-001",
  "HRM-GPG-002",
  "HRM-GPG-003",
  "HRM-GPG-004",
  "HRM-GPG-005",
  "HRM-GPG-006",
  "HRM-GPG-007",
  "HRM-GPG-008",
] as const satisfies readonly HrmGpgSpecCode[]

/** Slice 2 — employee assignment and locality (HRM-GPG-009–012). */
export const HRM_GPG_SLICE_2_SPEC_CODES = [
  "HRM-GPG-009",
  "HRM-GPG-010",
  "HRM-GPG-011",
  "HRM-GPG-012",
] as const satisfies readonly HrmGpgSpecCode[]

/** Slice 3 — step increase eligibility and processing (HRM-GPG-013–016). */
export const HRM_GPG_SLICE_3_SPEC_CODES = [
  "HRM-GPG-013",
  "HRM-GPG-014",
  "HRM-GPG-015",
  "HRM-GPG-016",
] as const satisfies readonly HrmGpgSpecCode[]

/** Slice 4 — grade movements and validation (HRM-GPG-017–024, 022–023). */
export const HRM_GPG_SLICE_4_SPEC_CODES = [
  "HRM-GPG-017",
  "HRM-GPG-018",
  "HRM-GPG-019",
  "HRM-GPG-020",
  "HRM-GPG-021",
  "HRM-GPG-022",
  "HRM-GPG-023",
  "HRM-GPG-024",
] as const satisfies readonly HrmGpgSpecCode[]

/** Slice 5 — history, integrations, reports, audit (HRM-GPG-025–031, 028). */
export const HRM_GPG_SLICE_5_SPEC_CODES = [
  "HRM-GPG-025",
  "HRM-GPG-026",
  "HRM-GPG-027",
  "HRM-GPG-028",
  "HRM-GPG-029",
  "HRM-GPG-030",
  "HRM-GPG-031",
] as const satisfies readonly HrmGpgSpecCode[]

/**
 * Delivery status per requirement code — aligned with shipped behavior in
 * `government-classification-pay-grades/`.
 */
const SLICE_1_COMPLETE = "complete" as const satisfies HrmGpgSpecDeliveryStatus
const SLICE_2_COMPLETE = "complete" as const satisfies HrmGpgSpecDeliveryStatus
const SLICE_3_COMPLETE = "complete" as const satisfies HrmGpgSpecDeliveryStatus
const SLICE_4_COMPLETE = "complete" as const satisfies HrmGpgSpecDeliveryStatus
const SLICE_5_COMPLETE = "complete" as const satisfies HrmGpgSpecDeliveryStatus

export const HRM_GPG_SPEC_DELIVERY_STATUS: Record<
  HrmGpgSpecCode,
  HrmGpgSpecDeliveryStatus
> = {
  "HRM-GPG-001": SLICE_1_COMPLETE,
  "HRM-GPG-002": SLICE_1_COMPLETE,
  "HRM-GPG-003": SLICE_1_COMPLETE,
  "HRM-GPG-004": SLICE_1_COMPLETE,
  "HRM-GPG-005": SLICE_1_COMPLETE,
  "HRM-GPG-006": SLICE_1_COMPLETE,
  "HRM-GPG-007": SLICE_1_COMPLETE,
  "HRM-GPG-008": SLICE_1_COMPLETE,
  "HRM-GPG-009": SLICE_2_COMPLETE,
  "HRM-GPG-010": SLICE_2_COMPLETE,
  "HRM-GPG-011": SLICE_2_COMPLETE,
  "HRM-GPG-012": SLICE_2_COMPLETE,
  "HRM-GPG-013": SLICE_3_COMPLETE,
  "HRM-GPG-014": SLICE_3_COMPLETE,
  "HRM-GPG-015": SLICE_3_COMPLETE,
  "HRM-GPG-016": SLICE_3_COMPLETE,
  "HRM-GPG-017": SLICE_4_COMPLETE,
  "HRM-GPG-018": SLICE_4_COMPLETE,
  "HRM-GPG-019": SLICE_4_COMPLETE,
  "HRM-GPG-020": SLICE_4_COMPLETE,
  "HRM-GPG-021": SLICE_4_COMPLETE,
  "HRM-GPG-022": SLICE_4_COMPLETE,
  "HRM-GPG-023": SLICE_4_COMPLETE,
  "HRM-GPG-024": SLICE_4_COMPLETE,
  "HRM-GPG-025": SLICE_5_COMPLETE,
  "HRM-GPG-026": SLICE_5_COMPLETE,
  "HRM-GPG-027": SLICE_5_COMPLETE,
  "HRM-GPG-028": SLICE_5_COMPLETE,
  "HRM-GPG-029": SLICE_5_COMPLETE,
  "HRM-GPG-030": SLICE_5_COMPLETE,
  "HRM-GPG-031": SLICE_5_COMPLETE,
}

export function listHrmGpgSpecDeliveryRows(): ReadonlyArray<{
  code: HrmGpgSpecCode
  area: (typeof HRM_GPG_SPEC_MAP)[HrmGpgSpecCode]
  status: HrmGpgSpecDeliveryStatus
}> {
  return (Object.keys(HRM_GPG_SPEC_MAP) as HrmGpgSpecCode[]).map((code) => ({
    code,
    area: HRM_GPG_SPEC_MAP[code],
    status: HRM_GPG_SPEC_DELIVERY_STATUS[code],
  }))
}
