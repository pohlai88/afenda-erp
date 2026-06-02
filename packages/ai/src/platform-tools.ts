/**
 * Platform tool-building utilities without HTTP handlers, auth, or DB persistence.
 * Lynx and other features compose solution-provider / ERP tool factories from here.
 */
export {
  approveActionSandbox,
  createActionSandbox,
} from "./actions/ai.sandbox.actions.server";
export { assembleAiContext } from "./data/ai.context-builder.data";
export { scoreAiConfidence } from "./policies/ai.confidence.policy";
export { assertCapabilityAllowed } from "./policies/ai.guardrails.policy";
export {
  solutionActionProposalToolInputSchema,
  solutionActionProposalToolOutputSchema,
} from "./schemas/ai.tools.schema";
export type {
  ActionSandbox,
  GroundedEvidence,
} from "./schemas/ai.operations.schema";
export {
  assertGovernedToolPolicy,
  assertGovernedToolset,
} from "./tools/ai.governance.tool.server";
export type {
  ErpAssistantToolDocument,
  ErpAssistantToolModule,
  ErpAssistantToolOrganization,
  ErpAssistantToolRecord,
  ErpAssistantToolSession,
  ErpAssistantToolWorkspace,
  ErpAssistantToolWorkspaceStats,
} from "./tools/ai.erp-tools.tool.server";
