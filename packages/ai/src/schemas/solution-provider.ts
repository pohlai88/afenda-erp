import { moduleIds } from "@afenda/config/module-ids";
import { businessProblemTypes, solutionWorkflowIds } from "@afenda/domain";
import { z } from "zod";
import {
  actionSandboxSchema,
  confidenceBreakdownSchema,
  groundingReportSchema,
} from "./operations";

export { businessProblemTypes, solutionWorkflowIds };

export const confidenceLevels = ["low", "medium", "high"] as const;
export const riskLevels = ["low", "medium", "high"] as const;

export const businessProblemInputSchema = z.object({
  problemType: z.enum(businessProblemTypes),
  workflowId: z.enum(solutionWorkflowIds).default("negative_pnl_recovery"),
  moduleIds: z.array(z.enum(moduleIds)).min(1).max(8).optional(),
  period: z
    .object({
      from: z.string().trim().min(4).max(40),
      to: z.string().trim().min(4).max(40),
    })
    .optional(),
  userGoal: z.string().trim().min(10).max(800),
});

export const evidenceRecordSchema = z.object({
  moduleId: z.enum(moduleIds),
  recordId: z.string().min(1),
  label: z.string().min(1).max(160),
  signal: z.string().min(1).max(240),
});

export const rootCauseAnalysisSchema = z.object({
  id: z.string().min(1).max(80),
  title: z.string().min(1).max(140),
  moduleId: z.enum(moduleIds),
  severity: z.enum(riskLevels),
  confidence: z.enum(confidenceLevels),
  evidence: z.array(evidenceRecordSchema).min(1).max(8),
  confidenceBreakdown: confidenceBreakdownSchema.optional(),
  explanation: z.string().min(1).max(600),
  missingData: z.array(z.string().min(1).max(160)).max(6),
});

export const actionApprovalRequestSchema = z.object({
  required: z.boolean(),
  state: z.enum(["draft-only", "approval-required", "human-approved"]),
  reason: z.string().min(1).max(240),
});

export const actionCandidateSchema = z.object({
  id: z.string().min(1).max(80),
  title: z.string().min(1).max(140),
  moduleId: z.enum(moduleIds),
  ownerTeam: z.string().min(1).max(120),
  priority: z.enum(["low", "medium", "high"]),
  expectedImpact: z.string().min(1).max(240),
  riskLevel: z.enum(riskLevels),
  humanApproval: actionApprovalRequestSchema,
  sourceRecords: z.array(evidenceRecordSchema).max(8),
  confidenceBreakdown: confidenceBreakdownSchema.optional(),
  actionSandbox: actionSandboxSchema.optional(),
});

export const recoveryPlaybookSchema = z.object({
  workflowId: z.enum(solutionWorkflowIds),
  title: z.string().min(1).max(140),
  summary: z.string().min(1).max(700),
  orderedActions: z.array(actionCandidateSchema).min(1).max(8),
  kpisToWatch: z.array(z.string().min(1).max(120)).min(1).max(8),
  assumptions: z.array(z.string().min(1).max(180)).max(8),
});

export const kpiAnomalyExplanationSchema = z.object({
  metric: z.string().min(1).max(120),
  period: z.string().min(1).max(120),
  direction: z.enum(["improved", "declined", "flat", "unknown"]),
  likelyDrivers: z.array(z.string().min(1).max(180)).min(1).max(8),
  recommendedReview: z.string().min(1).max(240),
});

export const solutionProviderRunSchema = z.object({
  problem: businessProblemInputSchema,
  diagnosis: z.array(rootCauseAnalysisSchema).min(1).max(8),
  recoveryPlan: recoveryPlaybookSchema,
  anomalies: z.array(kpiAnomalyExplanationSchema).max(6),
  confidence: z.enum(confidenceLevels),
  confidenceBreakdown: confidenceBreakdownSchema.optional(),
  riskLevel: z.enum(riskLevels),
  sourceRecords: z.array(evidenceRecordSchema).max(16),
  grounding: groundingReportSchema.optional(),
  requiresApproval: z.boolean(),
});

export type BusinessProblemInput = z.infer<typeof businessProblemInputSchema>;
export type RootCauseAnalysis = z.infer<typeof rootCauseAnalysisSchema>;
export type RecoveryPlaybook = z.infer<typeof recoveryPlaybookSchema>;
export type ActionCandidate = z.infer<typeof actionCandidateSchema>;
export type ActionApprovalRequest = z.infer<typeof actionApprovalRequestSchema>;
export type SolutionProviderRun = z.infer<typeof solutionProviderRunSchema>;
export type KpiAnomalyExplanation = z.infer<typeof kpiAnomalyExplanationSchema>;
