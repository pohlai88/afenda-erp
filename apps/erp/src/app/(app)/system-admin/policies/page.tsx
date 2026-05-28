import {
  buildPoliciesListSurface,
  listTenantPolicySettings,
  requireSystemAdminPoliciesRead,
  systemAdminPoliciesSurfaceKey,
  updateSystemAdminPolicyAction,
} from "@afenda/feature-system-admin/server";
import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Policies — System admin",
  description: "Tenant policy configuration evaluated by the execution kernel.",
};

export default async function SystemAdminPoliciesPage() {
  const { organization } = await requireSystemAdminPoliciesRead();
  const canMutate =
    organization.capabilities.includes("system-admin.policies.manage") ||
    organization.capabilities.includes("system-admin.settings.write");
  const policies = await listTenantPolicySettings({
    organizationId: organization.id,
    limit: 100,
  });

  async function updatePolicy(formData: FormData) {
    "use server";
    await updateSystemAdminPolicyAction(undefined, formData);
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionPanel
        headingLevel={1}
        title="Policies"
        description="System Admin configures policy rules; the execution kernel evaluates verdicts at runtime."
      />

      <GovernedPatternCListSection
        title="Policy rules"
        surfaceKey={systemAdminPoliciesSurfaceKey}
        listConfiguration={buildPoliciesListSurface({ policies })}
        parentAccessAllowed
        layout="embedded"
      />

      {canMutate ? (
        <SectionPanel title="Update policy">
          <form action={updatePolicy} className="grid gap-3 md:grid-cols-4">
            <input name="policyKey" placeholder="policy key" className="rounded-md border border-line bg-background px-3 py-2 text-sm" />
            <input name="label" placeholder="label" className="rounded-md border border-line bg-background px-3 py-2 text-sm" />
            <select name="enabled" className="rounded-md border border-line bg-background px-3 py-2 text-sm" defaultValue="true">
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
            <select name="readiness" className="rounded-md border border-line bg-background px-3 py-2 text-sm" defaultValue="active">
              <option value="active">Active</option>
              <option value="preview">Preview</option>
              <option value="blocked">Blocked</option>
              <option value="deprecated">Deprecated</option>
            </select>
            <button className="rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background md:col-span-4">
              Save policy
            </button>
          </form>
        </SectionPanel>
      ) : null}
    </div>
  );
}
