import type { ModuleWorkspaceItem } from "@afenda/kernel";

import type { ApprovalQueueListRow } from "../contracts/approvals.queue.contract";

function readApprovalRoute(metadata: Record<string, unknown>) {
  const route = metadata.route ?? metadata.approvalRoute;
  return typeof route === "string" && route.trim().length > 0
    ? route.trim()
    : "—";
}

function readEscalated(metadata: Record<string, unknown>, status: string) {
  if (status === "escalated") {
    return true;
  }

  return metadata.escalation === true;
}

function readDecisionComplete(metadata: Record<string, unknown>, status: string) {
  if (status === "completed") {
    return true;
  }

  const decision = metadata.decision;
  return decision === "approved" || decision === "rejected";
}

export function mapWorkspaceItemsToApprovalQueueRows(
  workItems: readonly ModuleWorkspaceItem[],
): ApprovalQueueListRow[] {
  return workItems.map((item) => ({
    id: item.id,
    subject: item.subject,
    owner: item.owner,
    status: item.status,
    priority: item.priority,
    dueAt: item.dueAt,
    route: readApprovalRoute(item.metadata),
    escalated: readEscalated(item.metadata, item.status),
    sourceRecordHref: item.sourceRecordId
      ? (`/${item.moduleId}/records/${encodeURIComponent(item.sourceRecordId)}` as const)
      : null,
    decisionComplete: readDecisionComplete(item.metadata, item.status),
  }));
}
