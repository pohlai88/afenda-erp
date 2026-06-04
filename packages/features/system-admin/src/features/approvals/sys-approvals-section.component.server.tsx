import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { Alert, AlertDescription, AlertTitle, SectionPanel } from "@afenda/ui";
import type { ModuleWorkspace, ModuleWorkspaceListQuery } from "@afenda/kernel";
import type { SystemAdminActionResult } from "../tenant-execution/sys-action-result.contract";
import type { SystemAdminApprovalRuleDetail, SystemAdminApprovalRuleEditorDefaults, SystemAdminApprovalRuleListRow, SystemAdminApproverRoleOption } from "./sys-approval-rule.contract";
import { buildApprovalsListSurface, systemAdminApprovalsSurfaceKey } from "./sys-approvals-list.surface";
import { systemAdminApprovalsUiCopy } from "./sys-approvals-ui.copy.shared";
import { SystemAdminApprovalDetailPanel } from "./sys-approval-detail.component.server";
import { SystemAdminApprovalRuleEditor } from "./sys-approval-rule-editor.component.client";
import { SystemAdminApprovalQueueSection } from "./sys-approvals-queue-section.component.server";
import { SystemAdminApprovalTrailingCell } from "./sys-approvals-trailing-cells.component.client";
import { systemAdminControlLinks } from "../overview/sys-control-links.contract";

type UpdateApprovalRuleAction = (
  state: SystemAdminActionResult | undefined,
  payload: FormData,
) => Promise<SystemAdminActionResult>;

export function SystemAdminApprovalsSection({
  approvals,
  searchValue,
  canMutate,
  canReview,
  canViewRules,
  canViewQueue,
  canDecide,
  queueWorkspace,
  queueModuleQuery,
  approverRoleOptions,
  updateApprovalRuleAction,
  reactivateDeprecatedApprovalRuleAction,
  selectedApprovalKey,
  approvalDetail,
  editorDefaults,
}: {
  approvals: readonly SystemAdminApprovalRuleListRow[];
  searchValue?: string;
  canMutate: boolean;
  canReview: boolean;
  canViewRules: boolean;
  canViewQueue: boolean;
  canDecide: boolean;
  queueWorkspace?: ModuleWorkspace;
  queueModuleQuery?: ModuleWorkspaceListQuery;
  approverRoleOptions: readonly SystemAdminApproverRoleOption[];
  updateApprovalRuleAction: UpdateApprovalRuleAction;
  reactivateDeprecatedApprovalRuleAction?: (
    input: { approvalKey: string },
  ) => Promise<SystemAdminActionResult>;
  selectedApprovalKey?: string;
  approvalDetail?: SystemAdminApprovalRuleDetail | null;
  editorDefaults?: SystemAdminApprovalRuleEditorDefaults;
}) {
  const copy = systemAdminApprovalsUiCopy;
  const listBackHref = systemAdminControlLinks.approvals(searchValue);

  return (
    <div
      className="@container flex flex-col gap-surface-2xl"
      data-testid="system-admin-approvals-section"
    >
      <SectionPanel
        headingLevel={2}
        title={copy.page.title}
        description={copy.page.description}
      />

      {canViewQueue && queueWorkspace && queueModuleQuery ? (
        <SystemAdminApprovalQueueSection
          workspace={queueWorkspace}
          moduleQuery={queueModuleQuery}
          canDecide={canDecide}
        />
      ) : null}

      {canViewRules && approvalDetail ? (
        <SystemAdminApprovalDetailPanel
          detail={approvalDetail}
          backHref={listBackHref}
          canReview={canReview}
          reactivateDeprecatedApprovalRuleAction={
            reactivateDeprecatedApprovalRuleAction
          }
        />
      ) : null}

      {canViewRules ? (
        <>
          <SectionPanel
            headingLevel={3}
            title={copy.list.title}
            description={copy.list.description}
          >
            <div
              className="@container flex flex-col gap-surface-md"
              data-testid="system-admin-approvals-rules-section"
            >
              {!canMutate ? (
                <Alert data-testid="system-admin-approvals-rules-read-only-notice">
                  <AlertDescription>{copy.list.readOnlyNotice}</AlertDescription>
                </Alert>
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
                forbidden={{
                  variant: "forbidden",
                  title: copy.accessDenied.title,
                  description: copy.list.forbiddenDescription,
                }}
                trailingColumn={{
                  header: copy.list.actionsHeader,
                  Cell: SystemAdminApprovalTrailingCell,
                  context: { surfaceKey: systemAdminApprovalsSurfaceKey },
                }}
              />
            </div>
          </SectionPanel>

          {canMutate ? (
            <SectionPanel
              headingLevel={3}
              title={
                selectedApprovalKey
                  ? copy.editor.updateTitle
                  : copy.editor.title
              }
              description={copy.editor.description}
            >
              <div data-testid="system-admin-approval-rule-editor-section">
                <SystemAdminApprovalRuleEditor
                  updateApprovalRuleAction={updateApprovalRuleAction}
                  approverRoleOptions={approverRoleOptions}
                  editorDefaults={editorDefaults}
                />
              </div>
            </SectionPanel>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

export function SystemAdminApprovalsAccessDenied() {
  const copy = systemAdminApprovalsUiCopy;

  return (
    <div
      className="@container flex flex-col gap-surface-lg"
      data-testid="system-admin-approvals-access-denied-section"
    >
      <SectionPanel
        headingLevel={2}
        title={copy.page.title}
        description={copy.page.description}
      />
      <Alert variant="destructive">
        <AlertTitle>{copy.accessDenied.title}</AlertTitle>
        <AlertDescription>{copy.accessDenied.description}</AlertDescription>
      </Alert>
    </div>
  );
}
