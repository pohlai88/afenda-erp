import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { Alert, AlertDescription, SectionPanel } from "@afenda/ui";
import type { ModuleWorkspace, ModuleWorkspaceListQuery } from "@afenda/kernel";

import { mapWorkspaceItemsToSystemAdminApprovalQueueRows } from "./sys-approvals-queue.mapper";
import {
  buildSystemAdminApprovalQueueListSurface,
  systemAdminApprovalsQueueSurfaceKey,
} from "./sys-approvals-queue-list.surface";
import { systemAdminApprovalsUiCopy } from "./sys-approvals-ui.copy.shared";
import { SystemAdminApprovalQueueTrailingCell } from "./sys-approvals-queue-trailing-cell.component.client";

export function SystemAdminApprovalQueueSection({
  workspace,
  moduleQuery,
  canDecide,
}: {
  workspace: ModuleWorkspace;
  moduleQuery: ModuleWorkspaceListQuery;
  canDecide: boolean;
}) {
  const rows = mapWorkspaceItemsToSystemAdminApprovalQueueRows(
    workspace.workItems,
  );
  const copy = systemAdminApprovalsUiCopy.queue;

  return (
    <SectionPanel
      headingLevel={3}
      title={copy.title}
      description={copy.description}
    >
      <div
        className="@container flex flex-col gap-surface-md"
        data-testid="system-admin-approval-queue-section"
      >
        {!canDecide ? (
          <Alert data-testid="system-admin-approval-queue-read-only-notice">
            <AlertDescription>{copy.readOnlyNotice}</AlertDescription>
          </Alert>
        ) : null}

        <GovernedPatternCListSection
          title={copy.title}
          surfaceKey={systemAdminApprovalsQueueSurfaceKey}
          listConfiguration={buildSystemAdminApprovalQueueListSurface({
            rows,
            window: workspace.workItemWindow,
            query: moduleQuery,
            canDecide,
          })}
          parentAccessAllowed
          layout="embedded"
          forbidden={{
            variant: "forbidden",
            title: systemAdminApprovalsUiCopy.accessDenied.title,
            description: copy.forbiddenDescription,
          }}
          trailingColumn={{
            header: copy.actionsHeader,
            Cell: SystemAdminApprovalQueueTrailingCell,
            context: { surfaceKey: systemAdminApprovalsQueueSurfaceKey },
          }}
        />
      </div>
    </SectionPanel>
  );
}
