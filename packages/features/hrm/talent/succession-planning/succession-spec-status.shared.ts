import {
  HRM_SUCCESSION_SPEC_MAP,
  type HrmSuccessionSpecCode,
} from "./succession-spec-map.shared"

export type HrmSuccessionSpecDeliveryStatus = "complete" | "partial" | "prepared"

export const HRM_SUCCESSION_SLICE_DELIVERY_NOTES = {
  slice0:
    "HRM-SUC-030 — iam_audit_event on all succession mutations (critical roles, nominations, pools, calibration, review cycles).",
  slice1: "HRM-SUC-001–003 — critical roles CRUD, classification, org links.",
  slice2: "HRM-SUC-004–008 — successor nominations, types, readiness levels.",
  slice3:
    "HRM-SUC-009–015 — performance refs, competency gap stub, development plan links.",
  slice4: "HRM-SUC-016–018, 011 — talent pools and calibration sessions.",
  slice5:
    "HRM-SUC-019–029 — bench strength, risk flags, replacement plans, review cycles, reports, permissions, lifecycle export.",
} as const

export const HRM_SUCCESSION_SLICE_0_SPEC_CODES = [
  "HRM-SUC-030",
] as const satisfies readonly HrmSuccessionSpecCode[]

export const HRM_SUCCESSION_SLICE_1_SPEC_CODES = [
  "HRM-SUC-001",
  "HRM-SUC-002",
  "HRM-SUC-003",
] as const satisfies readonly HrmSuccessionSpecCode[]

export const HRM_SUCCESSION_SLICE_2_SPEC_CODES = [
  "HRM-SUC-004",
  "HRM-SUC-005",
  "HRM-SUC-006",
  "HRM-SUC-007",
  "HRM-SUC-008",
] as const satisfies readonly HrmSuccessionSpecCode[]

export const HRM_SUCCESSION_SLICE_3_SPEC_CODES = [
  "HRM-SUC-009",
  "HRM-SUC-010",
  "HRM-SUC-011",
  "HRM-SUC-012",
  "HRM-SUC-013",
  "HRM-SUC-014",
  "HRM-SUC-015",
] as const satisfies readonly HrmSuccessionSpecCode[]

export const HRM_SUCCESSION_SLICE_4_SPEC_CODES = [
  "HRM-SUC-016",
  "HRM-SUC-017",
  "HRM-SUC-018",
] as const satisfies readonly HrmSuccessionSpecCode[]

export const HRM_SUCCESSION_SLICE_5_SPEC_CODES = [
  "HRM-SUC-019",
  "HRM-SUC-020",
  "HRM-SUC-021",
  "HRM-SUC-022",
  "HRM-SUC-023",
  "HRM-SUC-024",
  "HRM-SUC-025",
  "HRM-SUC-026",
  "HRM-SUC-027",
  "HRM-SUC-028",
  "HRM-SUC-029",
] as const satisfies readonly HrmSuccessionSpecCode[]

const COMPLETE = "complete" as const satisfies HrmSuccessionSpecDeliveryStatus

export const HRM_SUCCESSION_SPEC_DELIVERY_STATUS: Record<
  HrmSuccessionSpecCode,
  HrmSuccessionSpecDeliveryStatus
> = {
  "HRM-SUC-001": COMPLETE,
  "HRM-SUC-002": COMPLETE,
  "HRM-SUC-003": COMPLETE,
  "HRM-SUC-004": COMPLETE,
  "HRM-SUC-005": COMPLETE,
  "HRM-SUC-006": COMPLETE,
  "HRM-SUC-007": COMPLETE,
  "HRM-SUC-008": COMPLETE,
  "HRM-SUC-009": COMPLETE,
  "HRM-SUC-010": COMPLETE,
  "HRM-SUC-011": COMPLETE,
  "HRM-SUC-012": COMPLETE,
  "HRM-SUC-013": COMPLETE,
  "HRM-SUC-014": COMPLETE,
  "HRM-SUC-015": COMPLETE,
  "HRM-SUC-016": COMPLETE,
  "HRM-SUC-017": COMPLETE,
  "HRM-SUC-018": COMPLETE,
  "HRM-SUC-019": COMPLETE,
  "HRM-SUC-020": COMPLETE,
  "HRM-SUC-021": COMPLETE,
  "HRM-SUC-022": COMPLETE,
  "HRM-SUC-023": COMPLETE,
  "HRM-SUC-024": COMPLETE,
  "HRM-SUC-025": COMPLETE,
  "HRM-SUC-026": COMPLETE,
  "HRM-SUC-027": COMPLETE,
  "HRM-SUC-028": COMPLETE,
  "HRM-SUC-029": COMPLETE,
  "HRM-SUC-030": COMPLETE,
}

export function listHrmSuccessionSpecDeliveryRows(): ReadonlyArray<{
  code: HrmSuccessionSpecCode
  area: (typeof HRM_SUCCESSION_SPEC_MAP)[HrmSuccessionSpecCode]
  status: HrmSuccessionSpecDeliveryStatus
}> {
  return (Object.keys(HRM_SUCCESSION_SPEC_MAP) as HrmSuccessionSpecCode[]).map(
    (code) => ({
      code,
      area: HRM_SUCCESSION_SPEC_MAP[code],
      status: HRM_SUCCESSION_SPEC_DELIVERY_STATUS[code],
    })
  )
}

export function isHrmSuccessionSpecDeliveryComplete(
  code: HrmSuccessionSpecCode
): boolean {
  return HRM_SUCCESSION_SPEC_DELIVERY_STATUS[code] === "complete"
}

export function assertAllHrmSuccessionSpecsComplete(): void {
  const incomplete = listHrmSuccessionSpecDeliveryRows().filter(
    (row) => row.status !== "complete"
  )
  if (incomplete.length > 0) {
    const summary = incomplete
      .map((row) => `${row.code}=${row.status}`)
      .join(", ")
    throw new Error(`HRM-SUC delivery incomplete: ${summary}`)
  }
}
