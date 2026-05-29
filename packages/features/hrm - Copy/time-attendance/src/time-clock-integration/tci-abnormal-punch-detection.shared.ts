/**
 * HRM-TCI-019 — detect abnormal punches (shift window, late/early, unmatched).
 *
 * Ingest: `outside_shift_window` on `hrm_time_clock_punch_exception` (HRM-TCI-020 shift match).
 * LAM day snapshot: `late_arrival`, `early_out`,
 * `clock_out_without_clock_in` after `regenerateAttendanceDayFromEvents` (HRM-TCI-021).
 */

import {
  TCI_LIST_SURFACE_IDS,
  TCI_STAT_SURFACE_KEY,
} from "./data/tci-surface-metadata.shared"
import { TCI_LAM_HANDOFF_SYMBOL } from "./tci-attendance-handoff.shared"

/** Ingest rejection outcome when punch is outside assigned shift window (HRM-TCI-020). */
export const TCI_ABNORMAL_PUNCH_INGEST_OUTCOME = "outside_shift_window" as const

/** LAM `AttendanceExceptionCode` subset surfaced as abnormal punch. */
export const TCI_ABNORMAL_PUNCH_LAM_CODES = [
  "late_arrival",
  "early_out",
  "clock_out_without_clock_in",
] as const

export type TciAbnormalPunchLamCode =
  (typeof TCI_ABNORMAL_PUNCH_LAM_CODES)[number]

export type TciAbnormalPunchRequirement =
  | "early-clock-in"
  | "late-clock-in"
  | "early-clock-out"
  | "unmatched-punch"

export type TciAbnormalPunchTaxonomyEntry = {
  readonly requirement: TciAbnormalPunchRequirement
  readonly wire: string
  readonly channel: "ingest" | "lam"
  readonly i18nLabelKey: string
}

export const TCI_ABNORMAL_PUNCH_TAXONOMY = [
  {
    requirement: "early-clock-in",
    wire: TCI_ABNORMAL_PUNCH_INGEST_OUTCOME,
    channel: "ingest",
    i18nLabelKey: "early_clock_in",
  },
  {
    requirement: "late-clock-in",
    wire: "late_arrival",
    channel: "lam",
    i18nLabelKey: "late_arrival",
  },
  {
    requirement: "early-clock-out",
    wire: "early_out",
    channel: "lam",
    i18nLabelKey: "early_out",
  },
  {
    requirement: "unmatched-punch",
    wire: "clock_out_without_clock_in",
    channel: "lam",
    i18nLabelKey: "unmatched_punch",
  },
] as const satisfies readonly TciAbnormalPunchTaxonomyEntry[]

export const TCI_ABNORMAL_PUNCH_LAM_HANDOFF_SYMBOL = TCI_LAM_HANDOFF_SYMBOL

export type TciDeviceEventForAbnormalPunchDetection = {
  readonly eventType: string
  readonly occurredAt: Date
}

export type TciAbnormalPunchFinding = {
  readonly code: TciAbnormalPunchLamCode
  readonly message: string
  readonly metadata?: Readonly<Record<string, string>>
}

export type TciAbnormalPunchDetectionSurface =
  | {
      readonly door: "validation"
      readonly symbol: "evaluateTimeClockPunch"
      readonly requirementCodes: readonly ["HRM-TCI-019"]
    }
  | {
      readonly door: "pattern_c_ui"
      readonly symbol: typeof TCI_LIST_SURFACE_IDS.exceptions
      readonly requirementCodes: readonly ["HRM-TCI-019", "HRM-TCI-024"]
    }
  | {
      readonly door: "pattern_b_ui"
      readonly symbol: typeof TCI_LIST_SURFACE_IDS.abnormalPunchFindings
      readonly requirementCodes: readonly ["HRM-TCI-019", "HRM-TCI-021"]
    }
  | {
      readonly door: "pattern_b_ui"
      readonly symbol: typeof TCI_STAT_SURFACE_KEY
      readonly requirementCodes: readonly ["HRM-TCI-019"]
    }
  | {
      readonly door: "report_csv"
      readonly symbol: "abnormal_punch"
      readonly requirementCodes: readonly ["HRM-TCI-019", "HRM-TCI-028"]
    }

export const TCI_ABNORMAL_PUNCH_DETECTION_SURFACES = [
  {
    door: "validation",
    symbol: "evaluateTimeClockPunch",
    requirementCodes: ["HRM-TCI-019"],
  },
  {
    door: "pattern_c_ui",
    symbol: TCI_LIST_SURFACE_IDS.exceptions,
    requirementCodes: ["HRM-TCI-019", "HRM-TCI-024"],
  },
  {
    door: "pattern_b_ui",
    symbol: TCI_LIST_SURFACE_IDS.abnormalPunchFindings,
    requirementCodes: ["HRM-TCI-019", "HRM-TCI-021"],
  },
  {
    door: "pattern_b_ui",
    symbol: TCI_STAT_SURFACE_KEY,
    requirementCodes: ["HRM-TCI-019"],
  },
  {
    door: "report_csv",
    symbol: "abnormal_punch",
    requirementCodes: ["HRM-TCI-019", "HRM-TCI-028"],
  },
] as const satisfies readonly TciAbnormalPunchDetectionSurface[]

export function isTciAbnormalPunchLamCode(
  value: string
): value is TciAbnormalPunchLamCode {
  return (TCI_ABNORMAL_PUNCH_LAM_CODES as readonly string[]).includes(value)
}

export function isTciAbnormalPunchIngestOutcome(
  value: string
): value is typeof TCI_ABNORMAL_PUNCH_INGEST_OUTCOME {
  return value === TCI_ABNORMAL_PUNCH_INGEST_OUTCOME
}

export function extractAbnormalPunchCodesFromAttendanceSnapshot(
  snapshot: unknown
): readonly TciAbnormalPunchLamCode[] {
  if (!snapshot || typeof snapshot !== "object") {
    return []
  }
  const exceptions = (snapshot as { exceptions?: unknown }).exceptions
  if (!Array.isArray(exceptions)) {
    return []
  }
  const codes = new Set<TciAbnormalPunchLamCode>()
  for (const entry of exceptions) {
    if (!entry || typeof entry !== "object") continue
    const code = (entry as { code?: string }).code
    if (typeof code === "string" && isTciAbnormalPunchLamCode(code)) {
      codes.add(code)
    }
  }
  return [...codes]
}

/** Unmatched clock-out on the device stream (no open clock-in). */
export function detectAbnormalPunchesInDeviceEventSequence(
  events: readonly TciDeviceEventForAbnormalPunchDetection[]
): readonly TciAbnormalPunchFinding[] {
  const ordered = [...events]
    .filter(
      (event) =>
        event.eventType === "clock_in" || event.eventType === "clock_out"
    )
    .sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime())

  const findings: TciAbnormalPunchFinding[] = []
  let openClockIn: Date | null = null

  for (const event of ordered) {
    if (event.eventType === "clock_in") {
      openClockIn = event.occurredAt
      continue
    }
    if (event.eventType === "clock_out") {
      if (openClockIn === null) {
        findings.push({
          code: "clock_out_without_clock_in",
          message: "Clock-out was recorded without an open clock-in.",
          metadata: { clockOutAt: event.occurredAt.toISOString() },
        })
      } else {
        openClockIn = null
      }
    }
  }

  return findings
}

export function assertHrmTci019AbnormalPunchDetection(): void {
  if (TCI_ABNORMAL_PUNCH_TAXONOMY.length !== 4) {
    throw new Error("HRM-TCI-019 requires four abnormal punch classifications")
  }

  for (const surface of TCI_ABNORMAL_PUNCH_DETECTION_SURFACES) {
    if (!surface.requirementCodes.includes("HRM-TCI-019")) {
      throw new Error(
        `TCI abnormal punch surface "${surface.symbol}" must cite HRM-TCI-019`
      )
    }
  }

  const unmatched = detectAbnormalPunchesInDeviceEventSequence([
    {
      eventType: "clock_out",
      occurredAt: new Date("2026-03-01T17:00:00.000Z"),
    },
  ])
  if (
    unmatched.length !== 1 ||
    unmatched[0]?.code !== "clock_out_without_clock_in"
  ) {
    throw new Error(
      "clock-out without clock-in must be detected as unmatched punch"
    )
  }

  const snapshot = extractAbnormalPunchCodesFromAttendanceSnapshot({
    exceptions: [
      { code: "late_arrival" },
      { code: "early_out" },
      { code: "missing_clock_in" },
    ],
  })
  if (snapshot.length !== 2) {
    throw new Error("snapshot extractor must return only abnormal LAM codes")
  }

  if (!isTciAbnormalPunchIngestOutcome(TCI_ABNORMAL_PUNCH_INGEST_OUTCOME)) {
    throw new Error("outside_shift_window must be the ingest abnormal outcome")
  }
}
