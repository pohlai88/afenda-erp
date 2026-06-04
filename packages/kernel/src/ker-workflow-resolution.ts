import { summarizeTenantOrganizationMetrics } from "@afenda/db";
import type { WorkflowAutomationDefinition } from "./ker-module-types";
import type { ModuleDataMode } from "./ker-workspace-data-mode";
import { getWorkflowAutomationDefinitions } from "./ker-workflow-metadata";

function resolveAutomationStatus(input: {
  definition: WorkflowAutomationDefinition;
  escalatedWorkItemCount: number;
  pendingWorkItemCount: number;
}): WorkflowAutomationDefinition["status"] {
  if (input.definition.id === "approval-sla-sweep") {
    return input.escalatedWorkItemCount > 0 ? "watch" : "healthy";
  }

  if (input.definition.id === "supplier-reminder-dispatch") {
    return input.pendingWorkItemCount > 3 ? "watch" : input.definition.status;
  }

  return input.definition.status;
}

export async function getResolvedWorkflowAutomationRuns(input: {
  organizationId: string;
  dataMode: ModuleDataMode;
}) {
  const definitions = getWorkflowAutomationDefinitions();

  if (input.dataMode === "metadata") {
    return definitions;
  }

  const summary = await summarizeTenantOrganizationMetrics({
    organizationId: input.organizationId,
  });

  return definitions.map((definition) => {
    const status = resolveAutomationStatus({
      definition,
      escalatedWorkItemCount: summary.escalatedWorkItemCount,
      pendingWorkItemCount: summary.pendingWorkItemCount,
    });

    return {
      ...definition,
      status,
      detail:
        summary.workItemCount > 0
          ? `${summary.pendingWorkItemCount} pending and ${summary.escalatedWorkItemCount} escalated tenant workflow items.`
          : definition.detail,
    };
  });
}
