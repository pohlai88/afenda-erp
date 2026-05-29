import type { HrmFrmTravelClass } from "../schemas/frm-workflow-state.shared"

export type FrmPerDiemEligibilityInput = {
  readonly travelClass: HrmFrmTravelClass
  readonly destinationCountry: string | null
  readonly durationDays: number
  readonly employeeCategoryRef: string | null
  readonly policyGroupRef: string | null
}

export type FrmPerDiemEligibilityResult = {
  readonly eligible: boolean
  readonly dayPortion: "partial" | "full" | "overnight"
  readonly reason: string | null
}

/**
 * Pure eligibility rules (HRM-FRM-015) — no payroll calculation.
 */
export function evaluateFrmPerDiemEligibility(
  input: FrmPerDiemEligibilityInput
): FrmPerDiemEligibilityResult {
  if (input.durationDays <= 0) {
    return {
      eligible: false,
      dayPortion: "partial",
      reason: "invalid_duration",
    }
  }

  if (input.travelClass === "local_field_visit" && input.durationDays < 1) {
    return {
      eligible: false,
      dayPortion: "partial",
      reason: "local_visit_too_short",
    }
  }

  const dayPortion =
    input.travelClass === "overnight" || input.travelClass === "cross_border"
      ? "overnight"
      : input.durationDays >= 1
        ? "full"
        : "partial"

  if (
    input.travelClass === "cross_border" &&
    !input.destinationCountry?.trim()
  ) {
    return {
      eligible: false,
      dayPortion,
      reason: "destination_country_required",
    }
  }

  return { eligible: true, dayPortion, reason: null }
}
