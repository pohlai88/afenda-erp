import type { z } from "zod";
import type {
  approvalToolInputSchema,
  approvalToolOutputSchema,
  documentLookupToolInputSchema,
  documentLookupToolOutputSchema,
  moduleSummaryToolInputSchema,
  moduleSummaryToolOutputSchema,
  recordSearchToolInputSchema,
  recordSearchToolOutputSchema,
  solutionActionProposalToolInputSchema,
  solutionActionProposalToolOutputSchema,
  taskDraftingToolInputSchema,
  taskDraftingToolOutputSchema,
} from "../schemas/ai.tools.schema";

export type GovernedToolMeta = {
  risk: "low" | "medium" | "high";
  category:
    | "contacts"
    | "knowledge"
    | "operations"
    | "approvals"
    | "records"
    | "documents";
  access: "read" | "write";
  dataSensitivity: "none" | "low" | "medium" | "high";
  audit: "silent" | "record";
};

export type ModuleSummaryToolInput = z.infer<
  typeof moduleSummaryToolInputSchema
>;
export type RecordSearchToolInput = z.infer<typeof recordSearchToolInputSchema>;
export type DocumentLookupToolInput = z.infer<
  typeof documentLookupToolInputSchema
>;
export type TaskDraftingToolInput = z.infer<typeof taskDraftingToolInputSchema>;
export type ApprovalProposalToolInput = z.infer<typeof approvalToolInputSchema>;
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
