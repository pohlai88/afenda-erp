import {
  buildPoliciesListSurface,
  systemAdminPoliciesSurfaceKey,
} from "@afenda/feature-system-admin/metadata";
import {
  buildSystemAdminPoliciesPageModel,
  requireSystemAdminPoliciesRead,
  updateSystemAdminPolicyRuleAction,
} from "@afenda/feature-system-admin/server";
import {
  SystemAdminPolicyRuleEditor,
  SystemAdminPolicyTrailingCell,
} from "@afenda/feature-system-admin/client";
import { SystemAdminPolicyDetailPanel } from "@afenda/feature-system-admin/server";
import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { hasExecutionPermission } from "@afenda/kernel/execution";
import { SectionPanel } from "@afenda/ui";
import { systemAdminControlLinks } from "@afenda/feature-system-admin/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Policies — System admin",
  description: "Tenant lock and execution policy rules evaluated by the execution kernel.",
};

export default async function SystemAdminPoliciesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const { context, organization } = await requireSystemAdminPoliciesRead();
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
        title="Policies"
        description="Configure lock, deny, warn, and approval-required rules. The execution kernel evaluates active rules by priority during protected mutations."
      />

      {policyDetail ? (
        <SystemAdminPolicyDetailPanel
          detail={policyDetail}
          backHref={listBackHref}
        />
      ) : null}

      <GovernedPatternCListSection
        title="Policy rules"
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
              ? "Update selected policy rule"
              : "Create or update policy rule"
          }
          description="Rules are organization-scoped, audited, and applied before workflow runtime."
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
