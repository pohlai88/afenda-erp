import { HRM_LMS_SPEC_MAP, type HrmLmsSpecCode } from "./lms-spec-map.shared"

export type HrmLmsSpecDeliveryStatus = "complete" | "partial" | "prepared"

/** Slice 0 — audit contract + registry scaffold (HRM-LMS-030). */
export const HRM_LMS_SLICE_0_SPEC_CODES = [
  "HRM-LMS-030",
] as const satisfies readonly HrmLmsSpecCode[]

/** Slice 1 — course catalog and content refs (HRM-LMS-001–005). */
export const HRM_LMS_SLICE_1_SPEC_CODES = [
  "HRM-LMS-001",
  "HRM-LMS-002",
  "HRM-LMS-003",
  "HRM-LMS-004",
  "HRM-LMS-005",
] as const satisfies readonly HrmLmsSpecCode[]

/** Slice 2 — learning paths (HRM-LMS-006–007). */
export const HRM_LMS_SLICE_2_SPEC_CODES = [
  "HRM-LMS-006",
  "HRM-LMS-007",
] as const satisfies readonly HrmLmsSpecCode[]

/** Slice 3 — assignment and enrollment (HRM-LMS-008–011, 020, 028 assign/enroll). */
export const HRM_LMS_SLICE_3_SPEC_CODES = [
  "HRM-LMS-008",
  "HRM-LMS-009",
  "HRM-LMS-010",
  "HRM-LMS-011",
  "HRM-LMS-020",
  "HRM-LMS-028",
] as const satisfies readonly HrmLmsSpecCode[]

/** Slice 4 — progress, assessment, certification, reminders (HRM-LMS-012–019). */
export const HRM_LMS_SLICE_4_SPEC_CODES = [
  "HRM-LMS-012",
  "HRM-LMS-013",
  "HRM-LMS-014",
  "HRM-LMS-015",
  "HRM-LMS-016",
  "HRM-LMS-017",
  "HRM-LMS-018",
  "HRM-LMS-019",
] as const satisfies readonly HrmLmsSpecCode[]

/** Slice 5 — integrations, overviews, reports, history, audit (HRM-LMS-021–030). */
export const HRM_LMS_SLICE_5_SPEC_CODES = [
  "HRM-LMS-021",
  "HRM-LMS-022",
  "HRM-LMS-023",
  "HRM-LMS-024",
  "HRM-LMS-025",
  "HRM-LMS-026",
  "HRM-LMS-027",
  "HRM-LMS-028",
  "HRM-LMS-029",
  "HRM-LMS-030",
] as const satisfies readonly HrmLmsSpecCode[]

const SLICE_1_COMPLETE = "complete" as const satisfies HrmLmsSpecDeliveryStatus
const SLICE_2_COMPLETE = "complete" as const satisfies HrmLmsSpecDeliveryStatus
const SLICE_3_COMPLETE = "complete" as const satisfies HrmLmsSpecDeliveryStatus
const SLICE_4_COMPLETE = "complete" as const satisfies HrmLmsSpecDeliveryStatus
const SLICE_5_COMPLETE = "complete" as const satisfies HrmLmsSpecDeliveryStatus

export const HRM_LMS_SPEC_DELIVERY_STATUS: Record<
  HrmLmsSpecCode,
  HrmLmsSpecDeliveryStatus
> = {
  "HRM-LMS-001": SLICE_1_COMPLETE,
  "HRM-LMS-002": SLICE_1_COMPLETE,
  "HRM-LMS-003": SLICE_1_COMPLETE,
  "HRM-LMS-004": SLICE_1_COMPLETE,
  "HRM-LMS-005": SLICE_1_COMPLETE,
  "HRM-LMS-006": SLICE_2_COMPLETE,
  "HRM-LMS-007": SLICE_2_COMPLETE,
  "HRM-LMS-008": SLICE_3_COMPLETE,
  "HRM-LMS-009": SLICE_3_COMPLETE,
  "HRM-LMS-010": SLICE_3_COMPLETE,
  "HRM-LMS-011": SLICE_3_COMPLETE,
  "HRM-LMS-012": SLICE_4_COMPLETE,
  "HRM-LMS-013": SLICE_4_COMPLETE,
  "HRM-LMS-014": SLICE_4_COMPLETE,
  "HRM-LMS-015": SLICE_4_COMPLETE,
  "HRM-LMS-016": SLICE_4_COMPLETE,
  "HRM-LMS-017": SLICE_4_COMPLETE,
  "HRM-LMS-018": SLICE_4_COMPLETE,
  "HRM-LMS-019": SLICE_4_COMPLETE,
  "HRM-LMS-020": SLICE_3_COMPLETE,
  "HRM-LMS-021": SLICE_5_COMPLETE,
  "HRM-LMS-022": SLICE_5_COMPLETE,
  "HRM-LMS-023": SLICE_5_COMPLETE,
  "HRM-LMS-024": SLICE_5_COMPLETE,
  "HRM-LMS-025": SLICE_5_COMPLETE,
  "HRM-LMS-026": SLICE_5_COMPLETE,
  "HRM-LMS-027": SLICE_5_COMPLETE,
  "HRM-LMS-028": SLICE_5_COMPLETE,
  "HRM-LMS-029": SLICE_5_COMPLETE,
  "HRM-LMS-030": SLICE_5_COMPLETE,
}

export function listHrmLmsSpecDeliveryRows(): ReadonlyArray<{
  code: HrmLmsSpecCode
  area: (typeof HRM_LMS_SPEC_MAP)[HrmLmsSpecCode]
  status: HrmLmsSpecDeliveryStatus
}> {
  return (Object.keys(HRM_LMS_SPEC_MAP) as HrmLmsSpecCode[]).map((code) => ({
    code,
    area: HRM_LMS_SPEC_MAP[code],
    status: HRM_LMS_SPEC_DELIVERY_STATUS[code],
  }))
}
