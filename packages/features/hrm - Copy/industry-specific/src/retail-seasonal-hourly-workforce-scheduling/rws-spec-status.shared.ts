import { HRM_RWS_SPEC_MAP, type HrmRwsSpecCode } from "./rws-spec-map.shared"

export type HrmRwsSpecDeliveryStatus = "complete" | "partial" | "prepared"

/**
 * Slice closure notes (HRM-RWS-001–034). Integration specs delegate to Shift Scheduling
 * where ARCHITECTURE.md excludes duplicate engines; RWS owns retail scope tables + UI.
 */
export const HRM_RWS_SLICE_DELIVERY_NOTES = {
  slice0: "HRM-RWS-034 — iam_audit_event on all RWS mutations (stores, periods, coverage, open shifts, budget, publish).",
  slice1: "HRM-RWS-001–005 — stores, period kinds, draft/publish with validateRwsPeriodPublish.",
  slice2:
    "HRM-RWS-006–011 — SftAvailabilitySection + coverage slots/gaps; assignment validation via SFT assign/conflict detect.",
  slice3:
    "HRM-RWS-012–019 — skill validation on claim; Pattern C open-shift claim UI; SftSwapPendingSection + shift-scheduling link.",
  slice4:
    "HRM-RWS-020–028 — demand/budget lists; summarizeRwsLaborMetricsForPeriod + publish labor-cost gate (022–024); policy form.",
  slice5:
    "HRM-RWS-029–034 — notifications; Pattern B/C attendance + payroll reference lists; CSV reports; resolveRwsSurfaceAccess.",
} as const

export const HRM_RWS_SLICE_0_SPEC_CODES = [
  "HRM-RWS-034",
] as const satisfies readonly HrmRwsSpecCode[]

export const HRM_RWS_SLICE_1_SPEC_CODES = [
  "HRM-RWS-001",
  "HRM-RWS-002",
  "HRM-RWS-003",
  "HRM-RWS-004",
  "HRM-RWS-005",
] as const satisfies readonly HrmRwsSpecCode[]

export const HRM_RWS_SLICE_2_SPEC_CODES = [
  "HRM-RWS-006",
  "HRM-RWS-007",
  "HRM-RWS-008",
  "HRM-RWS-009",
  "HRM-RWS-010",
  "HRM-RWS-011",
] as const satisfies readonly HrmRwsSpecCode[]

export const HRM_RWS_SLICE_3_SPEC_CODES = [
  "HRM-RWS-012",
  "HRM-RWS-013",
  "HRM-RWS-014",
  "HRM-RWS-015",
  "HRM-RWS-016",
  "HRM-RWS-017",
  "HRM-RWS-018",
  "HRM-RWS-019",
] as const satisfies readonly HrmRwsSpecCode[]

export const HRM_RWS_SLICE_4_SPEC_CODES = [
  "HRM-RWS-020",
  "HRM-RWS-021",
  "HRM-RWS-022",
  "HRM-RWS-023",
  "HRM-RWS-024",
  "HRM-RWS-025",
  "HRM-RWS-026",
  "HRM-RWS-027",
  "HRM-RWS-028",
] as const satisfies readonly HrmRwsSpecCode[]

export const HRM_RWS_SLICE_5_SPEC_CODES = [
  "HRM-RWS-029",
  "HRM-RWS-030",
  "HRM-RWS-031",
  "HRM-RWS-032",
  "HRM-RWS-033",
  "HRM-RWS-034",
] as const satisfies readonly HrmRwsSpecCode[]

const COMPLETE = "complete" as const satisfies HrmRwsSpecDeliveryStatus

export const HRM_RWS_SPEC_DELIVERY_STATUS: Record<
  HrmRwsSpecCode,
  HrmRwsSpecDeliveryStatus
> = {
  "HRM-RWS-001": COMPLETE,
  "HRM-RWS-002": COMPLETE,
  "HRM-RWS-003": COMPLETE,
  "HRM-RWS-004": COMPLETE,
  "HRM-RWS-005": COMPLETE,
  "HRM-RWS-006": COMPLETE,
  "HRM-RWS-007": COMPLETE,
  "HRM-RWS-008": COMPLETE,
  "HRM-RWS-009": COMPLETE,
  "HRM-RWS-010": COMPLETE,
  "HRM-RWS-011": COMPLETE,
  "HRM-RWS-012": COMPLETE,
  "HRM-RWS-013": COMPLETE,
  "HRM-RWS-014": COMPLETE,
  "HRM-RWS-015": COMPLETE,
  "HRM-RWS-016": COMPLETE,
  "HRM-RWS-017": COMPLETE,
  "HRM-RWS-018": COMPLETE,
  "HRM-RWS-019": COMPLETE,
  "HRM-RWS-020": COMPLETE,
  "HRM-RWS-021": COMPLETE,
  "HRM-RWS-022": COMPLETE,
  "HRM-RWS-023": COMPLETE,
  "HRM-RWS-024": COMPLETE,
  "HRM-RWS-025": COMPLETE,
  "HRM-RWS-026": COMPLETE,
  "HRM-RWS-027": COMPLETE,
  "HRM-RWS-028": COMPLETE,
  "HRM-RWS-029": COMPLETE,
  "HRM-RWS-030": COMPLETE,
  "HRM-RWS-031": COMPLETE,
  "HRM-RWS-032": COMPLETE,
  "HRM-RWS-033": COMPLETE,
  "HRM-RWS-034": COMPLETE,
}

export function listHrmRwsSpecDeliveryRows(): ReadonlyArray<{
  code: HrmRwsSpecCode
  area: (typeof HRM_RWS_SPEC_MAP)[HrmRwsSpecCode]
  status: HrmRwsSpecDeliveryStatus
}> {
  return (Object.keys(HRM_RWS_SPEC_MAP) as HrmRwsSpecCode[]).map((code) => ({
    code,
    area: HRM_RWS_SPEC_MAP[code],
    status: HRM_RWS_SPEC_DELIVERY_STATUS[code],
  }))
}

export function isHrmRwsSpecDeliveryComplete(code: HrmRwsSpecCode): boolean {
  return HRM_RWS_SPEC_DELIVERY_STATUS[code] === "complete"
}

/** Contract tests: every HRM-RWS-001–034 row must be complete before merge. */
export function assertAllHrmRwsSpecsComplete(): void {
  const incomplete = listHrmRwsSpecDeliveryRows().filter(
    (row) => row.status !== "complete"
  )
  if (incomplete.length > 0) {
    const summary = incomplete
      .map((row) => `${row.code}=${row.status}`)
      .join(", ")
    throw new Error(`HRM-RWS delivery incomplete: ${summary}`)
  }
}
