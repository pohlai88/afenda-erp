import {
  buildPoliciesListSurface,
  systemAdminPoliciesSurfaceKey,
} from "@afenda/feature-system-admin/metadata";
import {
  buildSystemAdminPoliciesPageModel,
  requireSystemAdminPoliciesRead,
  updateSystemAdminPolicyRuleAction,
} from "@afenda/feature-system-admin/server";
import { SystemAdminPolicyRuleEditor } from "@afenda/feature-system-admin/client";
import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";
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
  const { organization } = await requireSystemAdminPoliciesRead();
  const canMutate =
    organization.capabilities.includes("system-admin.policies.manage") ||
    organization.capabilities.includes("system-admin.settings.write");
  const { searchValue, policies, effectOptions } =
    await buildSystemAdminPoliciesPageModel({
      organizationId: organization.id,
      searchParams: resolvedSearchParams,
    });

  return (
    <div className="flex flex-col gap-surface-2xl">
      <SectionPanel
        headingLevel={1}
        title="Policies"
        description="Configure lock, deny, warn, and approval-required rules. The execution kernel evaluates active rules by priority during protected mutations."
      />

      <GovernedPatternCListSection
        title="Policy rules"
        surfaceKey={systemAdminPoliciesSurfaceKey}
        listConfiguration={buildPoliciesListSurface({ policies, searchValue })}
        parentAccessAllowed
        layout="embedded"
      />

      {canMutate ? (
        <SectionPanel
          title="Create or update policy rule"
          description="Rules are organization-scoped, audited, and applied before workflow runtime."
        >
          <SystemAdminPolicyRuleEditor
            updatePolicyRuleAction={updateSystemAdminPolicyRuleAction}
            effectOptions={effectOptions}
          />
        </SectionPanel>
      ) : null}
    </div>
  );
}
