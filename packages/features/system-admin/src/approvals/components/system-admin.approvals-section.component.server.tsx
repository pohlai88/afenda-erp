import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";
import type { SystemAdminActionResult } from "../../tenant-execution/contracts/system-admin.action-result.contract";
import type {
  SystemAdminApprovalRuleListRow,
  SystemAdminApproverRoleOption,
} from "../contracts";
import {
  buildApprovalsListSurface,
  systemAdminApprovalsSurfaceKey,
  systemAdminApprovalsUiCopy,
} from "../surface";
import { SystemAdminApprovalRuleEditor } from "./system-admin.approval-rule-editor.component.client";
import { SystemAdminApprovalTrailingCell } from "./system-admin.approvals-trailing-cells.component.client";
import type { SystemAdminApprovalRuleEditorDefaults } from "../contracts";

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
  editorDefaults,
}: {
  approvals: readonly SystemAdminApprovalRuleListRow[];
  searchValue?: string;
  canMutate: boolean;
  approverRoleOptions: readonly SystemAdminApproverRoleOption[];
  updateApprovalRuleAction: UpdateApprovalRuleAction;
  selectedApprovalKey?: string;
  editorDefaults?: SystemAdminApprovalRuleEditorDefaults;
}) {
  const copy = systemAdminApprovalsUiCopy;

  return (
    <div className="flex flex-col gap-surface-2xl">
      <SectionPanel
        headingLevel={1}
        title={copy.page.title}
        description={copy.page.description}
      />

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
