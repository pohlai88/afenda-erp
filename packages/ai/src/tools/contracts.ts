import {
  approvalToolModuleIds,
  moduleIds,
} from "@afenda/config/module-ids";
import { z } from "zod";
import { actionSandboxSchema } from "../schemas/operations";

const toolRecordSchema = z.object({
  id: z.string(),
  reference: z.string(),
  title: z.string(),
  recordType: z.string(),
  status: z.string(),
  owner: z.string(),
  metadataSummary: z.string(),
});

const toolDocumentSchema = z.object({
  id: z.string(),
  title: z.string(),
});

export const moduleSummaryToolInputSchema = z.object({
  moduleId: z.enum(moduleIds),
});

export const recordSearchToolInputSchema = z.object({
  moduleId: z.enum(moduleIds),
  query: z.string().trim().min(2).max(160),
  limit: z.number().int().min(1).max(10).default(5),
});

export const documentLookupToolInputSchema = z
  .object({
    moduleId: z.enum(moduleIds),
    documentId: z.string().trim().min(1).max(160).optional(),
    titleQuery: z.string().trim().min(2).max(160).optional(),
    limit: z.number().int().min(1).max(10).default(5),
  })
  .refine((input) => input.documentId || input.titleQuery, {
    message: "Provide documentId or titleQuery.",
    path: ["documentId"],
  });

export const taskDraftingToolInputSchema = z.object({
  moduleId: z.enum(moduleIds),
  objective: z.string().trim().min(10).max(500),
  priority: z.enum(["low", "medium", "high"]),
});

export const approvalToolInputSchema = z.object({
  workItemId: z.string().trim().min(1).max(160).optional(),
  moduleId: z.enum(approvalToolModuleIds),
  proposedAction: z.enum(["approve", "reject", "escalate", "request-info"]),
  rationale: z.string().trim().min(10).max(1000),
  riskLevel: z.enum(["low", "medium", "high"]),
  requiredHumanChecks: z.array(z.string().trim().min(1).max(160)).min(1).max(8),
});

export const approvalToolOutputSchema = z.object({
  proposalId: z.string().min(1),
  status: z.enum(["approved"]),
  approvalState: z.enum(["human-approved"]),
  proposedAction: approvalToolInputSchema.shape.proposedAction,
  riskLevel: approvalToolInputSchema.shape.riskLevel,
  rationale: z.string().min(1),
  metadata: z.object({
    source: z.literal("ai-tool"),
    moduleId: z.enum(approvalToolModuleIds),
    workItemId: z.string().nullable(),
  }),
});

export const solutionActionProposalToolInputSchema = z.object({
  moduleId: z.enum(moduleIds),
  title: z.string().trim().min(8).max(140),
  rationale: z.string().trim().min(20).max(1200),
  riskLevel: z.enum(["low", "medium", "high"]),
  expectedImpact: z.string().trim().min(8).max(240),
  sourceRecordIds: z.array(z.string().trim().min(1).max(160)).min(1).max(12),
  requiredHumanChecks: z.array(z.string().trim().min(1).max(160)).min(1).max(8),
});

export const solutionActionProposalToolOutputSchema = z.object({
  proposalId: z.string().min(1),
  status: z.enum(["approved"]),
  approvalState: z.enum(["human-approved"]),
  moduleId: z.enum(moduleIds),
  title: z.string().min(1),
  riskLevel: z.enum(["low", "medium", "high"]),
  metadata: z.object({
    source: z.literal("solution-provider-tool"),
    sourceRecordIds: z.array(z.string()),
    requiredHumanChecks: z.array(z.string()),
    sandbox: actionSandboxSchema.optional(),
  }),
});

export const moduleSummaryToolOutputSchema = z.object({
  source: z.literal("tenant-workspace"),
  organizationId: z.string(),
  moduleId: z.enum(moduleIds),
  moduleLabel: z.string(),
  dataMode: z.string(),
  generatedAt: z.string().datetime(),
  stats: z.record(z.string(), z.number()),
  queue: z.array(z.unknown()).max(5),
  records: z.array(toolRecordSchema).max(5),
  documents: z.array(toolDocumentSchema).max(5),
});

export const recordSearchToolOutputSchema = z.object({
  source: z.literal("tenant-record-search"),
  organizationId: z.string(),
  moduleId: z.enum(moduleIds),
  moduleLabel: z.string(),
  query: z.string(),
  count: z.number().int().nonnegative(),
  records: z.array(toolRecordSchema).max(10),
});

export const documentLookupToolOutputSchema = z.object({
  source: z.literal("tenant-document-lookup"),
  organizationId: z.string(),
  moduleId: z.enum(moduleIds),
  moduleLabel: z.string(),
  count: z.number().int().nonnegative(),
  documents: z.array(toolDocumentSchema).max(10),
});

export const taskDraftingToolOutputSchema = z.object({
  source: z.literal("ai-task-draft"),
  organizationId: z.string(),
  moduleId: z.enum(moduleIds),
  moduleLabel: z.string(),
  priority: taskDraftingToolInputSchema.shape.priority,
  subject: z.string().min(1).max(120),
  ownerTeam: z.string(),
  requiredCapability: z.string(),
  mutationState: z.literal("draft-only"),
  recommendedChecks: z.array(z.string()).min(1).max(8),
});

export type ModuleSummaryToolInput = z.infer<
  typeof moduleSummaryToolInputSchema
>;
export type RecordSearchToolInput = z.infer<typeof recordSearchToolInputSchema>;
export type DocumentLookupToolInput = z.infer<
  typeof documentLookupToolInputSchema
>;
export type TaskDraftingToolInput = z.infer<
  typeof taskDraftingToolInputSchema
>;
export type ApprovalProposalToolInput = z.infer<
  typeof approvalToolInputSchema
>;
export type ApprovalProposalToolOutput = z.infer<
  typeof approvalToolOutputSchema
>;
export type SolutionActionProposalToolInput = z.infer<
  typeof solutionActionProposalToolInputSchema
>;
export type SolutionActionProposalToolOutput = z.infer<
  typeof solutionActionProposalToolOutputSchema
>;
export type ModuleSummaryToolOutput = z.infer<
  typeof moduleSummaryToolOutputSchema
>;
export type RecordSearchToolOutput = z.infer<
  typeof recordSearchToolOutputSchema
>;
export type DocumentLookupToolOutput = z.infer<
  typeof documentLookupToolOutputSchema
>;
export type TaskDraftingToolOutput = z.infer<
  typeof taskDraftingToolOutputSchema
>;
