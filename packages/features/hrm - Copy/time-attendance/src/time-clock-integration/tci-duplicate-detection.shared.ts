/**
 * HRM-TCI-018 — detect duplicate punch records (surface to HR; HRM-TCI-013 prevents insert).
 *
 * Payload replay: `duplicate_punch` on `hrm_time_clock_punch_exception` when ingest detects
 * an existing `rawPayloadHash`. Sequence: `duplicate_clock_in` from LAM `aggregateAttendanceDay`
 * after `regenerateAttendanceDayFromEvents` (HRM-TCI-021).
 */

import {
  TCI_LIST_SURFACE_IDS,
  TCI_STAT_SURFACE_KEY,
} from "./data/tci-surface-metadata.shared"
import { TCI_LAM_HANDOFF_SYMBOL } from "./tci-attendance-handoff.shared"
import { TCI_DEDUPLICATION_DETECTION_OUTCOME } from "./tci-deduplication.shared"

export const TCI_DUPLICATE_PUNCH_DETECTION_OUTCOME =
  TCI_DEDUPLICATION_DETECTION_OUTCOME

export const TCI_DUPLICATE_SEQUENCE_CODES = ["duplicate_clock_in"] as const

export type TciDuplicateSequenceCode =
  (typeof TCI_DUPLICATE_SEQUENCE_CODES)[number]

export const TCI_DUPLICATE_DETECTION_CODES = [
  TCI_DUPLICATE_PUNCH_DETECTION_OUTCOME,
  ...TCI_DUPLICATE_SEQUENCE_CODES,
] as const

export type TciDuplicateDetectionCode =
  | typeof TCI_DUPLICATE_PUNCH_DETECTION_OUTCOME
  | TciDuplicateSequenceCode

export const TCI_DUPLICATE_EXCEPTION_TABLE =
  "hrm_time_clock_punch_exception" as const

export const TCI_DUPLICATE_EXCEPTION_INBOX_SYMBOL =
  "listTimeClockExceptionsForOrg" as const

export const TCI_DUPLICATE_LAM_HANDOFF_SYMBOL = TCI_LAM_HANDOFF_SYMBOL

export type TciDeviceEventForDuplicateDetection = {
  readonly eventType: string
  readonly occurredAt: Date
}

export type TciDuplicatePunchFinding = {
  readonly code: TciDuplicateDetectionCode
  readonly message: string
  readonly metadata?: Readonly<Record<string, string>>
}

export type TciDuplicateDetectionSurface =
  | {
      readonly door: "validation"
      readonly symbol: "evaluateTimeClockPunch"
      readonly requirementCodes: readonly ["HRM-TCI-013", "HRM-TCI-018"]
    }
  | {
      readonly door: "persist"
      readonly symbol: "persistTimeClockPunch"
      readonly requirementCodes: readonly ["HRM-TCI-018", "HRM-TCI-030"]
    }
  | {
      readonly door: "pattern_c_ui"
      readonly symbol: typeof TCI_LIST_SURFACE_IDS.exceptions
      readonly requirementCodes: readonly ["HRM-TCI-018", "HRM-TCI-024"]
    }
  | {
      readonly door: "pattern_b_ui"
      readonly symbol: typeof TCI_LIST_SURFACE_IDS.duplicatePunchFindings
      readonly requirementCodes: readonly ["HRM-TCI-018", "HRM-TCI-021"]
    }
  | {
      readonly door: "pattern_b_ui"
      readonly symbol: typeof TCI_STAT_SURFACE_KEY
      readonly requirementCodes: readonly ["HRM-TCI-018"]
    }
  | {
      readonly door: "report_csv"
      readonly symbol: "duplicate_punch"
      readonly requirementCodes: readonly ["HRM-TCI-018", "HRM-TCI-028"]
    }

export const TCI_DUPLICATE_DETECTION_SURFACES = [
  {
    door: "validation",
    symbol: "evaluateTimeClockPunch",
    requirementCodes: ["HRM-TCI-013", "HRM-TCI-018"],
  },
  {
    door: "persist",
    symbol: "persistTimeClockPunch",
    requirementCodes: ["HRM-TCI-018", "HRM-TCI-030"],
  },
  {
    door: "pattern_c_ui",
    symbol: TCI_LIST_SURFACE_IDS.exceptions,
    requirementCodes: ["HRM-TCI-018", "HRM-TCI-024"],
  },
  {
    door: "pattern_b_ui",
    symbol: TCI_LIST_SURFACE_IDS.duplicatePunchFindings,
    requirementCodes: ["HRM-TCI-018", "HRM-TCI-021"],
  },
  {
    door: "pattern_b_ui",
    symbol: TCI_STAT_SURFACE_KEY,
    requirementCodes: ["HRM-TCI-018"],
  },
  {
    door: "report_csv",
    symbol: "duplicate_punch",
    requirementCodes: ["HRM-TCI-018", "HRM-TCI-028"],
  },
] as const satisfies readonly TciDuplicateDetectionSurface[]

export function isTciDuplicateDetectionCode(
  value: string
): value is TciDuplicateDetectionCode {
  return (TCI_DUPLICATE_DETECTION_CODES as readonly string[]).includes(value)
}

export function isTciDuplicatePunchDetectionOutcome(
  value: string
): value is typeof TCI_DUPLICATE_PUNCH_DETECTION_OUTCOME {
  return value === TCI_DUPLICATE_PUNCH_DETECTION_OUTCOME
}

export function extractDuplicatePunchCodesFromAttendanceSnapshot(
  snapshot: unknown
): readonly TciDuplicateSequenceCode[] {
  if (!snapshot || typeof snapshot !== "object") {
    return []
  }
  const exceptions = (snapshot as { exceptions?: unknown }).exceptions
  if (!Array.isArray(exceptions)) {
    return []
  }
  const codes = new Set<TciDuplicateSequenceCode>()
  for (const entry of exceptions) {
    if (!entry || typeof entry !== "object") continue
    const code = (entry as { code?: string }).code
    if (code === "duplicate_clock_in") {
      codes.add("duplicate_clock_in")
    }
  }
  return [...codes]
}

/**
 * Stream detector for consecutive clock-in without an intervening clock-out.
 */
export function detectDuplicatePunchesInDeviceEventSequence(
  events: readonly TciDeviceEventForDuplicateDetection[]
): readonly TciDuplicatePunchFinding[] {
  const ordered = [...events]
    .filter(
      (event) =>
        event.eventType === "clock_in" || event.eventType === "clock_out"
    )
    .sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime())

  const findings: TciDuplicatePunchFinding[] = []
  let openClockIn: Date | null = null

  for (const event of ordered) {
    if (event.eventType === "clock_in") {
      if (openClockIn !== null) {
        findings.push({
          code: "duplicate_clock_in",
          message:
            "Clock-in was recorded before the previous clock-in was closed.",
          metadata: {
            previousClockInAt: openClockIn.toISOString(),
            duplicateClockInAt: event.occurredAt.toISOString(),
          },
        })
      }
      openClockIn = event.occurredAt
      continue
    }
    if (event.eventType === "clock_out") {
      openClockIn = null
    }
  }

  return findings
}

export function assertHrmTci018DuplicateDetection(): void {
  if (TCI_DUPLICATE_PUNCH_DETECTION_OUTCOME !== "duplicate_punch") {
    throw new Error("HRM-TCI-018 payload outcome must be duplicate_punch")
  }

  for (const surface of TCI_DUPLICATE_DETECTION_SURFACES) {
    if (!surface.requirementCodes.includes("HRM-TCI-018")) {
      throw new Error(
        `TCI duplicate detection surface "${surface.symbol}" must cite HRM-TCI-018`
      )
    }
  }

  const stream = detectDuplicatePunchesInDeviceEventSequence([
    { eventType: "clock_in", occurredAt: new Date("2026-03-01T08:00:00.000Z") },
    { eventType: "clock_in", occurredAt: new Date("2026-03-01T09:00:00.000Z") },
  ])
  if (stream.length !== 1 || stream[0]?.code !== "duplicate_clock_in") {
    throw new Error("consecutive clock-in must detect duplicate_clock_in")
  }

  if (!isTciDuplicatePunchDetectionOutcome("duplicate_punch")) {
    throw new Error("duplicate_punch must be a detection outcome")
  }
  if (isTciDuplicatePunchDetectionOutcome("verified")) {
    throw new Error("verified must not be a duplicate detection outcome")
  }

  const snapshot = extractDuplicatePunchCodesFromAttendanceSnapshot({
    exceptions: [{ code: "duplicate_clock_in" }, { code: "late_arrival" }],
  })
  if (snapshot.length !== 1 || snapshot[0] !== "duplicate_clock_in") {
    throw new Error(
      "snapshot extractor must return only duplicate sequence codes"
    )
  }
}
