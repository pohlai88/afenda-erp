import { z } from "zod"

const gpgGradeMovementDraftWizardSchema = z.object({
  classificationId: z.string().uuid(),
  salaryTableVersionId: z.string().uuid(),
  payBandId: z.string().uuid().nullable(),
})

export type GpgGradeMovementDraftWizard = z.infer<
  typeof gpgGradeMovementDraftWizardSchema
>

const gpgMovementDraftEnvelopeSchema = z.object({
  gpgDraftWizard: gpgGradeMovementDraftWizardSchema,
})

export function encodeGpgGradeMovementDraftWizard(
  wizard: GpgGradeMovementDraftWizard
): Record<string, unknown> {
  return { gpgDraftWizard: wizard }
}

export function decodeGpgGradeMovementDraftWizard(
  audit7w1h: unknown
): GpgGradeMovementDraftWizard | null {
  if (!audit7w1h || typeof audit7w1h !== "object") return null
  const parsed = gpgMovementDraftEnvelopeSchema.safeParse(audit7w1h)
  return parsed.success ? parsed.data.gpgDraftWizard : null
}
