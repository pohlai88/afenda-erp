import { moduleIds } from "@afenda/config/module-ids";
import { z } from "zod";
import { lynxReadinessStatusSchema } from "./readiness-contract";

export const LYNX_ERP_READ_TOOL_IDS = [
  "inspectFinanceSignals",
  "inspectApprovalControls",
  "inspectAuditReadiness",
] as const;

export const lynxErpReadToolInputSchema = z
  .object({
    limit: z.number().int().min(1).max(10).default(5),
    includeEvidence: z.boolean().default(true),
  })
  .strict();

export const lynxErpReadSignalSchema = z
  .object({
    id: z.string(),
    moduleId: z.enum(moduleIds),
    label: z.string(),
    status: lynxReadinessStatusSchema,
    value: z.string().optional(),
    detail: z.string(),
  })
  .strict();

export const lynxErpReadEvidenceSchema = z
  .object({
    id: z.string(),
    type: z.enum([
      "record",
      "work-item",
      "document",
      "saved-view",
      "readiness",
    ]),
    moduleId: z.enum(moduleIds),
    label: z.string(),
    signal: z.string(),
    href: z.string().optional(),
  })
  .strict();

export const lynxErpReadModuleSummarySchema = z
  .object({
    moduleId: z.enum(moduleIds),
    moduleLabel: z.string(),
    readinessStatus: lynxReadinessStatusSchema,
    dataMode: z.string(),
    fallbackApplied: z.boolean(),
    stats: z
      .object({
        recordCount: z.number().int().nonnegative(),
        workItemCount: z.number().int().nonnegative(),
        highPriorityWorkItemCount: z.number().int().nonnegative(),
        documentCount: z.number().int().nonnegative(),
        savedViewCount: z.number().int().nonnegative(),
      })
      .strict(),
  })
  .strict();

export const lynxErpReadToolOutputSchema = z
  .object({
    source: z.literal("tenant-erp-read-tool"),
    organizationId: z.string(),
    toolName: z.enum(LYNX_ERP_READ_TOOL_IDS),
    generatedAt: z.string().datetime(),
    readinessStatus: lynxReadinessStatusSchema,
    summary: z.string(),
    modules: z.array(lynxErpReadModuleSummarySchema),
    signals: z.array(lynxErpReadSignalSchema),
    evidence: z.array(lynxErpReadEvidenceSchema),
    missingData: z.array(z.string()),
    safeNextActions: z.array(z.string()),
  })
  .strict();

export type LynxErpReadToolInput = z.infer<
  typeof lynxErpReadToolInputSchema
>;
export type LynxErpReadToolOutput = z.infer<
  typeof lynxErpReadToolOutputSchema
>;
export type LynxErpReadEvidence = z.infer<typeof lynxErpReadEvidenceSchema>;
