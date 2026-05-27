import { moduleIds } from "@afenda/config/module-ids";
import { z } from "zod";

export const operationalModuleIds = [...moduleIds, "lms"] as const;

export const operationalModuleIdSchema = z.enum(operationalModuleIds);
export const operationRiskLevelSchema = z.enum(["low", "medium", "high"]);
export const operationConfidenceLevelSchema = z.enum([
  "low",
  "medium",
  "high",
]);

export const groundedEvidenceSchema = z.object({
  id: z.string().min(1).max(120),
  moduleId: operationalModuleIdSchema,
  sourceType: z.enum([
    "record",
    "work-item",
    "document",
    "kpi",
    "metadata",
    "inference",
  ]),
  sourceId: z.string().min(1).max(160),
  label: z.string().min(1).max(160),
  signal: z.string().min(1).max(400),
  confidence: z.number().int().min(0).max(100),
});

export const aiContextDataCardSchema = z.object({
  id: z.string().min(1).max(120),
  moduleId: operationalModuleIdSchema,
  title: z.string().min(1).max(160),
  type: z.enum(["metric", "record", "queue", "document", "kpi", "summary"]),
  source: z.string().min(1).max(160),
  detail: z.string().min(1).max(500),
  value: z.string().max(120).optional(),
  data: z.record(z.string(), z.unknown()).optional(),
});

export const groundingReportSchema = z.object({
  evidenceCount: z.number().int().nonnegative(),
  directSourceCount: z.number().int().nonnegative(),
  inferredSourceCount: z.number().int().nonnegative(),
  missingData: z.array(z.string().min(1).max(180)).max(12),
  warnings: z.array(z.string().min(1).max(240)).max(12),
});

export const confidenceBreakdownSchema = z.object({
  overall: z.number().int().min(0).max(100),
  level: operationConfidenceLevelSchema,
  dataQuality: z.number().int().min(0).max(100),
  intentClarity: z.number().int().min(0).max(100),
  taskComplexity: z.number().int().min(0).max(100),
  historicalAccuracy: z.number().int().min(0).max(100),
  groundingStrength: z.number().int().min(0).max(100),
  requiresHumanReview: z.boolean(),
  explanation: z.string().min(1).max(500),
});

export const aiContextAssemblySchema = z.object({
  organizationId: z.string().min(1),
  generatedAt: z.string().datetime(),
  contextText: z.string().min(1),
  estimatedTokens: z.number().int().nonnegative(),
  maxTokens: z.number().int().positive(),
  truncated: z.boolean(),
  warnings: z.array(z.string()).max(12),
  dataCards: z.array(aiContextDataCardSchema).max(80),
  evidence: z.array(groundedEvidenceSchema).max(80),
  grounding: groundingReportSchema,
});

export const actionDiffSchema = z.object({
  summary: z.string().min(1).max(500),
  before: z.record(z.string(), z.unknown()),
  after: z.record(z.string(), z.unknown()),
  affectedRecords: z.array(z.string().min(1).max(160)).max(40),
  creates: z.number().int().nonnegative(),
  updates: z.number().int().nonnegative(),
  deletes: z.number().int().nonnegative(),
});

export const riskAssessmentSchema = z.object({
  riskLevel: operationRiskLevelSchema,
  score: z.number().int().min(0).max(100),
  reasons: z.array(z.string().min(1).max(180)).min(1).max(10),
  requiredHumanChecks: z.array(z.string().min(1).max(160)).min(1).max(10),
  canAutoApply: z.boolean(),
});

export const sandboxStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected",
  "discarded",
]);

export const actionSandboxSchema = z.object({
  id: z.string().min(1).max(120),
  organizationId: z.string().min(1),
  moduleId: operationalModuleIdSchema,
  actionType: z.string().min(1).max(120),
  title: z.string().min(1).max(160),
  proposedBy: z.enum(["ai", "user"]),
  status: sandboxStatusSchema,
  diff: actionDiffSchema,
  riskAssessment: riskAssessmentSchema,
  sourceEvidence: z.array(groundedEvidenceSchema).max(40),
  rollbackMetadata: z
    .object({
      reversible: z.boolean(),
      strategy: z.string().min(1).max(240),
    })
    .optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  approvedAt: z.string().datetime().optional(),
  rejectedAt: z.string().datetime().optional(),
  rejectionReason: z.string().min(1).max(240).optional(),
});

export const operationalSkillSchema = z.object({
  id: z.string().min(1).max(120),
  moduleId: operationalModuleIdSchema,
  label: z.string().min(1).max(160),
  description: z.string().min(1).max(500),
  problemTypes: z.array(z.string().min(1).max(120)).min(1).max(12),
  requiredCapabilities: z.array(z.string().min(1).max(120)).min(1).max(8),
  inputSchemaName: z.string().min(1).max(120),
  outputSchemaName: z.string().min(1).max(120),
  readToolNames: z.array(z.string().min(1).max(120)).max(12),
  draftToolNames: z.array(z.string().min(1).max(120)).max(12),
  approvalToolNames: z.array(z.string().min(1).max(120)).max(12),
  approvalPolicy: z.enum([
    "read-only",
    "draft-only",
    "human-approval-required",
  ]),
});

export type OperationalModuleId = z.infer<typeof operationalModuleIdSchema>;
export type GroundedEvidence = z.infer<typeof groundedEvidenceSchema>;
export type AiContextDataCard = z.infer<typeof aiContextDataCardSchema>;
export type GroundingReport = z.infer<typeof groundingReportSchema>;
export type ConfidenceBreakdown = z.infer<typeof confidenceBreakdownSchema>;
export type AiContextAssembly = z.infer<typeof aiContextAssemblySchema>;
export type ActionDiff = z.infer<typeof actionDiffSchema>;
export type RiskAssessment = z.infer<typeof riskAssessmentSchema>;
export type ActionSandbox = z.infer<typeof actionSandboxSchema>;
export type SandboxStatus = z.infer<typeof sandboxStatusSchema>;
export type OperationalSkill = z.infer<typeof operationalSkillSchema>;
