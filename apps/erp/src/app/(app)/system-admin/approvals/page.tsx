import {
  buildApprovalsListSurface,
  listTenantApprovalSettings,
  requireSystemAdminApprovalsRead,
  systemAdminApprovalsSurfaceKey,
  updateSystemAdminApprovalAction,
} from "@afenda/feature-system-admin/server";
import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Approvals — System admin",
  description: "Approval-chain configuration and escalation posture.",
};

export default async function SystemAdminApprovalsPage() {
  const { organization } = await requireSystemAdminApprovalsRead();
  const canMutate =
    organization.capabilities.includes("system-admin.approvals.manage") ||
    organization.capabilities.includes("system-admin.settings.write");
  const approvals = await listTenantApprovalSettings({
    organizationId: organization.id,
    limit: 100,
  });

  async function updateApproval(formData: FormData) {
    "use server";
    await updateSystemAdminApprovalAction(undefined, formData);
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionPanel
        headingLevel={1}
        title="Approvals"
        description="Approval law is configured here and executed by workflow and feature modules."
      />

      <GovernedPatternCListSection
        title="Approval rules"
        surfaceKey={systemAdminApprovalsSurfaceKey}
        listConfiguration={buildApprovalsListSurface({ approvals })}
        parentAccessAllowed
        layout="embedded"
      />

      {canMutate ? (
        <SectionPanel title="Update approval rule">
          <form action={updateApproval} className="grid gap-3 md:grid-cols-5">
            <input name="approvalKey" placeholder="approval key" className="rounded-md border border-line bg-background px-3 py-2 text-sm" />
            <input name="label" placeholder="label" className="rounded-md border border-line bg-background px-3 py-2 text-sm" />
            <select name="enabled" className="rounded-md border border-line bg-background px-3 py-2 text-sm" defaultValue="true">
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
            <select name="approverRole" className="rounded-md border border-line bg-background px-3 py-2 text-sm" defaultValue="admin">
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
              <option value="finance-manager">Finance manager</option>
              <option value="operations-manager">Operations manager</option>
            </select>
            <input name="escalationMinutes" type="number" min="0" max="10080" placeholder="minutes" className="rounded-md border border-line bg-background px-3 py-2 text-sm" />
            <button className="rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background md:col-span-5">
              Save approval rule
            </button>
          </form>
        </SectionPanel>
      ) : null}
    </div>
  );
}
