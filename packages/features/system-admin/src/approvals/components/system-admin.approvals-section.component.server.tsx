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
} from "../surface/system-admin.approvals-list.surface";
import { systemAdminApprovalsUiCopy } from "../surface/system-admin.approvals-ui.copy.shared";
import { SystemAdminApprovalRuleEditor } from "./system-admin.approval-rule-editor.component.client";

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
}: {
  approvals: readonly SystemAdminApprovalRuleListRow[];
  searchValue?: string;
  canMutate: boolean;
  approverRoleOptions: readonly SystemAdminApproverRoleOption[];
  updateApprovalRuleAction: UpdateApprovalRuleAction;
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
        listConfiguration={buildApprovalsListSurface({ approvals, searchValue })}
        parentAccessAllowed
        layout="embedded"
      />

      {canMutate ? (
        <SectionPanel
          title={copy.editor.title}
          description={copy.editor.description}
        >
          <SystemAdminApprovalRuleEditor
            updateApprovalRuleAction={updateApprovalRuleAction}
            approverRoleOptions={approverRoleOptions}
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
