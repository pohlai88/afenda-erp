import type { ModuleId } from "@afenda/config/module-ids";
import type { ModuleWorkspaceStats } from "@afenda/domain";
import { tool } from "ai";
import { assertCapabilityAllowed } from "../guardrails";
import { createActionSandbox, approveActionSandbox } from "../sandbox";
import type { ActionSandbox } from "../schemas/operations";
import {
  approvalToolInputSchema,
  approvalToolOutputSchema,
  documentLookupToolOutputSchema,
  documentLookupToolInputSchema,
  moduleSummaryToolOutputSchema,
  moduleSummaryToolInputSchema,
  recordSearchToolOutputSchema,
  recordSearchToolInputSchema,
  taskDraftingToolOutputSchema,
  taskDraftingToolInputSchema,
  type ApprovalProposalToolInput,
} from "./contracts";

export type ErpAssistantToolOrganization = {
  id: string;
  capabilities: readonly string[];
};

export type ErpAssistantToolSession = {
  id: string;
};

export type ErpAssistantToolModule = {
  label: string;
  ownerTeam: string;
  requiredCapability: string;
};

export type ErpAssistantToolRecord = {
  id: string;
  reference: string;
  title: string;
  recordType: string;
  status: string;
  owner: string;
  metadataSummary: string;
};

export type ErpAssistantToolDocument = {
  id: string;
  title: string;
};

export type ErpAssistantToolWorkspace = {
  dataMode: string;
  workItems: readonly unknown[];
  records: readonly ErpAssistantToolRecord[];
  documents: readonly ErpAssistantToolDocument[];
};

export type ErpAssistantToolWorkspaceStats = ModuleWorkspaceStats;

export type RegisterApprovalProposalInput = {
  organizationId: string;
  workItemId?: string;
  moduleId: ApprovalProposalToolInput["moduleId"];
  requestedByAuthUserId: string;
  model: string;
  status: "approved";
  proposedAction: ApprovalProposalToolInput["proposedAction"];
  rationale: string;
  riskLevel: ApprovalProposalToolInput["riskLevel"];
  toolInput: ApprovalProposalToolInput;
  toolOutput: {
    humanApproved: true;
    requiredHumanChecks: readonly string[];
  };
};

export function createErpAssistantTools<
  TWorkspace extends ErpAssistantToolWorkspace,
>(input: {
  organization: ErpAssistantToolOrganization;
  session: ErpAssistantToolSession;
  model: string;
  getModuleDefinition: (
    moduleId: ModuleId,
  ) => ErpAssistantToolModule | undefined;
  getAllowedWorkspace: (moduleId: ModuleId) => Promise<{
    moduleDefinition: ErpAssistantToolModule;
    workspace: TWorkspace;
  }>;
  getWorkspaceStats: (workspace: TWorkspace) => ErpAssistantToolWorkspaceStats;
  registerApprovalProposal: (
    proposal: RegisterApprovalProposalInput,
  ) => Promise<string>;
  persistActionSandbox?: (
    sandbox: ActionSandbox,
    approvalProposalId: string,
  ) => Promise<string>;
}) {
  const {
    organization,
    session,
    model,
    getModuleDefinition,
    getAllowedWorkspace,
    getWorkspaceStats,
    registerApprovalProposal,
    persistActionSandbox,
  } = input;

  return {
    summarizeWorkspace: tool({
      description:
        "Summarize tenant-scoped ERP records, workflows, documents, and saved views for a module.",
      inputSchema: moduleSummaryToolInputSchema,
      outputSchema: moduleSummaryToolOutputSchema,
      strict: true,
      execute: async ({ moduleId }) => {
        const { moduleDefinition, workspace } =
          await getAllowedWorkspace(moduleId);

        return {
          source: "tenant-workspace",
          organizationId: organization.id,
          moduleId,
          moduleLabel: moduleDefinition.label,
          dataMode: workspace.dataMode,
          generatedAt: new Date().toISOString(),
          stats: getWorkspaceStats(workspace),
          queue: workspace.workItems.slice(0, 5),
          records: workspace.records.slice(0, 5),
          documents: workspace.documents.slice(0, 5),
        };
      },
    }),
    searchRecords: tool({
      description:
        "Search tenant-scoped ERP records by reference, title, owner, status, or metadata summary.",
      inputSchema: recordSearchToolInputSchema,
      outputSchema: recordSearchToolOutputSchema,
      strict: true,
      execute: async ({ moduleId, query, limit }) => {
        const { moduleDefinition, workspace } =
          await getAllowedWorkspace(moduleId);
        const normalizedQuery = query.toLowerCase();
        const records = workspace.records
          .filter((record) =>
            [
              record.reference,
              record.title,
              record.recordType,
              record.status,
              record.owner,
              record.metadataSummary,
            ]
              .join(" ")
              .toLowerCase()
              .includes(normalizedQuery),
          )
          .slice(0, limit);

        return {
          source: "tenant-record-search",
          organizationId: organization.id,
          moduleId,
          moduleLabel: moduleDefinition.label,
          query,
          count: records.length,
          records,
        };
      },
    }),
    lookupDocument: tool({
      description:
        "Look up tenant-scoped ERP document metadata by document ID or title query.",
      inputSchema: documentLookupToolInputSchema,
      outputSchema: documentLookupToolOutputSchema,
      strict: true,
      execute: async ({ moduleId, documentId, titleQuery, limit }) => {
        const { moduleDefinition, workspace } =
          await getAllowedWorkspace(moduleId);

        if (!documentId && !titleQuery) {
          throw new Error("Provide documentId or titleQuery.");
        }

        const normalizedTitleQuery = titleQuery?.toLowerCase();
        const documents = workspace.documents
          .filter((document) => {
            if (documentId && document.id === documentId) {
              return true;
            }

            return normalizedTitleQuery
              ? document.title.toLowerCase().includes(normalizedTitleQuery)
              : false;
          })
          .slice(0, limit);

        return {
          source: "tenant-document-lookup",
          organizationId: organization.id,
          moduleId,
          moduleLabel: moduleDefinition.label,
          count: documents.length,
          documents,
        };
      },
    }),
    draftTask: tool({
      description:
        "Draft a non-mutating ERP task proposal. This does not create a task.",
      inputSchema: taskDraftingToolInputSchema,
      outputSchema: taskDraftingToolOutputSchema,
      strict: true,
      execute: async ({ moduleId, objective, priority }) => {
        const { moduleDefinition } = await getAllowedWorkspace(moduleId);

        return {
          source: "ai-task-draft",
          organizationId: organization.id,
          moduleId,
          moduleLabel: moduleDefinition.label,
          priority,
          subject: objective.slice(0, 120),
          ownerTeam: moduleDefinition.ownerTeam,
          requiredCapability: moduleDefinition.requiredCapability,
          mutationState: "draft-only",
          recommendedChecks: [
            "Confirm owner and due date.",
            "Confirm the task is not already represented by an existing work item.",
            "Create the task through the ERP workflow UI after human review.",
          ],
        };
      },
    }),
    proposeApprovalDecision: tool({
      description:
        "Create an approval proposal. Execution requires explicit human approval before it is recorded.",
      inputSchema: approvalToolInputSchema,
      outputSchema: approvalToolOutputSchema,
      strict: true,
      needsApproval: true,
      execute: async (proposal) => {
        const moduleDefinition = getModuleDefinition(proposal.moduleId);

        if (!moduleDefinition) {
          throw new Error("Approval proposal is not allowed.");
        }

        assertCapabilityAllowed({
          capability: moduleDefinition.requiredCapability,
          capabilities: organization.capabilities,
        });

        const proposalId = await registerApprovalProposal({
          organizationId: organization.id,
          workItemId: proposal.workItemId,
          moduleId: proposal.moduleId,
          requestedByAuthUserId: session.id,
          model,
          status: "approved",
          proposedAction: proposal.proposedAction,
          rationale: proposal.rationale,
          riskLevel: proposal.riskLevel,
          toolInput: proposal,
          toolOutput: {
            humanApproved: true,
            requiredHumanChecks: proposal.requiredHumanChecks,
          },
        });

        let sandboxId: string | undefined;

        if (persistActionSandbox) {
          const pending = createActionSandbox({
            organizationId: organization.id,
            moduleId: proposal.moduleId,
            actionType: `approval-${proposal.proposedAction}`,
            title: `${proposal.proposedAction} — ${proposal.moduleId}`,
            riskLevel: proposal.riskLevel,
            summary: proposal.rationale,
            affectedRecords: proposal.workItemId ? [proposal.workItemId] : [],
            requiredHumanChecks: proposal.requiredHumanChecks,
          });
          const approved = approveActionSandbox({ sandbox: pending });
          sandboxId = await persistActionSandbox(approved, proposalId);
        }

        return {
          proposalId,
          sandboxId,
          status: "approved" as const,
          approvalState: "human-approved" as const,
          proposedAction: proposal.proposedAction,
          riskLevel: proposal.riskLevel,
          rationale: proposal.rationale,
          metadata: {
            source: "ai-tool" as const,
            moduleId: proposal.moduleId,
            workItemId: proposal.workItemId ?? null,
          },
        };
      },
    }),
  };
}
