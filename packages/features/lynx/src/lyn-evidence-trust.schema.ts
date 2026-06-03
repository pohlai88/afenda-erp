import { z } from "zod";

export const lynxClaimValidationStatusSchema = z.enum([
  "supported",
  "partially_supported",
  "unsupported",
  "declined",
]);

export const lynxQualityGateStatusSchema = z.enum([
  "passed",
  "review",
  "failed",
]);

export const lynxClaimSchema = z
  .object({
    id: z.string(),
    text: z.string(),
    citedEvidenceIds: z.array(z.string()),
  })
  .strict();

export const lynxClaimEvidenceLinkSchema = z
  .object({
    claimId: z.string(),
    evidenceId: z.string(),
    passage: z.number().int().positive().optional(),
    title: z.string().optional(),
    excerpt: z.string().optional(),
  })
  .strict();

export const lynxClaimValidationResultSchema = z
  .object({
    claim: lynxClaimSchema,
    status: lynxClaimValidationStatusSchema,
    evidenceLinks: z.array(lynxClaimEvidenceLinkSchema),
    reason: z.string(),
  })
  .strict();

export const lynxQualityGateResultSchema = z
  .object({
    status: lynxQualityGateStatusSchema,
    unsupportedClaimCount: z.number().int().min(0),
    citationPrecision: z.number().min(0).max(1),
    noAnswerCorrectness: z.number().min(0).max(1),
    promptInjectionResilience: z.number().min(0).max(1),
    reasons: z.array(z.string()),
    generatedAt: z.string(),
  })
  .strict();

export type LynxClaimValidationStatus = z.infer<
  typeof lynxClaimValidationStatusSchema
>;
export type LynxQualityGateStatus = z.infer<typeof lynxQualityGateStatusSchema>;
export type LynxClaim = z.infer<typeof lynxClaimSchema>;
export type LynxClaimEvidenceLink = z.infer<typeof lynxClaimEvidenceLinkSchema>;
export type LynxClaimValidationResult = z.infer<
  typeof lynxClaimValidationResultSchema
>;
export type LynxQualityGateResult = z.infer<typeof lynxQualityGateResultSchema>;
