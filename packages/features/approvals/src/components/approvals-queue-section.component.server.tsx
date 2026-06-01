import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import type { ModuleWorkspace, ModuleWorkspaceListQuery } from "@afenda/kernel";
import { moduleScreenSections } from "@afenda/kernel";

import { mapWorkspaceItemsToApprovalQueueRows } from "../data/approvals.queue.mapper";
import {
  approvalsQueueSurfaceKey,
  buildApprovalQueueListSurface,
} from "../surface/approvals-queue-list.surface";
import { ApprovalsQueueTrailingCell } from "./approvals-queue-trailing-cell.component.client";
import { approvalsUiCopy } from "../surface/approvals-ui.copy.shared";

export function ApprovalsModuleQueueSection({
  workspace,
  moduleQuery,
  canDecide,
}: {
  workspace: ModuleWorkspace;
  moduleQuery: ModuleWorkspaceListQuery;
  canDecide: boolean;
}) {
  const rows = mapWorkspaceItemsToApprovalQueueRows(workspace.workItems);
  const copy = approvalsUiCopy.queue;

  return (
    <GovernedPatternCListSection
      title={moduleScreenSections.workflowQueue.title}
      description={copy.description}
      surfaceKey={approvalsQueueSurfaceKey}
      listConfiguration={buildApprovalQueueListSurface({
        rows,
        window: workspace.workItemWindow,
        query: moduleQuery,
        canDecide,
      })}
      parentAccessAllowed
      layout="embedded"
      trailingColumn={{
        header: copy.actionsHeader,
        Cell: ApprovalsQueueTrailingCell,
        context: { surfaceKey: approvalsQueueSurfaceKey },
      }}
    />
  );
}
