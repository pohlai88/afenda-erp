import type { RwsCoverageGapRow } from "./rws.types.shared"

export type CoverageSlotCompareInput = {
  readonly coverageSlotId: string
  readonly slotDate: string
  readonly hourOfDay: number
  readonly retailRole: RwsCoverageGapRow["retailRole"]
  readonly requiredHeadcount: number
  readonly scheduledHeadcount: number
}

export function compareCoverageSlots(
  slots: readonly CoverageSlotCompareInput[]
): RwsCoverageGapRow[] {
  return slots.map((slot) => {
    const gap = slot.requiredHeadcount - slot.scheduledHeadcount
    let status: RwsCoverageGapRow["status"] = "balanced"
    if (gap > 0) status = "understaffed"
    else if (gap < 0) status = "overstaffed"

    return {
      coverageSlotId: slot.coverageSlotId,
      slotDate: slot.slotDate,
      hourOfDay: slot.hourOfDay,
      retailRole: slot.retailRole,
      requiredHeadcount: slot.requiredHeadcount,
      scheduledHeadcount: slot.scheduledHeadcount,
      gap: Math.abs(gap),
      status,
    }
  })
}

export function countUnderstaffedSlots(
  gaps: readonly RwsCoverageGapRow[]
): number {
  return gaps.filter((row) => row.status === "understaffed").length
}
