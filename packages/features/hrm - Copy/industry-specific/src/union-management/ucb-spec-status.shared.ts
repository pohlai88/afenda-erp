import {
  HRM_UCB_SPEC_MAP,
  type HrmUcbSpecCode,
} from "./ucb-spec-map.shared"

export type HrmUcbSpecDeliveryStatus = "complete" | "partial" | "prepared"

export const HRM_UCB_SLICE_DELIVERY_NOTES = {
  slice0:
    "HRM-UCB-030 — iam_audit_event on union/CBA/membership/rule/grievance/dues mutations.",
  slice1: "HRM-UCB-001–007 — unions, CBAs, bargaining units, membership, access control.",
  slice2: "HRM-UCB-008–012 — CBA rule references and Payroll/OTM/LAM/SFT exports.",
  slice3: "HRM-UCB-013–018 — seniority, compliance findings, union dues payroll refs.",
  slice4: "HRM-UCB-019–023 — grievance cases, steps, status, dispute refs.",
  slice5:
    "HRM-UCB-024–029 — reps, LR meetings, renewal, alerts, reports, permissions.",
} as const

export const HRM_UCB_SLICE_0_SPEC_CODES = [
  "HRM-UCB-030",
] as const satisfies readonly HrmUcbSpecCode[]

export const HRM_UCB_SLICE_1_SPEC_CODES = [
  "HRM-UCB-001",
  "HRM-UCB-002",
  "HRM-UCB-003",
  "HRM-UCB-004",
  "HRM-UCB-005",
  "HRM-UCB-006",
  "HRM-UCB-007",
] as const satisfies readonly HrmUcbSpecCode[]

export const HRM_UCB_SLICE_2_SPEC_CODES = [
  "HRM-UCB-008",
  "HRM-UCB-009",
  "HRM-UCB-010",
  "HRM-UCB-011",
  "HRM-UCB-012",
] as const satisfies readonly HrmUcbSpecCode[]

export const HRM_UCB_SLICE_3_SPEC_CODES = [
  "HRM-UCB-013",
  "HRM-UCB-014",
  "HRM-UCB-015",
  "HRM-UCB-016",
  "HRM-UCB-017",
  "HRM-UCB-018",
] as const satisfies readonly HrmUcbSpecCode[]

export const HRM_UCB_SLICE_4_SPEC_CODES = [
  "HRM-UCB-019",
  "HRM-UCB-020",
  "HRM-UCB-021",
  "HRM-UCB-022",
  "HRM-UCB-023",
] as const satisfies readonly HrmUcbSpecCode[]

export const HRM_UCB_SLICE_5_SPEC_CODES = [
  "HRM-UCB-024",
  "HRM-UCB-025",
  "HRM-UCB-026",
  "HRM-UCB-027",
  "HRM-UCB-028",
  "HRM-UCB-029",
] as const satisfies readonly HrmUcbSpecCode[]

const COMPLETE = "complete" as const satisfies HrmUcbSpecDeliveryStatus

export const HRM_UCB_SPEC_DELIVERY_STATUS: Record<
  HrmUcbSpecCode,
  HrmUcbSpecDeliveryStatus
> = {
  "HRM-UCB-001": COMPLETE,
  "HRM-UCB-002": COMPLETE,
  "HRM-UCB-003": COMPLETE,
  "HRM-UCB-004": COMPLETE,
  "HRM-UCB-005": COMPLETE,
  "HRM-UCB-006": COMPLETE,
  "HRM-UCB-007": COMPLETE,
  "HRM-UCB-008": COMPLETE,
  "HRM-UCB-009": COMPLETE,
  "HRM-UCB-010": COMPLETE,
  "HRM-UCB-011": COMPLETE,
  "HRM-UCB-012": COMPLETE,
  "HRM-UCB-013": COMPLETE,
  "HRM-UCB-014": COMPLETE,
  "HRM-UCB-015": COMPLETE,
  "HRM-UCB-016": COMPLETE,
  "HRM-UCB-017": COMPLETE,
  "HRM-UCB-018": COMPLETE,
  "HRM-UCB-019": COMPLETE,
  "HRM-UCB-020": COMPLETE,
  "HRM-UCB-021": COMPLETE,
  "HRM-UCB-022": COMPLETE,
  "HRM-UCB-023": COMPLETE,
  "HRM-UCB-024": COMPLETE,
  "HRM-UCB-025": COMPLETE,
  "HRM-UCB-026": COMPLETE,
  "HRM-UCB-027": COMPLETE,
  "HRM-UCB-028": COMPLETE,
  "HRM-UCB-029": COMPLETE,
  "HRM-UCB-030": COMPLETE,
}

export function listHrmUcbSpecDeliveryRows(): ReadonlyArray<{
  code: HrmUcbSpecCode
  area: (typeof HRM_UCB_SPEC_MAP)[HrmUcbSpecCode]
  status: HrmUcbSpecDeliveryStatus
}> {
  return (Object.keys(HRM_UCB_SPEC_MAP) as HrmUcbSpecCode[]).map((code) => ({
    code,
    area: HRM_UCB_SPEC_MAP[code],
    status: HRM_UCB_SPEC_DELIVERY_STATUS[code],
  }))
}

export function isHrmUcbSpecDeliveryComplete(code: HrmUcbSpecCode): boolean {
  return HRM_UCB_SPEC_DELIVERY_STATUS[code] === "complete"
}

export function assertAllHrmUcbSpecsComplete(): void {
  const incomplete = listHrmUcbSpecDeliveryRows().filter(
    (row) => row.status !== "complete"
  )
  if (incomplete.length > 0) {
    const summary = incomplete
      .map((row) => `${row.code}=${row.status}`)
      .join(", ")
    throw new Error(`HRM-UCB delivery incomplete: ${summary}`)
  }
}
