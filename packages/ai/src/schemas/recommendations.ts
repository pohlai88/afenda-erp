import { moduleIds } from "@afenda/config/module-ids";
import { z } from "zod";

export const workspaceSummarySchema = z.object({
  moduleId: z.enum(moduleIds),
  summary: z.string().min(20).max(1200),
  signals: z
    .array(
      z.object({
        label: z.string().min(1).max(120),
        severity: z.enum(["info", "warning", "critical"]),
        detail: z.string().min(1).max(300),
      }),
    )
    .min(1)
    .max(8),
  nextActions: z.array(z.string().min(1).max(180)).min(1).max(6),
  confidence: z.number().int().min(0).max(100),
});

export const approvalRecommendationSchema = z.object({
  moduleId: z.enum(moduleIds),
  proposedAction: z.enum(["approve", "reject", "escalate", "request-info"]),
  rationale: z.string().min(10).max(1000),
  riskLevel: z.enum(["low", "medium", "high"]),
  requiredHumanChecks: z.array(z.string().min(1).max(160)).min(1).max(8),
});

export const anomalyExplanationSchema = z.object({
  moduleId: z.enum(moduleIds),
  metric: z.string().min(1).max(120),
  explanation: z.string().min(20).max(1200),
  likelyDrivers: z.array(z.string().min(1).max(180)).min(1).max(8),
  recommendedChecks: z.array(z.string().min(1).max(180)).min(1).max(8),
  confidence: z.number().int().min(0).max(100),
});

export const reportNarrativeSchema = z.object({
  moduleId: z.enum(moduleIds),
  title: z.string().min(1).max(160),
  executiveSummary: z.string().min(20).max(1200),
  highlights: z.array(z.string().min(1).max(220)).min(1).max(8),
  risks: z.array(z.string().min(1).max(220)).max(8),
  nextActions: z.array(z.string().min(1).max(220)).min(1).max(8),
});

export type WorkspaceSummary = z.infer<typeof workspaceSummarySchema>;
export type ApprovalRecommendation = z.infer<
  typeof approvalRecommendationSchema
>;
export type AnomalyExplanation = z.infer<typeof anomalyExplanationSchema>;
export type ReportNarrative = z.infer<typeof reportNarrativeSchema>;
