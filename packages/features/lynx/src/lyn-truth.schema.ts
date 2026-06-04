import { z } from "zod";
import {
  lynxClaimValidationResultSchema,
  lynxQualityGateResultSchema,
} from "./lyn-evidence-trust.schema";

export const lynxTruthRetrievalStatusSchema = z.enum([
  "ok",
  "no_evidence",
  "degraded",
]);
export type LynxTruthRetrievalStatus = z.infer<
  typeof lynxTruthRetrievalStatusSchema
>;

export const lynxTruthEvidencePassageSchema = z
  .object({
    passage: z.number().int().positive(),
    id: z.string(),
    title: z.string(),
    excerpt: z.string(),
    distance: z.number().optional(),
    lexicalScore: z.number().optional(),
    fusedRank: z.number().optional(),
  })
  .strict();
export type LynxTruthEvidencePassage = z.infer<
  typeof lynxTruthEvidencePassageSchema
>;

export const lynxTruthEvidenceDataSchema = z
  .object({
    query: z.string(),
    chunkCount: z.number().int().nonnegative(),
    passages: z.array(lynxTruthEvidencePassageSchema),
  })
  .strict();
export type LynxTruthEvidenceData = z.infer<typeof lynxTruthEvidenceDataSchema>;

export const lynxTruthQualityGateDataSchema = z
  .object({
    claims: z.array(lynxClaimValidationResultSchema),
    gate: lynxQualityGateResultSchema,
  })
  .strict();
export type LynxTruthQualityGateData = z.infer<
  typeof lynxTruthQualityGateDataSchema
>;

export const lynxTruthRetrievalStateDataSchema = z
  .object({
    status: lynxTruthRetrievalStatusSchema,
    chunkCount: z.number().int().nonnegative(),
    degradedReason: z.string().optional(),
  })
  .strict();
export type LynxTruthRetrievalStateData = z.infer<
  typeof lynxTruthRetrievalStateDataSchema
>;
