import type { ModuleId } from "@afenda/config/module-ids";
import {
  getRecoveryConsoleModuleIds,
  getSolutionToolModuleBindings,
} from "@afenda/domain";
import { tool } from "ai";
import { scoreAiConfidence } from "../confidence";
import { assembleAiContext } from "../context";
import { assertCapabilityAllowed } from "../guardrails";
import {
  actionCandidateSchema,
  businessProblemInputSchema,
  evidenceRecordSchema,
  recoveryPlaybookSchema,
  rootCauseAnalysisSchema,
} from "../schemas/solution-provider";
import {
  type ActionSandbox,
  type GroundedEvidence,
} from "../schemas/operations";
import { approveActionSandbox, createActionSandbox } from "../sandbox";
import {
  solutionActionProposalToolInputSchema,
  solutionActionProposalToolOutputSchema,
} from "./contracts";
import type {
  ErpAssistantToolModule,
  ErpAssistantToolOrganization,
  ErpAssistantToolRecord,
  ErpAssistantToolSession,
  ErpAssistantToolWorkspace,
  ErpAssistantToolWorkspaceStats,
} from "./erp-tools";

const recoveryConsoleModuleIds = getRecoveryConsoleModuleIds();
const solutionToolModuleBindings = getSolutionToolModuleBindings();

export type RegisterSolutionActionProposalInput = {
  organizationId: string;
  moduleId: ModuleId;
  requestedByAuthUserId: string;
  model: string;
  title: string;
  rationale: string;
  riskLevel: "low" | "medium" | "high";
  requiredHumanChecks: readonly string[];
  sourceRecordIds: readonly string[];
  sandbox?: ActionSandbox;
};

function normalizeRecordEvidence(input: {
  moduleId: ModuleId;
  records: readonly ErpAssistantToolRecord[];
}) {
  return input.records.slice(0, 4).map((record) =>
    evidenceRecordSchema.parse({
      moduleId: input.moduleId,
      recordId: record.id,
      label: record.title,
      signal: `${record.recordType} ${record.status}: ${record.metadataSummary}`,
    }),
  );
}

function getPrimaryEvidence(input: {
  moduleId: ModuleId;
  workspace: ErpAssistantToolWorkspace;
}) {
  const recordEvidence = normalizeRecordEvidence({
    moduleId: input.moduleId,
    records: input.workspace.records,
  });

  if (recordEvidence.length > 0) {
    return recordEvidence;
  }

  return [
    evidenceRecordSchema.parse({
      moduleId: input.moduleId,
      recordId: `${input.moduleId}-workspace`,
      label: `${input.moduleId} workspace`,
      signal: `${input.workspace.dataMode} workspace with ${input.workspace.workItems.length} active workflow items and ${input.workspace.documents.length} registered documents.`,
    }),
  ];
}

function toGroundedEvidence(input: {
  evidence: readonly ReturnType<typeof evidenceRecordSchema.parse>[];
  confidence?: number;
}): GroundedEvidence[] {
  return input.evidence.map((item) => ({
    id: `${item.moduleId}-${item.recordId}`,
    moduleId: item.moduleId,
    sourceType: "record",
    sourceId: item.recordId,
    label: item.label,
    signal: item.signal,
    confidence: input.confidence ?? 75,
  }));
}

function getWorkItemPreview(workItem: unknown, index: number) {
  if (workItem && typeof workItem === "object") {
    const record = workItem as Record<string, unknown>;

    return {
      id: typeof record.id === "string" ? record.id : `work-${index + 1}`,
      subject:
        typeof record.subject === "string"
          ? record.subject
          : typeof record.title === "string"
            ? record.title
            : `Work item ${index + 1}`,
      priority: typeof record.priority === "string" ? record.priority : undefined,
      status: typeof record.status === "string" ? record.status : undefined,
    };
  }

  return {
    id: `work-${index + 1}`,
    subject: `Work item ${index + 1}`,
  };
}

function titleCase(value: string) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function createSolutionProviderTools<TWorkspace extends ErpAssistantToolWorkspace>(input: {
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
  getWorkspaceStats: (
    workspace: TWorkspace,
  ) => ErpAssistantToolWorkspaceStats;
  registerSolutionActionProposal: (
    proposal: RegisterSolutionActionProposalInput,
  ) => Promise<string>;
}) {
  const {
    organization,
    session,
    model,
    getModuleDefinition,
    getAllowedWorkspace,
    getWorkspaceStats,
    registerSolutionActionProposal,
  } = input;
  const toolModuleBindings = solutionToolModuleBindings;

  async function inspectModule(moduleId: ModuleId) {
    const { moduleDefinition, workspace } = await getAllowedWorkspace(moduleId);

    return {
      moduleDefinition,
      workspace,
      stats: getWorkspaceStats(workspace),
      evidence: getPrimaryEvidence({ moduleId, workspace }),
    };
  }

  return {
    analyzeProfitAndLoss: tool({
      description:
        "Diagnose likely negative P&L drivers using finance, sales, purchasing, inventory, approvals, and reporting signals.",
      inputSchema: businessProblemInputSchema,
      outputSchema: rootCauseAnalysisSchema.array().min(1).max(6),
      strict: true,
      execute: async (problem) => {
        const modules = problem.moduleIds?.length
          ? problem.moduleIds
          : toolModuleBindings.analyzeProfitAndLoss;
        const inspected = await Promise.all(modules.map(inspectModule));

        return inspected.slice(0, 6).map(({ moduleDefinition, stats, evidence }, index) =>
          rootCauseAnalysisSchema.parse({
            id: `${problem.problemType}-${index + 1}`,
            title: `${moduleDefinition.label} pressure`,
            moduleId: evidence[0]?.moduleId ?? "finance",
            severity:
              stats.highPriorityWorkItemCount > 0 || stats.workItemCount > 4
                ? "high"
                : stats.recordCount > 0
                  ? "medium"
                  : "low",
            confidence: stats.recordCount > 0 ? "medium" : "low",
            evidence,
            confidenceBreakdown: scoreAiConfidence({
              evidenceCount: evidence.length,
              directSourceCount: evidence.length,
              missingDataCount: stats.recordCount > 0 ? 0 : 1,
              userGoal: problem.userGoal,
              taskRiskLevel:
                stats.highPriorityWorkItemCount > 0 || stats.workItemCount > 4
                  ? "high"
                  : "medium",
            }),
            explanation:
              `${moduleDefinition.label} has ${stats.recordCount} records, ${stats.workItemCount} workflow items, and ${stats.documentCount} documents available for recovery analysis.`,
            missingData:
              stats.recordCount > 0
                ? []
                : [`Persist ${moduleDefinition.label.toLowerCase()} transaction records before estimating financial impact.`],
          }),
        );
      },
    }),
    findRevenueLeakage: tool({
      description:
        "Find revenue leakage signals from sales, CRM, finance, and reports.",
      inputSchema: businessProblemInputSchema,
      outputSchema: rootCauseAnalysisSchema.array().min(1).max(4),
      strict: true,
      execute: async (problem) => {
        const inspected = await Promise.all(
          toolModuleBindings.findRevenueLeakage.map(inspectModule),
        );

        return inspected.map(({ moduleDefinition, workspace, evidence }, index) =>
          rootCauseAnalysisSchema.parse({
            id: `revenue-leakage-${index + 1}`,
            title: `${moduleDefinition.label} revenue leakage check`,
            moduleId: evidence[0]?.moduleId ?? "sales",
            severity: workspace.workItems.length > 0 ? "medium" : "low",
            confidence: workspace.records.length > 0 ? "medium" : "low",
            evidence,
            confidenceBreakdown: scoreAiConfidence({
              evidenceCount: evidence.length,
              directSourceCount: evidence.length,
              missingDataCount: workspace.records.length > 0 ? 0 : 1,
              userGoal: problem.userGoal,
              taskRiskLevel: workspace.workItems.length > 0 ? "medium" : "low",
            }),
            explanation:
              `${moduleDefinition.label} was checked for blocked orders, stalled accounts, receivables pressure, and stale reporting signals for ${problem.userGoal}.`,
            missingData:
              workspace.records.length > 0
                ? []
                : [`Add ${moduleDefinition.label.toLowerCase()} records to quantify leakage.`],
          }),
        );
      },
    }),
    findCostDrivers: tool({
      description:
        "Find cost-driver signals from purchasing, inventory, finance, and approvals.",
      inputSchema: businessProblemInputSchema,
      outputSchema: rootCauseAnalysisSchema.array().min(1).max(4),
      strict: true,
      execute: async (problem) => {
        const inspected = await Promise.all(
          toolModuleBindings.findCostDrivers.map(inspectModule),
        );

        return inspected.map(({ moduleDefinition, stats, evidence }, index) =>
          rootCauseAnalysisSchema.parse({
            id: `cost-driver-${index + 1}`,
            title: `${moduleDefinition.label} cost driver`,
            moduleId: evidence[0]?.moduleId ?? "purchasing",
            severity: stats.highPriorityWorkItemCount > 0 ? "high" : "medium",
            confidence: stats.recordCount > 0 ? "medium" : "low",
            evidence,
            confidenceBreakdown: scoreAiConfidence({
              evidenceCount: evidence.length,
              directSourceCount: evidence.length,
              missingDataCount: stats.documentCount > 0 ? 0 : 1,
              userGoal: problem.userGoal,
              taskRiskLevel:
                stats.highPriorityWorkItemCount > 0 ? "high" : "medium",
            }),
            explanation:
              `${moduleDefinition.label} was reviewed for supplier holds, stock exposure, invoice holds, approval delay, and recoverable cost pressure for ${problem.userGoal}.`,
            missingData:
              stats.documentCount > 0
                ? []
                : [`Attach supplier invoices, receipts, or stock documents for stronger cost attribution.`],
          }),
        );
      },
    }),
    reviewCashConversion: tool({
      description:
        "Review cash conversion risk from finance, sales, purchasing, and approvals.",
      inputSchema: businessProblemInputSchema,
      outputSchema: rootCauseAnalysisSchema.array().min(1).max(4),
      strict: true,
      execute: async () => {
        const inspected = await Promise.all(
          toolModuleBindings.reviewCashConversion.map(inspectModule),
        );

        return inspected.map(({ moduleDefinition, stats, evidence }, index) =>
          rootCauseAnalysisSchema.parse({
            id: `cash-conversion-${index + 1}`,
            title: `${moduleDefinition.label} cash conversion signal`,
            moduleId: evidence[0]?.moduleId ?? "finance",
            severity: stats.workItemCount > 2 ? "medium" : "low",
            confidence: stats.recordCount > 0 ? "medium" : "low",
            evidence,
            confidenceBreakdown: scoreAiConfidence({
              evidenceCount: evidence.length,
              directSourceCount: evidence.length,
              missingDataCount: 0,
              userGoal: "Review cash conversion risk.",
              taskRiskLevel: stats.workItemCount > 2 ? "medium" : "low",
            }),
            explanation:
              `${moduleDefinition.label} contributes to cash conversion through receivables, order handoff, supplier timing, or approval throughput.`,
            missingData: [],
          }),
        );
      },
    }),
    assessInventoryRisk: tool({
      description:
        "Assess inventory overstock, stockout, purchasing dependency, and order fulfillment risk.",
      inputSchema: businessProblemInputSchema,
      outputSchema: rootCauseAnalysisSchema.array().min(1).max(3),
      strict: true,
      execute: async () => {
        const inspected = await Promise.all(
          toolModuleBindings.assessInventoryRisk.map(inspectModule),
        );

        return inspected.map(({ moduleDefinition, stats, evidence }, index) =>
          rootCauseAnalysisSchema.parse({
            id: `inventory-risk-${index + 1}`,
            title: `${moduleDefinition.label} inventory risk`,
            moduleId: evidence[0]?.moduleId ?? "inventory",
            severity: stats.highPriorityWorkItemCount > 0 ? "high" : "medium",
            confidence: stats.recordCount > 0 ? "medium" : "low",
            evidence,
            confidenceBreakdown: scoreAiConfidence({
              evidenceCount: evidence.length,
              directSourceCount: evidence.length,
              missingDataCount: stats.recordCount > 0 ? 0 : 1,
              userGoal: "Assess inventory risk.",
              taskRiskLevel:
                stats.highPriorityWorkItemCount > 0 ? "high" : "medium",
            }),
            explanation:
              `${moduleDefinition.label} was assessed for blocked demand, delayed replenishment, and stock exposure.`,
            missingData:
              stats.recordCount > 0 ? [] : ["Persist SKU, order, and receipt records to quantify inventory exposure."],
          }),
        );
      },
    }),
    reviewApprovalThroughput: tool({
      description:
        "Review approval queue depth, escalations, and cycle-time drag across approvals, finance, purchasing, and HR.",
      inputSchema: businessProblemInputSchema,
      outputSchema: rootCauseAnalysisSchema.array().min(1).max(4),
      strict: true,
      execute: async () => {
        const inspected = await Promise.all(
          toolModuleBindings.reviewApprovalThroughput.map(inspectModule),
        );

        return inspected.map(({ moduleDefinition, stats, evidence }, index) =>
          rootCauseAnalysisSchema.parse({
            id: `approval-throughput-${index + 1}`,
            title: `${moduleDefinition.label} approval throughput signal`,
            moduleId: evidence[0]?.moduleId ?? "approvals",
            severity:
              stats.highPriorityWorkItemCount > 0 || stats.workItemCount > 2
                ? "high"
                : "medium",
            confidence: stats.workItemCount > 0 ? "medium" : "low",
            evidence,
            confidenceBreakdown: scoreAiConfidence({
              evidenceCount: evidence.length,
              directSourceCount: evidence.length,
              missingDataCount: stats.workItemCount > 0 ? 0 : 1,
              userGoal: "Review approval throughput bottlenecks.",
              taskRiskLevel:
                stats.highPriorityWorkItemCount > 0 ? "high" : "medium",
            }),
            explanation:
              `${moduleDefinition.label} contributes to approval throughput through queue depth, escalations, or missing owner checks.`,
            missingData:
              stats.workItemCount > 0
                ? []
                : ["Persist approval queue records to quantify cycle-time drag."],
          }),
        );
      },
    }),
    reviewAuditReadiness: tool({
      description:
        "Review audit readiness signals across reports, finance, approvals, and admin controls evidence.",
      inputSchema: businessProblemInputSchema,
      outputSchema: rootCauseAnalysisSchema.array().min(1).max(4),
      strict: true,
      execute: async () => {
        const inspected = await Promise.all(
          toolModuleBindings.reviewAuditReadiness.map(inspectModule),
        );

        return inspected.map(({ moduleDefinition, stats, evidence }, index) =>
          rootCauseAnalysisSchema.parse({
            id: `audit-readiness-${index + 1}`,
            title: `${moduleDefinition.label} audit readiness signal`,
            moduleId: evidence[0]?.moduleId ?? "reports",
            severity: stats.recordCount === 0 ? "medium" : "low",
            confidence: stats.recordCount > 0 ? "medium" : "low",
            evidence,
            confidenceBreakdown: scoreAiConfidence({
              evidenceCount: evidence.length,
              directSourceCount: evidence.length,
              missingDataCount: stats.recordCount > 0 ? 0 : 1,
              userGoal: "Review audit readiness and control evidence.",
              taskRiskLevel: "medium",
            }),
            explanation:
              `${moduleDefinition.label} was reviewed for control evidence, report freshness, unresolved approvals, and admin posture gaps.`,
            missingData:
              stats.recordCount > 0
                ? []
                : ["Persist control and report records to quantify audit readiness gaps."],
          }),
        );
      },
    }),
    draftRecoveryTasks: tool({
      description:
        "Draft a non-mutating recovery playbook with ranked action candidates and approval requirements.",
      inputSchema: businessProblemInputSchema,
      outputSchema: recoveryPlaybookSchema,
      strict: true,
      execute: async (problem) => {
        const workflowId = problem.workflowId ?? "negative_pnl_recovery";
        const inspected = await Promise.all(
          (problem.moduleIds?.length
            ? problem.moduleIds
            : recoveryConsoleModuleIds.slice(0, 4)
          ).map(inspectModule),
        );
        const contextAssembly = assembleAiContext({
          organizationId: organization.id,
          modules: inspected.map(
            ({ moduleDefinition, workspace, stats, evidence }) => ({
              moduleId: evidence[0]?.moduleId ?? "finance",
              moduleLabel: moduleDefinition.label,
              ownerTeam: moduleDefinition.ownerTeam,
              dataMode: workspace.dataMode,
              stats,
              records: workspace.records,
              workItems: workspace.workItems
                .slice(0, 5)
                .map((workItem, index) => getWorkItemPreview(workItem, index)),
              documents: workspace.documents,
            }),
          ),
          maxTokens: 2400,
        });

        const orderedActions = inspected.slice(0, 5).map(
          ({ moduleDefinition, stats, evidence }, index) => {
            const riskLevel =
              stats.highPriorityWorkItemCount > 0 ? "high" : "medium";
            const confidenceBreakdown = scoreAiConfidence({
              evidenceCount: evidence.length,
              directSourceCount: evidence.length,
              missingDataCount: stats.recordCount > 0 ? 0 : 1,
              userGoal: problem.userGoal,
              taskRiskLevel: riskLevel,
            });
            const sourceRecordIds = evidence.map((item) => item.recordId);
            const actionSandbox = createActionSandbox({
              organizationId: organization.id,
              moduleId: evidence[0]?.moduleId ?? "finance",
              actionType: "recovery-task-draft",
              title: `Stabilize ${moduleDefinition.label.toLowerCase()} pressure`,
              riskLevel,
              summary:
                "Draft an owned recovery task for human review before any ERP mutation is performed.",
              before: {
                mutationState: "not-created",
              },
              after: {
                ownerTeam: moduleDefinition.ownerTeam,
                sourceRecordIds,
                expectedState: "draft-task-proposal",
              },
              affectedRecords: sourceRecordIds,
              creates: 1,
              sourceEvidence: toGroundedEvidence({ evidence }),
              requiredHumanChecks: [
                "Confirm owner and due date.",
                "Confirm source records and expected business impact.",
              ],
            });

            return actionCandidateSchema.parse({
              id: `recovery-action-${index + 1}`,
              title: `Stabilize ${moduleDefinition.label.toLowerCase()} pressure`,
              moduleId: evidence[0]?.moduleId ?? "finance",
              ownerTeam: moduleDefinition.ownerTeam,
              priority: riskLevel === "high" ? "high" : "medium",
              expectedImpact:
                "Improves the recovery path by converting module signals into an owned review action.",
              riskLevel,
              humanApproval: {
                required: true,
                state: "approval-required",
                reason:
                  "ERP recovery actions can affect finance, customer, supplier, stock, or approval workflows.",
              },
              sourceRecords: evidence,
              confidenceBreakdown,
              actionSandbox,
            });
          },
        );

        return recoveryPlaybookSchema.parse({
          workflowId,
          title: `${titleCase(problem.problemType)} recovery playbook`,
          summary:
            "Use this playbook to move from diagnosis to accountable, human-approved remediation work.",
          orderedActions,
          kpisToWatch: [
            "Gross margin",
            "Receivables aging",
            "Supplier cost variance",
            "Inventory coverage",
            "Approval cycle time",
          ],
          assumptions: [
            "Recommendations are based on the tenant workspaces available to the current user.",
            "Financial impact must be confirmed by a human owner before action.",
            ...contextAssembly.warnings.slice(0, 2),
          ],
        });
      },
    }),
    proposeHumanApprovedAction: tool({
      description:
        "Record a human-approved Solution Provider action proposal after explicit approval.",
      inputSchema: solutionActionProposalToolInputSchema,
      outputSchema: solutionActionProposalToolOutputSchema,
      strict: true,
      needsApproval: true,
      execute: async (proposal) => {
        const moduleDefinition = getModuleDefinition(proposal.moduleId);

        if (!moduleDefinition) {
          throw new Error("Solution action proposal is not allowed.");
        }

        assertCapabilityAllowed({
          capability: moduleDefinition.requiredCapability,
          capabilities: organization.capabilities,
        });
        const pendingSandbox = createActionSandbox({
          organizationId: organization.id,
          moduleId: proposal.moduleId,
          actionType: "solution-action-proposal",
          title: proposal.title,
          riskLevel: proposal.riskLevel,
          summary: proposal.rationale,
          before: {
            proposalState: "draft",
          },
          after: {
            proposalState: "approved",
            expectedImpact: proposal.expectedImpact,
            requiredHumanChecks: proposal.requiredHumanChecks,
          },
          affectedRecords: proposal.sourceRecordIds,
          creates: 1,
          sourceEvidence: proposal.sourceRecordIds.map((recordId) => ({
            id: `${proposal.moduleId}-${recordId}`,
            moduleId: proposal.moduleId,
            sourceType: "record" as const,
            sourceId: recordId,
            label: recordId,
            signal: `Source record for ${proposal.title}.`,
            confidence: 70,
          })),
          requiredHumanChecks: proposal.requiredHumanChecks,
        });
        const sandbox = approveActionSandbox({ sandbox: pendingSandbox });

        const proposalId = await registerSolutionActionProposal({
          organizationId: organization.id,
          moduleId: proposal.moduleId,
          requestedByAuthUserId: session.id,
          model,
          title: proposal.title,
          rationale: proposal.rationale,
          riskLevel: proposal.riskLevel,
          requiredHumanChecks: proposal.requiredHumanChecks,
          sourceRecordIds: proposal.sourceRecordIds,
          sandbox,
        });

        return {
          proposalId,
          status: "approved" as const,
          approvalState: "human-approved" as const,
          moduleId: proposal.moduleId,
          title: proposal.title,
          riskLevel: proposal.riskLevel,
          metadata: {
            source: "solution-provider-tool" as const,
            sourceRecordIds: proposal.sourceRecordIds,
            requiredHumanChecks: proposal.requiredHumanChecks,
            sandbox,
          },
        };
      },
    }),
  };
}
