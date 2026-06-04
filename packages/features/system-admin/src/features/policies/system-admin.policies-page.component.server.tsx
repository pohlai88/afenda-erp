import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { hasExecutionPermission } from "@afenda/kernel/execution";
import { SectionPanel } from "@afenda/ui";

import { systemAdminControlLinks } from "../overview/sys-control-links.contract";
import { updateSystemAdminPolicyRuleAction } from "./system-admin.policy-rules.actions.server";
import { buildPoliciesListSurface } from "./system-admin.policy-rules.surface";
import { buildSystemAdminPoliciesPageModel } from "./system-admin.policy-rules.query.server";
import { requireSystemAdminPoliciesRead } from "./system-admin.policy-rules.policy.server";
import { systemAdminPoliciesSurfaceKey } from "./system-admin.policy-rules.surface";
import { systemAdminPoliciesUiCopy } from "./system-admin.policies-ui.copy.shared";
import { SystemAdminPoliciesAccessDenied } from "./system-admin.policies-access.component.server";
import { SystemAdminPolicyDetailPanel } from "./system-admin.policy-detail.component.server";
import { SystemAdminPolicyRuleEditor } from "./system-admin.policy-rule-editor.component.client";
import { SystemAdminPolicyTrailingCell } from "./system-admin.policy-rules-trailing-cells.component.client";

type SystemAdminPoliciesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function SystemAdminPoliciesPage({
  searchParams,
}: SystemAdminPoliciesPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  let guard: Awaited<ReturnType<typeof requireSystemAdminPoliciesRead>>;

  try {
    guard = await requireSystemAdminPoliciesRead();
  } catch {
    return <SystemAdminPoliciesAccessDenied />;
  }
  const canMutate = hasExecutionPermission(
    guard.context,
    "system-admin.policies.manage",
  );
  const {
    searchValue,
    policies,
    effectOptions,
    policyDetail,
    editorDefaults,
    selectedPolicyKey,
  } = await buildSystemAdminPoliciesPageModel({
    organizationId: guard.organization.id,
    searchParams: resolvedSearchParams,
  });
  const listBackHref = systemAdminControlLinks.policies(searchValue);

  return (
    <div className="flex flex-col gap-surface-2xl">
      <SectionPanel
        headingLevel={1}
        title={systemAdminPoliciesUiCopy.page.title}
        description={systemAdminPoliciesUiCopy.page.description}
      />

      {policyDetail ? (
        <SystemAdminPolicyDetailPanel
          detail={policyDetail}
          backHref={listBackHref}
        />
      ) : null}

      <GovernedPatternCListSection
        title={systemAdminPoliciesUiCopy.list.title}
        surfaceKey={systemAdminPoliciesSurfaceKey}
        listConfiguration={buildPoliciesListSurface({
          policies,
          searchValue,
          canMutate,
        })}
        parentAccessAllowed
        layout="embedded"
        trailingColumn={{
          header: "Actions",
          Cell: SystemAdminPolicyTrailingCell,
        }}
      />

      {canMutate ? (
        <SectionPanel
          title={
            selectedPolicyKey
              ? systemAdminPoliciesUiCopy.editor.updateTitle
              : systemAdminPoliciesUiCopy.editor.createTitle
          }
          description={systemAdminPoliciesUiCopy.editor.description}
        >
          <SystemAdminPolicyRuleEditor
            updatePolicyRuleAction={updateSystemAdminPolicyRuleAction}
            effectOptions={effectOptions}
            editorDefaults={editorDefaults}
          />
        </SectionPanel>
      ) : null}
    </div>
  );
}
