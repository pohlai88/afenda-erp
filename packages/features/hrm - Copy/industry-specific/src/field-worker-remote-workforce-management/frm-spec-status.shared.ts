import { HRM_FRM_SPEC_MAP, type HrmFrmSpecCode } from "./frm-spec-map.shared"

export type HrmFrmSpecDeliveryStatus = "complete" | "partial" | "prepared"

export const HRM_FRM_SLICE_0_SPEC_CODES = [
  "HRM-FRM-031",
] as const satisfies readonly HrmFrmSpecCode[]

export const HRM_FRM_SLICE_1_SPEC_CODES = [
  "HRM-FRM-001",
  "HRM-FRM-002",
  "HRM-FRM-003",
  "HRM-FRM-004",
] as const satisfies readonly HrmFrmSpecCode[]

export const HRM_FRM_SLICE_2_SPEC_CODES = [
  "HRM-FRM-005",
  "HRM-FRM-006",
  "HRM-FRM-007",
  "HRM-FRM-008",
  "HRM-FRM-009",
  "HRM-FRM-010",
  "HRM-FRM-011",
  "HRM-FRM-012",
  "HRM-FRM-030",
] as const satisfies readonly HrmFrmSpecCode[]

export const HRM_FRM_SLICE_3_SPEC_CODES = [
  "HRM-FRM-013",
  "HRM-FRM-014",
  "HRM-FRM-015",
  "HRM-FRM-016",
  "HRM-FRM-017",
  "HRM-FRM-018",
] as const satisfies readonly HrmFrmSpecCode[]

export const HRM_FRM_SLICE_4_SPEC_CODES = [
  "HRM-FRM-019",
  "HRM-FRM-020",
  "HRM-FRM-021",
  "HRM-FRM-022",
  "HRM-FRM-023",
  "HRM-FRM-024",
  "HRM-FRM-029",
] as const satisfies readonly HrmFrmSpecCode[]

export const HRM_FRM_SLICE_5_SPEC_CODES = [
  "HRM-FRM-025",
  "HRM-FRM-026",
  "HRM-FRM-027",
  "HRM-FRM-028",
  "HRM-FRM-031",
] as const satisfies readonly HrmFrmSpecCode[]

export const HRM_FRM_SPEC_DELIVERY_STATUS: Record<
  HrmFrmSpecCode,
  HrmFrmSpecDeliveryStatus
> = {
  "HRM-FRM-001": "complete",
  "HRM-FRM-002": "complete",
  "HRM-FRM-003": "complete",
  "HRM-FRM-004": "complete",
  "HRM-FRM-005": "complete",
  "HRM-FRM-006": "complete",
  "HRM-FRM-007": "complete",
  "HRM-FRM-008": "complete",
  "HRM-FRM-009": "complete",
  "HRM-FRM-010": "complete",
  "HRM-FRM-011": "complete",
  "HRM-FRM-012": "complete",
  "HRM-FRM-013": "complete",
  "HRM-FRM-014": "complete",
  "HRM-FRM-015": "complete",
  "HRM-FRM-016": "complete",
  "HRM-FRM-017": "complete",
  "HRM-FRM-018": "complete",
  "HRM-FRM-019": "complete",
  "HRM-FRM-020": "complete",
  "HRM-FRM-021": "complete",
  "HRM-FRM-022": "complete",
  "HRM-FRM-023": "complete",
  "HRM-FRM-024": "complete",
  "HRM-FRM-025": "complete",
  "HRM-FRM-026": "complete",
  "HRM-FRM-027": "complete",
  "HRM-FRM-028": "complete",
  "HRM-FRM-029": "complete",
  "HRM-FRM-030": "complete",
  "HRM-FRM-031": "complete",
}

export function listHrmFrmSpecDeliveryRows(): ReadonlyArray<{
  code: HrmFrmSpecCode
  area: (typeof HRM_FRM_SPEC_MAP)[HrmFrmSpecCode]
  status: HrmFrmSpecDeliveryStatus
}> {
  return (Object.keys(HRM_FRM_SPEC_MAP) as HrmFrmSpecCode[]).map((code) => ({
    code,
    area: HRM_FRM_SPEC_MAP[code],
    status: HRM_FRM_SPEC_DELIVERY_STATUS[code],
  }))
}
