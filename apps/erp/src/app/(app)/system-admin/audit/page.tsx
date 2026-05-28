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
import { SectionPanel } from "@afenda/ui";
import type { Metadata } from "next";
import { RetentionPolicyForm } from "@/components/system-admin/retention-policy-form.client";

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
    listRetentionPolicies({ organizationId: organization.id, limit: 50 }),
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
          <RetentionPolicyForm />
        </SectionPanel>
      ) : null}
    </div>
  );
}
