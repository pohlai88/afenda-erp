import { moduleIds } from "@afenda/config/module-ids";
import { solutionWorkflowIds } from "@afenda/kernel";
import { z } from "zod";
import { lynxQualityGateResultSchema } from "./lyn-evidence-trust.schema";

export const LYNX_OUTCOME_MONITOR_IDS = [
  "finance-control-watch",
  "approval-throughput-watch",
  "audit-readiness-watch",
] as const;

export const lynxOutcomeMonitorStatusSchema = z.enum([
  "healthy",
  "watch",
  "blocked",
]);

export const lynxOutcomeMonitorSeveritySchema = z.enum([
  "info",
  "review",
  "critical",
]);

export const lynxOutcomeMonitorSignalSchema = z
  .object({
    id: z.string(),
    label: z.string(),
    status: lynxOutcomeMonitorStatusSchema,
    severity: lynxOutcomeMonitorSeveritySchema,
    value: z.string().optional(),
    detail: z.string(),
  })
  .strict();

export const lynxOutcomeEvidenceReferenceSchema = z
  .object({
    id: z.string(),
    type: z.enum([
      "record",
      "work-item",
      "document",
      "readiness",
      "quality-gate",
      "proposal",
      "sandbox",
    ]),
    moduleId: z.enum(moduleIds),
    label: z.string(),
    signal: z.string(),
    href: z.string().optional(),
  })
  .strict();

export const lynxOutcomeMonitorResultSchema = z
  .object({
    monitorId: z.enum(LYNX_OUTCOME_MONITOR_IDS),
    workflowId: z.enum(solutionWorkflowIds),
    status: lynxOutcomeMonitorStatusSchema,
    severity: lynxOutcomeMonitorSeveritySchema,
    summary: z.string(),
    signals: z.array(lynxOutcomeMonitorSignalSchema),
    evidenceReferences: z.array(lynxOutcomeEvidenceReferenceSchema),
    qualityGateSummary: lynxQualityGateResultSchema,
    nextRecommendedStep: z.string(),
    generatedAt: z.string().datetime(),
  })
  .strict();

export type LynxOutcomeMonitorId = (typeof LYNX_OUTCOME_MONITOR_IDS)[number];
export type LynxOutcomeMonitorStatus = z.infer<
  typeof lynxOutcomeMonitorStatusSchema
>;
export type LynxOutcomeMonitorSeverity = z.infer<
  typeof lynxOutcomeMonitorSeveritySchema
>;
export type LynxOutcomeMonitorSignal = z.infer<
  typeof lynxOutcomeMonitorSignalSchema
>;
export type LynxOutcomeEvidenceReference = z.infer<
  typeof lynxOutcomeEvidenceReferenceSchema
>;
export type LynxOutcomeMonitorResult = z.infer<
  typeof lynxOutcomeMonitorResultSchema
>;
