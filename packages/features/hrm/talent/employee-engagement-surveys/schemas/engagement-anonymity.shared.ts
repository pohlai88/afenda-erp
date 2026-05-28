import type { HrmEngagementAnonymityMode } from "./engagement-workflow.shared"

/** Default k-anonymity floor for anonymous surveys (HRM-ENG-008). */
export const DEFAULT_ENGAGEMENT_MIN_SEGMENT_RESPONSES = 5

const MAX_MIN_SEGMENT_RESPONSES = 100

export function resolveEffectiveMinSegmentResponses(
  anonymityMode: HrmEngagementAnonymityMode,
  raw: number | null | undefined
): number | null {
  if (anonymityMode === "named") return null
  if (raw == null || Number.isNaN(raw)) {
    return DEFAULT_ENGAGEMENT_MIN_SEGMENT_RESPONSES
  }
  return Math.min(MAX_MIN_SEGMENT_RESPONSES, Math.max(1, Math.floor(raw)))
}

/** HRM-ENG-032 — segment hidden in anonymous reporting when below threshold. */
export function shouldSuppressAnonymousSegment(input: {
  responseCount: number
  minSegmentResponses: number
}): boolean {
  return input.responseCount < input.minSegmentResponses
}

/** HRM-ENG-009 — admin views must not expose individual anonymous answers. */
export function adminMayViewIndividualResponseContent(
  anonymityMode: HrmEngagementAnonymityMode
): boolean {
  return anonymityMode === "named"
}

/** Named mode allows linking responses to employees; anonymous forbids it. */
export function namedResponsesAllowed(
  anonymityMode: HrmEngagementAnonymityMode
): boolean {
  return anonymityMode === "named"
}

/** HRM-ENG-032 — slice 4 analytics calls this; slice 2 defines the contract. */
export function applyAnonymousSegmentSuppression<
  T extends {
    responseCount: number
    suppressed?: boolean
  },
>(
  segments: readonly T[],
  minSegmentResponses: number
): Array<T & { suppressed: boolean }> {
  const threshold = Math.max(1, minSegmentResponses)
  return segments.map((segment) => ({
    ...segment,
    suppressed: segment.responseCount < threshold,
  }))
}

export function validateMinSegmentResponsesForMode(input: {
  anonymityMode: HrmEngagementAnonymityMode
  minSegmentResponses: number | null | undefined
}): { ok: true; value: number | null } | { ok: false; message: string } {
  if (input.anonymityMode === "named") {
    return { ok: true, value: null }
  }
  if (
    input.minSegmentResponses != null &&
    (Number.isNaN(input.minSegmentResponses) || input.minSegmentResponses < 1)
  ) {
    return {
      ok: false,
      message: "Minimum segment size must be at least 1 for anonymous surveys.",
    }
  }
  const value = resolveEffectiveMinSegmentResponses(
    input.anonymityMode,
    input.minSegmentResponses
  )
  if (value == null || value < 1) {
    return {
      ok: false,
      message: "Minimum segment size must be at least 1 for anonymous surveys.",
    }
  }
  return { ok: true, value }
}
