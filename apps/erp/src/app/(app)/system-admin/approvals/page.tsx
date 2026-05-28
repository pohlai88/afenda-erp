import {
  buildApprovalsListSurface,
  systemAdminApprovalsSurfaceKey,
} from "@afenda/feature-system-admin/metadata";
import {
  buildSystemAdminApprovalsPageModel,
  requireSystemAdminApprovalsRead,
  updateSystemAdminApprovalRuleAction,
} from "@afenda/feature-system-admin/server";
import { SystemAdminApprovalRuleEditor } from "@afenda/feature-system-admin/client";
import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Approvals — System admin",
  description: "Approval-chain configuration evaluated before protected execution.",
};

export default async function SystemAdminApprovalsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const { organization } = await requireSystemAdminApprovalsRead();
  const canMutate =
    organization.capabilities.includes("system-admin.approvals.manage") ||
    organization.capabilities.includes("system-admin.settings.write");
  const { searchValue, approvals, approverRoleOptions } =
    await buildSystemAdminApprovalsPageModel({
      organizationId: organization.id,
      searchParams: resolvedSearchParams,
    });

  return (
    <div className="flex flex-col gap-6">
      <SectionPanel
        headingLevel={1}
        title="Approvals"
        description="Approval law is configured here. Orbit and workflow runtime create tasks; System Admin does not execute workflow work directly."
      />

      <GovernedPatternCListSection
        title="Approval rules"
        surfaceKey={systemAdminApprovalsSurfaceKey}
        listConfiguration={buildApprovalsListSurface({ approvals, searchValue })}
        parentAccessAllowed
        layout="embedded"
      />

      {canMutate ? (
        <SectionPanel
          title="Create or update approval rule"
          description="Approver roles are validated against organization roles. Disabled rules do not affect execution kernel verdicts."
        >
          <SystemAdminApprovalRuleEditor
            updateApprovalRuleAction={updateSystemAdminApprovalRuleAction}
            approverRoleOptions={approverRoleOptions}
          />
        </SectionPanel>
      ) : null}
    </div>
  );
}
