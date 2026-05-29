/**
 * HRM-TCI-017 — detect missing punch records on device streams and LAM day snapshots.
 *
 * Stream pairing (`detectMissingPunchesInDeviceEventSequence`) flags open clock-in /
 * break-start pairs. Scheduled `missing_clock_in` is produced by LAM
 * `aggregateAttendanceDay` after `regenerateAttendanceDayFromEvents` (HRM-TCI-021).
 */

import {
  TCI_LIST_SURFACE_IDS,
  TCI_STAT_SURFACE_KEY,
} from "./data/tci-surface-metadata.shared"
import {
  TCI_LAM_AGGREGATOR_SYMBOL,
  TCI_LAM_HANDOFF_SYMBOL,
} from "./tci-attendance-handoff.shared"

export const TCI_MISSING_PUNCH_CODES = [
  "missing_clock_in",
  "missing_clock_out",
  "missing_break_end",
] as const

export type TciMissingPunchCode = (typeof TCI_MISSING_PUNCH_CODES)[number]

export const TCI_MISSING_PUNCH_LAM_HANDOFF_SYMBOL = TCI_LAM_HANDOFF_SYMBOL

export const TCI_MISSING_PUNCH_AGGREGATOR_SYMBOL = TCI_LAM_AGGREGATOR_SYMBOL

export const TCI_MISSING_PUNCH_SNAPSHOT_FIELD =
  "calculationSnapshot.exceptions" as const

export type TciMissingPunchDetectionSurface =
  | {
      readonly door: "lam_handoff"
      readonly symbol: typeof TCI_MISSING_PUNCH_LAM_HANDOFF_SYMBOL
      readonly requirementCodes: readonly ["HRM-TCI-017", "HRM-TCI-021"]
    }
  | {
      readonly door: "pattern_b_ui"
      readonly symbol: typeof TCI_LIST_SURFACE_IDS.missingPunchFindings
      readonly requirementCodes: readonly ["HRM-TCI-017", "HRM-TCI-024"]
    }
  | {
      readonly door: "pattern_b_ui"
      readonly symbol: typeof TCI_STAT_SURFACE_KEY
      readonly requirementCodes: readonly ["HRM-TCI-017"]
    }
  | {
      readonly door: "report_csv"
      readonly symbol: "missing_punch"
      readonly requirementCodes: readonly ["HRM-TCI-017", "HRM-TCI-028"]
    }

export const TCI_MISSING_PUNCH_DETECTION_SURFACES = [
  {
    door: "lam_handoff",
    symbol: TCI_MISSING_PUNCH_LAM_HANDOFF_SYMBOL,
    requirementCodes: ["HRM-TCI-017", "HRM-TCI-021"],
  },
  {
    door: "pattern_b_ui",
    symbol: TCI_LIST_SURFACE_IDS.missingPunchFindings,
    requirementCodes: ["HRM-TCI-017", "HRM-TCI-024"],
  },
  {
    door: "pattern_b_ui",
    symbol: TCI_STAT_SURFACE_KEY,
    requirementCodes: ["HRM-TCI-017"],
  },
  {
    door: "report_csv",
    symbol: "missing_punch",
    requirementCodes: ["HRM-TCI-017", "HRM-TCI-028"],
  },
] as const satisfies readonly TciMissingPunchDetectionSurface[]

export type TciDeviceEventForMissingPunchDetection = {
  readonly eventType: string
  readonly occurredAt: Date
}

export type TciMissingPunchFinding = {
  readonly code: TciMissingPunchCode
  readonly message: string
  readonly metadata?: Readonly<Record<string, string>>
}

const PAIRING_EVENT_TYPES = new Set([
  "clock_in",
  "clock_out",
  "break_start",
  "break_end",
])

export function isTciMissingPunchCode(
  value: string
): value is TciMissingPunchCode {
  return (TCI_MISSING_PUNCH_CODES as readonly string[]).includes(value)
}

export function extractMissingPunchCodesFromAttendanceSnapshot(
  snapshot: unknown
): readonly TciMissingPunchCode[] {
  if (!snapshot || typeof snapshot !== "object") {
    return []
  }
  const exceptions = (snapshot as { exceptions?: unknown }).exceptions
  if (!Array.isArray(exceptions)) {
    return []
  }
  const codes = new Set<TciMissingPunchCode>()
  for (const entry of exceptions) {
    if (!entry || typeof entry !== "object") continue
    const code = (entry as { code?: string }).code
    if (typeof code === "string" && isTciMissingPunchCode(code)) {
      codes.add(code)
    }
  }
  return [...codes]
}

/**
 * Pure stream detector for device punch sequences (same missing-pair semantics as LAM aggregator flush).
 */
export function detectMissingPunchesInDeviceEventSequence(
  events: readonly TciDeviceEventForMissingPunchDetection[]
): readonly TciMissingPunchFinding[] {
  const ordered = [...events]
    .filter((event) => PAIRING_EVENT_TYPES.has(event.eventType))
    .sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime())

  const findings: TciMissingPunchFinding[] = []
  let openClockIn: Date | null = null
  let openBreakStart: Date | null = null

  for (const event of ordered) {
    switch (event.eventType) {
      case "clock_in": {
        if (openClockIn !== null) {
          findings.push({
            code: "missing_clock_out",
            message: "Clock-in is open and requires a matching clock-out.",
            metadata: {
              clockInAt: openClockIn.toISOString(),
            },
          })
        }
        openClockIn = event.occurredAt
        break
      }
      case "clock_out": {
        openClockIn = null
        break
      }
      case "break_start": {
        if (openBreakStart !== null) {
          findings.push({
            code: "missing_break_end",
            message: "Break start is open and requires a matching break end.",
            metadata: {
              breakStartAt: openBreakStart.toISOString(),
            },
          })
        }
        openBreakStart = event.occurredAt
        break
      }
      case "break_end": {
        openBreakStart = null
        break
      }
      default:
        break
    }
  }

  if (openClockIn !== null) {
    findings.push({
      code: "missing_clock_out",
      message: "Clock-in is open and requires a matching clock-out.",
      metadata: { clockInAt: openClockIn.toISOString() },
    })
  }
  if (openBreakStart !== null) {
    findings.push({
      code: "missing_break_end",
      message: "Break start is open and requires a matching break end.",
      metadata: { breakStartAt: openBreakStart.toISOString() },
    })
  }

  return findings
}

export function assertHrmTci017MissingPunchDetection(): void {
  if (TCI_MISSING_PUNCH_CODES.length !== 3) {
    throw new Error("HRM-TCI-017 requires three missing-punch codes")
  }

  for (const surface of TCI_MISSING_PUNCH_DETECTION_SURFACES) {
    if (!surface.requirementCodes.includes("HRM-TCI-017")) {
      throw new Error(
        `TCI missing-punch surface "${surface.symbol}" must cite HRM-TCI-017`
      )
    }
  }

  const streamOnly = detectMissingPunchesInDeviceEventSequence([
    { eventType: "clock_in", occurredAt: new Date("2026-03-01T08:00:00.000Z") },
  ])
  if (streamOnly.length !== 1 || streamOnly[0]?.code !== "missing_clock_out") {
    throw new Error("open clock-in must detect missing_clock_out")
  }

  const breakOnly = detectMissingPunchesInDeviceEventSequence([
    {
      eventType: "break_start",
      occurredAt: new Date("2026-03-01T12:00:00.000Z"),
    },
  ])
  if (breakOnly.length !== 1 || breakOnly[0]?.code !== "missing_break_end") {
    throw new Error("open break_start must detect missing_break_end")
  }

  const snapshotCodes = extractMissingPunchCodesFromAttendanceSnapshot({
    exceptions: [
      { code: "missing_clock_in", severity: "critical" },
      { code: "late_arrival", severity: "attention" },
    ],
  })
  if (snapshotCodes.length !== 1 || snapshotCodes[0] !== "missing_clock_in") {
    throw new Error("snapshot extractor must return only missing-punch codes")
  }
}
