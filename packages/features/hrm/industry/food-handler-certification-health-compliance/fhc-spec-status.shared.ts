import { HRM_FHC_SPEC_MAP, type HrmFhcSpecCode } from "./fhc-spec-map.shared"

export type HrmFhcSpecDeliveryStatus = "complete" | "partial" | "prepared"

/** Slice 1 (HRM-FHC-001–002): requirement rules and employee obligations. */
export const HRM_FHC_SLICE_1_SPEC_CODES = [
  "HRM-FHC-001",
  "HRM-FHC-002",
] as const satisfies readonly HrmFhcSpecCode[]

/** Slice 2 (HRM-FHC-003–007): permits, training, health, evidence. */
export const HRM_FHC_SLICE_2_SPEC_CODES = [
  "HRM-FHC-003",
  "HRM-FHC-004",
  "HRM-FHC-005",
  "HRM-FHC-006",
  "HRM-FHC-007",
] as const satisfies readonly HrmFhcSpecCode[]

/** Slice 3 (HRM-FHC-008–013): compliance status, eligibility, flags. */
export const HRM_FHC_SLICE_3_SPEC_CODES = [
  "HRM-FHC-008",
  "HRM-FHC-009",
  "HRM-FHC-010",
  "HRM-FHC-011",
  "HRM-FHC-012",
  "HRM-FHC-013",
] as const satisfies readonly HrmFhcSpecCode[]

/** Slice 4 (HRM-FHC-014–018): alerts, renewal, verification, restrictions. */
export const HRM_FHC_SLICE_4_SPEC_CODES = [
  "HRM-FHC-014",
  "HRM-FHC-015",
  "HRM-FHC-016",
  "HRM-FHC-017",
  "HRM-FHC-018",
] as const satisfies readonly HrmFhcSpecCode[]

/** Slice 5 (HRM-FHC-019–025): integrations, overview, reports, audit. */
export const HRM_FHC_SLICE_5_SPEC_CODES = [
  "HRM-FHC-019",
  "HRM-FHC-020",
  "HRM-FHC-021",
  "HRM-FHC-022",
  "HRM-FHC-023",
  "HRM-FHC-024",
  "HRM-FHC-025",
] as const satisfies readonly HrmFhcSpecCode[]

/**
 * Delivery status per requirement code — aligned with shipped behavior in
 * `food-handler-certification-health-compliance/`.
 */
export const HRM_FHC_SPEC_DELIVERY_STATUS: Record<
  HrmFhcSpecCode,
  HrmFhcSpecDeliveryStatus
> = {
  "HRM-FHC-001": "complete",
  "HRM-FHC-002": "complete",
  "HRM-FHC-003": "complete",
  "HRM-FHC-004": "complete",
  "HRM-FHC-005": "complete",
  "HRM-FHC-006": "complete",
  "HRM-FHC-007": "complete",
  "HRM-FHC-008": "complete",
  "HRM-FHC-009": "complete",
  "HRM-FHC-010": "complete",
  "HRM-FHC-011": "complete",
  "HRM-FHC-012": "complete",
  "HRM-FHC-013": "complete",
  "HRM-FHC-014": "complete",
  "HRM-FHC-015": "complete",
  "HRM-FHC-016": "complete",
  "HRM-FHC-017": "complete",
  "HRM-FHC-018": "complete",
  "HRM-FHC-019": "complete",
  "HRM-FHC-020": "complete",
  "HRM-FHC-021": "complete",
  "HRM-FHC-022": "complete",
  "HRM-FHC-023": "complete",
  "HRM-FHC-024": "complete",
  "HRM-FHC-025": "complete",
}

export function listHrmFhcSpecDeliveryRows(): ReadonlyArray<{
  code: HrmFhcSpecCode
  area: (typeof HRM_FHC_SPEC_MAP)[HrmFhcSpecCode]
  status: HrmFhcSpecDeliveryStatus
}> {
  return (Object.keys(HRM_FHC_SPEC_MAP) as HrmFhcSpecCode[]).map((code) => ({
    code,
    area: HRM_FHC_SPEC_MAP[code],
    status: HRM_FHC_SPEC_DELIVERY_STATUS[code],
  }))
}
