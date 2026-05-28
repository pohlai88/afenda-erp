import {
  assertCapabilityAllowed,
  createSolutionProviderTools,
} from "@afenda/ai";
import type { ApiAuthContext } from "@afenda/auth/server";
import { createAiActionSandbox, registerAiApprovalProposal } from "@afenda/db";
import {
  getErpModuleById,
  getModuleWorkspace,
  getModuleWorkspaceStats,
  moduleIds,
  resolveWorkspaceDataMode,
} from "@afenda/domain";

/**
 * Shared Solution Provider / Lynx Operator tool wiring for ERP route handlers.
 * Keeps sandbox persistence and workspace capability checks in one place.
 */
export function createErpSolutionProviderTools(
  auth: ApiAuthContext,
  model: string,
  options?: {
    approvalToolEnabled?: boolean;
  },
) {
  const { organization, session } = auth;

  async function getAllowedWorkspace(moduleId: (typeof moduleIds)[number]) {
    const moduleDefinition = getErpModuleById(moduleId);

    if (!moduleDefinition) {
      throw new Error(`Unknown ERP module: ${moduleId}`);
    }

    assertCapabilityAllowed({
      capability: moduleDefinition.requiredCapability,
      capabilities: organization.capabilities,
    });

    const workspace = await getModuleWorkspace({
      organizationId: organization.id,
      moduleId,
      dataMode: resolveWorkspaceDataMode(session.source),
    });

    return { moduleDefinition, workspace };
  }

  return createSolutionProviderTools({
    organization,
    session,
    model,
    getModuleDefinition: (moduleId) => getErpModuleById(moduleId) ?? undefined,
    getAllowedWorkspace,
    getWorkspaceStats: getModuleWorkspaceStats,
    isApprovalToolEnabled: () => options?.approvalToolEnabled ?? true,
    registerSolutionActionProposal: async (proposal) =>
      registerAiApprovalProposal({
        organizationId: proposal.organizationId,
        moduleId: proposal.moduleId,
        requestedByAuthUserId: proposal.requestedByAuthUserId,
        model: proposal.model,
        status: "approved",
        proposedAction: "solution-action",
        rationale: proposal.rationale,
        riskLevel: proposal.riskLevel,
        toolInput: {
          title: proposal.title,
          sourceRecordIds: proposal.sourceRecordIds,
          requiredHumanChecks: proposal.requiredHumanChecks,
          sandbox: proposal.sandbox ?? null,
        },
        toolOutput: {
          humanApproved: true,
          solutionProvider: true,
          sandboxStatus: proposal.sandbox?.status ?? "pending",
        },
      }),
    persistActionSandbox: async (sandbox, approvalProposalId) =>
      createAiActionSandbox({
        id: sandbox.id,
        organizationId: sandbox.organizationId,
        moduleId: sandbox.moduleId,
        actionType: sandbox.actionType,
        title: sandbox.title,
        proposedBy: sandbox.proposedBy,
        status: sandbox.status,
        diff: sandbox.diff as Record<string, unknown>,
        riskAssessment: sandbox.riskAssessment as Record<string, unknown>,
        sourceEvidence: (sandbox.sourceEvidence ?? []) as Record<
          string,
          unknown
        >[],
        rollbackMetadata: sandbox.rollbackMetadata as
          | Record<string, unknown>
          | null
          | undefined,
        approvalProposalId,
        rejectionReason: sandbox.rejectionReason,
        approvedAt: sandbox.approvedAt
          ? new Date(sandbox.approvedAt)
          : undefined,
        rejectedAt: sandbox.rejectedAt
          ? new Date(sandbox.rejectedAt)
          : undefined,
        createdAt: new Date(sandbox.createdAt),
        updatedAt: new Date(sandbox.updatedAt),
      }),
  });
}
