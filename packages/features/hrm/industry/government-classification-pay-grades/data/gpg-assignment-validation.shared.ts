import type { HrmGpgMovementType } from "../schemas/gpg-workflow-state.shared"

export type GpgAssignmentValidationInput = {
  readonly movementType: HrmGpgMovementType
  readonly fromPayGradeId: string
  readonly fromStep: number
  readonly toPayGradeId: string
  readonly toStep: number
  readonly toPayGradeClassificationId: string
  readonly targetClassificationId: string
  readonly hasSalaryTableRow: boolean
  readonly retentionAmount: string | null
}

export type GpgAssignmentValidationFailure = {
  readonly ok: false
  readonly code:
    | "MISSING_SALARY_ROW"
    | "CLASSIFICATION_MISMATCH"
    | "PROMOTION_DIRECTION"
    | "DEMOTION_DIRECTION"
    | "RETENTION_AMOUNT_REQUIRED"
    | "ACTING_STEP"
  readonly message: string
}

export type GpgAssignmentValidationResult =
  | { readonly ok: true }
  | GpgAssignmentValidationFailure

function sameGradeAndStep(
  fromPayGradeId: string,
  fromStep: number,
  toPayGradeId: string,
  toStep: number
) {
  return fromPayGradeId === toPayGradeId && fromStep === toStep
}

function isStepIncreaseWithinGrade(
  fromStep: number,
  toStep: number,
  sameGrade: boolean
) {
  return sameGrade && toStep > fromStep
}

function isStepDecreaseWithinGrade(
  fromStep: number,
  toStep: number,
  sameGrade: boolean
) {
  return sameGrade && toStep < fromStep
}

/**
 * Pure eligibility checks for grade/step/table combos (HRM-GPG-022–023).
 * Expected failures are return values — not thrown.
 */
export function validateGpgGradeMovementAssignment(
  input: GpgAssignmentValidationInput
): GpgAssignmentValidationResult {
  if (!input.hasSalaryTableRow) {
    return {
      ok: false,
      code: "MISSING_SALARY_ROW",
      message:
        "No salary table row exists for the target pay grade and step on the selected version.",
    }
  }

  const sameGrade = input.fromPayGradeId === input.toPayGradeId
  const samePosition = sameGradeAndStep(
    input.fromPayGradeId,
    input.fromStep,
    input.toPayGradeId,
    input.toStep
  )

  switch (input.movementType) {
    case "reclassification": {
      if (input.toPayGradeClassificationId !== input.targetClassificationId) {
        return {
          ok: false,
          code: "CLASSIFICATION_MISMATCH",
          message:
            "Target pay grade must belong to the selected classification.",
        }
      }
      return { ok: true }
    }
    case "promotion": {
      if (
        !isStepIncreaseWithinGrade(input.fromStep, input.toStep, sameGrade) &&
        samePosition
      ) {
        return {
          ok: false,
          code: "PROMOTION_DIRECTION",
          message:
            "Promotion requires a higher step on the same grade or a different pay grade.",
        }
      }
      return { ok: true }
    }
    case "demotion": {
      if (
        !isStepDecreaseWithinGrade(input.fromStep, input.toStep, sameGrade) &&
        samePosition
      ) {
        return {
          ok: false,
          code: "DEMOTION_DIRECTION",
          message:
            "Demotion requires a lower step on the same grade or a different pay grade.",
        }
      }
      return { ok: true }
    }
    case "pay_retention": {
      if (!input.retentionAmount?.trim()) {
        return {
          ok: false,
          code: "RETENTION_AMOUNT_REQUIRED",
          message: "Pay retention requires a saved pay reference amount.",
        }
      }
      return { ok: true }
    }
    case "acting_higher_duty": {
      if (sameGrade && input.toStep < input.fromStep) {
        return {
          ok: false,
          code: "ACTING_STEP",
          message:
            "Acting higher duty cannot reduce step on the same pay grade.",
        }
      }
      return { ok: true }
    }
    case "step_increase":
      return { ok: true }
    default: {
      const _exhaustive: never = input.movementType
      return _exhaustive
    }
  }
}
