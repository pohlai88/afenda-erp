/**
 * Contract types and tool I/O schemas for the @afenda/ai package.
 *
 * Contracts define the boundaries between:
 * - AI tools and the ERP domain (tool input/output schemas)
 * - Governance layer and tool authors (GovernedToolMeta)
 * - Platform AI and feature consumers (approval/sandbox schemas)
 *
 * All tool factories must reference these schemas — never define tool I/O inline.
 */

export { AI_ERP_HTTP_ROUTES, type AiErpHttpRoute } from "./ai.http.contract";
export type { SandboxExecutorResult } from "../data/ai.context.contract";

export type {
  GovernedToolMeta,
  ModuleSummaryToolInput,
  ModuleSummaryToolOutput,
  RecordSearchToolInput,
  RecordSearchToolOutput,
  DocumentLookupToolInput,
  DocumentLookupToolOutput,
  TaskDraftingToolInput,
  TaskDraftingToolOutput,
  ApprovalProposalToolInput,
  ApprovalProposalToolOutput,
  SolutionActionProposalToolInput,
  SolutionActionProposalToolOutput,
} from "./ai.tools.contract";
