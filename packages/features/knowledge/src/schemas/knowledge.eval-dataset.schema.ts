import { z } from "zod";

export const lynxEvalSetStatusSchema = z.enum(["draft", "active", "archived"]);
export const lynxEvalExpectedBehaviorSchema = z.enum(["answer", "decline"]);
export const lynxSemanticClaimGradeStatusSchema = z.enum([
  "supported",
  "partially_supported",
  "unsupported",
  "not_run",
]);

export const lynxSemanticClaimGradeSchema = z
  .object({
    status: lynxSemanticClaimGradeStatusSchema,
    score: z.number().min(0).max(1),
    reason: z.string(),
    model: z.string().optional(),
    generatedAt: z.string().datetime(),
  })
  .strict();

export const lynxEvalSetSchema = z
  .object({
    id: z.string(),
    evalSetId: z.string(),
    version: z.number().int().positive(),
    workflowId: z.string(),
    moduleId: z.string(),
    status: lynxEvalSetStatusSchema,
    description: z.string(),
    metadata: z.record(z.string(), z.unknown()).default({}),
  })
  .strict();

export const lynxEvalCaseSchema = z
  .object({
    id: z.string(),
    evalSetRowId: z.string(),
    caseId: z.string(),
    query: z.string().min(1),
    expectedEvidenceIds: z.array(z.string()),
    shouldAnswer: z.boolean(),
    containsPromptInjection: z.boolean(),
    expectedBehavior: lynxEvalExpectedBehaviorSchema,
    metadata: z.record(z.string(), z.unknown()).default({}),
  })
  .strict();

export const lynxEvalCaseResultSchema = z
  .object({
    id: z.string(),
    evalRunId: z.string().nullable(),
    evalSetRowId: z.string().nullable(),
    evalCaseRowId: z.string().nullable(),
    caseId: z.string(),
    query: z.string(),
    observedAnswer: z.string(),
    retrievedEvidenceIds: z.array(z.string()),
    metrics: z.record(z.string(), z.unknown()),
    failureReasons: z.array(z.string()),
    semanticGrade: lynxSemanticClaimGradeSchema.nullable(),
    representativeFailure: z.boolean(),
    metadata: z.record(z.string(), z.unknown()).default({}),
    createdAt: z.string().datetime(),
  })
  .strict();

export type LynxEvalSet = z.infer<typeof lynxEvalSetSchema>;
export type LynxEvalCase = z.infer<typeof lynxEvalCaseSchema>;
export type LynxEvalCaseResult = z.infer<typeof lynxEvalCaseResultSchema>;
export type LynxSemanticClaimGrade = z.infer<
  typeof lynxSemanticClaimGradeSchema
>;
