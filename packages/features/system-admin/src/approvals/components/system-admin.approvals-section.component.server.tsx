import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";
import type { SystemAdminActionResult } from "../../tenant-execution/contracts/system-admin.action-result.contract";
import type {
  SystemAdminApprovalRuleDetail,
  SystemAdminApprovalRuleEditorDefaults,
  SystemAdminApprovalRuleListRow,
  SystemAdminApproverRoleOption,
} from "../contracts";
import {
  buildApprovalsListSurface,
  systemAdminApprovalsSurfaceKey,
  systemAdminApprovalsUiCopy,
} from "../surface";
import { SystemAdminApprovalDetailPanel } from "./system-admin.approval-detail.component.server";
import { SystemAdminApprovalRuleEditor } from "./system-admin.approval-rule-editor.component.client";
import { SystemAdminApprovalTrailingCell } from "./system-admin.approvals-trailing-cells.component.client";
import { systemAdminControlLinks } from "../../overview/contracts/system-admin.control-links.contract";

type UpdateApprovalRuleAction = (
  state: SystemAdminActionResult | undefined,
  payload: FormData,
) => Promise<SystemAdminActionResult>;

export function SystemAdminApprovalsSection({
  approvals,
  searchValue,
  canMutate,
  approverRoleOptions,
  updateApprovalRuleAction,
  selectedApprovalKey,
  approvalDetail,
  editorDefaults,
}: {
  approvals: readonly SystemAdminApprovalRuleListRow[];
  searchValue?: string;
  canMutate: boolean;
  approverRoleOptions: readonly SystemAdminApproverRoleOption[];
  updateApprovalRuleAction: UpdateApprovalRuleAction;
  selectedApprovalKey?: string;
  approvalDetail?: SystemAdminApprovalRuleDetail | null;
  editorDefaults?: SystemAdminApprovalRuleEditorDefaults;
}) {
  const copy = systemAdminApprovalsUiCopy;
  const listBackHref = systemAdminControlLinks.approvals(searchValue);

  return (
    <div className="@container flex flex-col gap-surface-2xl">
      <SectionPanel
        headingLevel={1}
        title={copy.page.title}
        description={copy.page.description}
      />

      {approvalDetail ? (
        <SystemAdminApprovalDetailPanel
          detail={approvalDetail}
          backHref={listBackHref}
        />
      ) : null}

      <GovernedPatternCListSection
        title={copy.list.title}
        surfaceKey={systemAdminApprovalsSurfaceKey}
        listConfiguration={buildApprovalsListSurface({
          approvals,
          searchValue,
          canMutate,
        })}
        parentAccessAllowed
        layout="embedded"
        trailingColumn={{
          header: copy.list.actionsHeader,
          Cell: SystemAdminApprovalTrailingCell,
          context: { surfaceKey: systemAdminApprovalsSurfaceKey },
        }}
      />

      {canMutate ? (
        <SectionPanel
          title={
            selectedApprovalKey
              ? copy.editor.updateTitle
              : copy.editor.title
          }
          description={copy.editor.description}
        >
          <SystemAdminApprovalRuleEditor
            updateApprovalRuleAction={updateApprovalRuleAction}
            approverRoleOptions={approverRoleOptions}
            editorDefaults={editorDefaults}
          />
        </SectionPanel>
      ) : null}
    </div>
  );
}

export function SystemAdminApprovalsAccessDenied() {
  const copy = systemAdminApprovalsUiCopy;

  return (
    <div className="@container flex flex-col gap-surface-lg">
      <SectionPanel
        headingLevel={1}
        title={copy.page.title}
        description={copy.page.description}
      />
      <SectionPanel title={copy.accessDenied.title}>
        <p className="type-muted">{copy.accessDenied.description}</p>
      </SectionPanel>
    </div>
  );
}
