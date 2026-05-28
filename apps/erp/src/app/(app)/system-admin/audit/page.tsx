import { requireCapability } from "@afenda/auth/server";
import {
  buildAuditLogListSurface,
  buildRetentionPoliciesListSurface,
  listAuditLogsForOrganization,
  listRetentionPolicies,
  systemAdminAuditLogSurfaceKey,
  systemAdminRetentionSurfaceKey,
} from "@afenda/feature-system-admin/server";
import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { Button } from "@afenda/ui/button";
import { Input } from "@afenda/ui/input";
import { NativeSelect, NativeSelectOption } from "@afenda/ui/native-select";
import { SectionPanel } from "@afenda/ui";
import type { Metadata } from "next";
import { upsertRetentionPolicyForm } from "./actions";

export const metadata: Metadata = {
  title: "Audit — System admin",
  description: "Tenant audit log and retention policy posture.",
};

export default async function SystemAdminAuditPage() {
  const { organization } = await requireCapability("system-admin.audit.read");
  const canExport = organization.capabilities.includes(
    "system-admin.audit.export",
  );

  const [auditLogs, retentionPolicies] = await Promise.all([
    listAuditLogsForOrganization({ organizationId: organization.id, limit: 100 }),
    listRetentionPolicies({ organizationId: organization.id }),
  ]);

  const auditSurface = buildAuditLogListSurface({ logs: auditLogs });
  const retentionSurface = buildRetentionPoliciesListSurface({
    policies: retentionPolicies.map((policy) => ({
      entityType: policy.entityType,
      retentionDays: policy.retentionDays,
      legalHold: policy.legalHold,
    })),
  });

  return (
    <div className="flex flex-col gap-6">
      <SectionPanel
        headingLevel={1}
        title="Audit & retention"
        description="Governance events and data retention policies for this tenant."
      />

      <GovernedPatternCListSection
        title="Audit log"
        description="Most recent tenant-scoped governance events."
        surfaceKey={systemAdminAuditLogSurfaceKey}
        listConfiguration={auditSurface}
        parentAccessAllowed
        layout="embedded"
      />

      <GovernedPatternCListSection
        title="Retention policies"
        surfaceKey={systemAdminRetentionSurfaceKey}
        listConfiguration={retentionSurface}
        parentAccessAllowed
        layout="embedded"
      />

      {canExport ? (
        <SectionPanel
          title="Update retention policy"
          description="Legal hold prevents automated purge for the selected entity type."
        >
          <form
            action={upsertRetentionPolicyForm}
            className="grid max-w-xl gap-4 sm:grid-cols-2"
          >
            <label className="flex flex-col gap-1 text-sm sm:col-span-2">
              <span className="text-muted-foreground">Entity type</span>
              <NativeSelect
                className="w-full"
                name="entityType"
                defaultValue="document"
                required
              >
                <NativeSelectOption value="organization">
                  organization
                </NativeSelectOption>
                <NativeSelectOption value="membership">membership</NativeSelectOption>
                <NativeSelectOption value="user-profile">
                  user-profile
                </NativeSelectOption>
                <NativeSelectOption value="erp-record">erp-record</NativeSelectOption>
                <NativeSelectOption value="workflow-item">
                  workflow-item
                </NativeSelectOption>
                <NativeSelectOption value="saved-view">saved-view</NativeSelectOption>
                <NativeSelectOption value="document">document</NativeSelectOption>
                <NativeSelectOption value="system">system</NativeSelectOption>
              </NativeSelect>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">Retention days</span>
              <Input
                name="retentionDays"
                type="number"
                min={1}
                max={3650}
                defaultValue={365}
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">Legal hold</span>
              <NativeSelect className="w-full" name="legalHold" defaultValue="false">
                <NativeSelectOption value="false">Standard</NativeSelectOption>
                <NativeSelectOption value="true">On hold</NativeSelectOption>
              </NativeSelect>
            </label>
            <div className="flex items-end sm:col-span-2">
              <Button type="submit">Save retention policy</Button>
            </div>
          </form>
        </SectionPanel>
      ) : null}
    </div>
  );
}
