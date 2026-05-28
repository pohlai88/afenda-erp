import { HRM_MSC_SPEC_MAP, type HrmMscSpecCode } from "./msc-spec-map.shared"

export type HrmMscSpecDeliveryStatus = "complete" | "partial" | "prepared"

/** Slice 1 (HRM-MSC-001–008): requirements, obligations, training, certifications. */
export const HRM_MSC_SLICE_1_SPEC_CODES = [
  "HRM-MSC-001",
  "HRM-MSC-002",
  "HRM-MSC-003",
  "HRM-MSC-005",
  "HRM-MSC-006",
  "HRM-MSC-007",
  "HRM-MSC-008",
] as const satisfies readonly HrmMscSpecCode[]

/** Slice 2 (HRM-MSC-004, 009–011): regulatory refs, flags, restrictions. */
export const HRM_MSC_SLICE_2_SPEC_CODES = [
  "HRM-MSC-004",
  "HRM-MSC-009",
  "HRM-MSC-010",
  "HRM-MSC-011",
] as const satisfies readonly HrmMscSpecCode[]

/** Slice 3 (HRM-MSC-012–015): hazard assessments. */
export const HRM_MSC_SLICE_3_SPEC_CODES = [
  "HRM-MSC-012",
  "HRM-MSC-013",
  "HRM-MSC-014",
  "HRM-MSC-015",
] as const satisfies readonly HrmMscSpecCode[]

/** Slice 4 (HRM-MSC-016–022): incidents and corrective actions. */
export const HRM_MSC_SLICE_4_SPEC_CODES = [
  "HRM-MSC-016",
  "HRM-MSC-017",
  "HRM-MSC-018",
  "HRM-MSC-019",
  "HRM-MSC-020",
  "HRM-MSC-021",
  "HRM-MSC-022",
] as const satisfies readonly HrmMscSpecCode[]

/** Slice 5 (HRM-MSC-023–031): notifications, integrations, overview, audit. */
export const HRM_MSC_SLICE_5_SPEC_CODES = [
  "HRM-MSC-023",
  "HRM-MSC-024",
  "HRM-MSC-025",
  "HRM-MSC-026",
  "HRM-MSC-027",
  "HRM-MSC-028",
  "HRM-MSC-029",
  "HRM-MSC-030",
  "HRM-MSC-031",
] as const satisfies readonly HrmMscSpecCode[]

export const HRM_MSC_SPEC_DELIVERY_STATUS: Record<
  HrmMscSpecCode,
  HrmMscSpecDeliveryStatus
> = {
  "HRM-MSC-001": "complete",
  "HRM-MSC-002": "complete",
  "HRM-MSC-003": "complete",
  "HRM-MSC-004": "complete",
  "HRM-MSC-005": "complete",
  "HRM-MSC-006": "complete",
  "HRM-MSC-007": "complete",
  "HRM-MSC-008": "complete",
  "HRM-MSC-009": "complete",
  "HRM-MSC-010": "complete",
  "HRM-MSC-011": "complete",
  "HRM-MSC-012": "complete",
  "HRM-MSC-013": "complete",
  "HRM-MSC-014": "complete",
  "HRM-MSC-015": "complete",
  "HRM-MSC-016": "complete",
  "HRM-MSC-017": "complete",
  "HRM-MSC-018": "complete",
  "HRM-MSC-019": "complete",
  "HRM-MSC-020": "complete",
  "HRM-MSC-021": "complete",
  "HRM-MSC-022": "complete",
  "HRM-MSC-023": "complete",
  "HRM-MSC-024": "complete",
  "HRM-MSC-025": "complete",
  "HRM-MSC-026": "complete",
  "HRM-MSC-027": "complete",
  "HRM-MSC-028": "complete",
  "HRM-MSC-029": "complete",
  "HRM-MSC-030": "complete",
  "HRM-MSC-031": "complete",
}

export function listHrmMscSpecDeliveryRows(): ReadonlyArray<{
  code: HrmMscSpecCode
  area: (typeof HRM_MSC_SPEC_MAP)[HrmMscSpecCode]
  status: HrmMscSpecDeliveryStatus
}> {
  return (Object.keys(HRM_MSC_SPEC_MAP) as HrmMscSpecCode[]).map((code) => ({
    code,
    area: HRM_MSC_SPEC_MAP[code],
    status: HRM_MSC_SPEC_DELIVERY_STATUS[code],
  }))
}
