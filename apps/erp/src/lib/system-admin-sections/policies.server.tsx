import {
  buildPoliciesListSurface,
  systemAdminPoliciesSurfaceKey,
  systemAdminPoliciesUiCopy,
} from "@afenda/feature-system-admin/metadata";
import {
  buildSystemAdminPoliciesPageModel,
  requireSystemAdminPoliciesRead,
  SystemAdminPoliciesAccessDenied,
  SystemAdminPolicyDetailPanel,
  updateSystemAdminPolicyRuleAction,
} from "@afenda/feature-system-admin/server";
import {
  SystemAdminPolicyRuleEditor,
  SystemAdminPolicyTrailingCell,
} from "@afenda/feature-system-admin/client";
import { systemAdminControlLinks } from "@afenda/feature-system-admin";
import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { hasExecutionPermission } from "@afenda/kernel/execution";
import { SectionPanel } from "@afenda/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Policies — System admin",
  description: systemAdminPoliciesUiCopy.page.description,
};

export default async function SystemAdminPoliciesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  let organization: Awaited<
    ReturnType<typeof requireSystemAdminPoliciesRead>
  >["organization"];
  let context: Awaited<
    ReturnType<typeof requireSystemAdminPoliciesRead>
  >["context"];

  try {
    ({ organization, context } = await requireSystemAdminPoliciesRead());
  } catch {
    return <SystemAdminPoliciesAccessDenied />;
  }
  const canMutate = hasExecutionPermission(
    context,
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
    organizationId: organization.id,
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
