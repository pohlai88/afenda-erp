import {
  buildSystemAdminAuditViewerListSurface,
  buildSystemAdminRetentionPoliciesListSurface,
  systemAdminAuditViewerSurfaceKey,
  systemAdminRetentionSurfaceKey,
} from "@afenda/feature-system-admin/metadata";
import {
  buildSystemAdminAuditListHref,
  buildSystemAdminAuditPageModel,
  listSystemAdminRetentionPolicies,
  requireSystemAdminAuditRead,
  SystemAdminAuditDetailPanel,
  upsertSystemAdminRetentionPolicyAction,
} from "@afenda/feature-system-admin/server";
import {
  RetentionPolicyForm,
  SystemAdminAuditExportButton,
} from "@afenda/feature-system-admin/client";
import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Audit — System admin",
  description: "Review administrative audit evidence and retention posture.",
};

export default async function SystemAdminAuditPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const { organization, context } = await requireSystemAdminAuditRead();
  const canExport = organization.capabilities.includes(
    "system-admin.audit.export",
  );

  const [pageModel, retentionPolicies] = await Promise.all([
    buildSystemAdminAuditPageModel({
      organizationId: organization.id,
      actorId: context.userId,
      actorType: context.actorType,
      searchParams: resolvedSearchParams,
    }),
    listSystemAdminRetentionPolicies({
      organizationId: organization.id,
      limit: 50,
    }),
  ]);

  const auditSurface = buildSystemAdminAuditViewerListSurface({
    rows: pageModel.rows,
    params: pageModel.params,
    searchValue: pageModel.searchValue,
    totalCount: pageModel.totalCount,
    pageSize: pageModel.pageSize,
    page: pageModel.page,
    hasNextPage: pageModel.hasNextPage,
  });
  const retentionSurface = buildSystemAdminRetentionPoliciesListSurface({
    policies: retentionPolicies.map((policy) => ({
      entityType: policy.entityType,
      retentionDays: policy.retentionDays,
      legalHold: policy.legalHold,
    })),
  });

  const exportFilters = {
    auditQ: pageModel.params.auditQ ?? "",
    auditActor: pageModel.params.auditActor ?? "",
    auditAction: pageModel.params.auditAction ?? "",
    auditTargetType: pageModel.params.auditTargetType ?? "",
    auditModule: pageModel.params.auditModule ?? "",
    auditFrom: pageModel.params.auditFrom ?? "",
    auditTo: pageModel.params.auditTo ?? "",
  };

  return (
    <div className="flex flex-col gap-surface-2xl">
      <SectionPanel
        headingLevel={1}
        title="Audit viewer"
        description="Search, inspect, and export administrative evidence for this organization. The execution kernel writes events; System Admin reviews them."
      />

      {canExport ? (
        <div className="flex justify-end">
          <SystemAdminAuditExportButton filterFields={exportFilters} />
        </div>
      ) : null}

      <GovernedPatternCListSection
        title="Administrative audit log"
        description="Server-side filters and pagination. Select evidence links to inspect redacted metadata."
        surfaceKey={systemAdminAuditViewerSurfaceKey}
        listConfiguration={auditSurface}
        parentAccessAllowed
        layout="embedded"
      />

      {pageModel.selected ? (
        <SystemAdminAuditDetailPanel
          detail={pageModel.selected}
          backHref={buildSystemAdminAuditListHref(pageModel.params)}
        />
      ) : null}

      <GovernedPatternCListSection
        title="Retention policies"
        description="Retention posture for purge and legal hold."
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
          <RetentionPolicyForm
            upsertRetentionPolicyAction={upsertSystemAdminRetentionPolicyAction}
          />
        </SectionPanel>
      ) : null}
    </div>
  );
}
