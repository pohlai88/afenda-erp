import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";
import type { SystemAdminAuditSearchParams } from "../schemas/system-admin.audit-filter.schema";
import type {
  SystemAdminAuditEventDetail,
  SystemAdminAuditEventRow,
  SystemAdminRetentionPolicyListRow,
} from "../contracts";
import {
  buildSystemAdminAuditListHref,
  buildSystemAdminAuditViewerListSurface,
  buildSystemAdminRetentionPoliciesListSurface,
  systemAdminAuditUiCopy,
  systemAdminAuditViewerSurfaceKey,
  systemAdminRetentionSurfaceKey,
} from "../surface";
import { SystemAdminAuditDetailPanel } from "./system-admin.audit-detail.component.server";
import { SystemAdminAuditExportActions } from "./system-admin.audit-export-actions.component.client";
import { RetentionPolicyForm } from "./system-admin.retention-policy-form.component.client";
import { buildSystemAdminAuditExportFilterFields } from "../data/system-admin.audit-export-filters.shared";
import { SystemAdminAuditCoveragePanel } from "./system-admin.audit-coverage-panel.component.server";
import type { SystemAdminAuditCoverageGapRow } from "../contracts/system-admin.audit-coverage.contract";
import type { SystemAdminActionResult } from "../../tenant-execution/contracts/system-admin.action-result.contract";
import type { ExportSystemAdminAuditLogsAction } from "./system-admin.audit-export-button.component.client";

type UpsertRetentionPolicyAction = (
  state: SystemAdminActionResult | undefined,
  payload: FormData,
) => Promise<SystemAdminActionResult>;

export function SystemAdminAuditSection({
  rows,
  params,
  searchValue,
  totalCount,
  pageSize,
  page,
  hasNextPage,
  selected,
  retentionPolicies,
  coverageGaps,
  canExport,
  canReview,
  exportAuditLogsAction,
  upsertRetentionPolicyAction,
}: {
  rows: readonly SystemAdminAuditEventRow[];
  params: SystemAdminAuditSearchParams;
  searchValue?: string;
  totalCount: number;
  pageSize: number;
  page: number;
  hasNextPage: boolean;
  selected: SystemAdminAuditEventDetail | null;
  retentionPolicies: readonly SystemAdminRetentionPolicyListRow[];
  coverageGaps: readonly SystemAdminAuditCoverageGapRow[];
  canExport: boolean;
  canReview: boolean;
  exportAuditLogsAction: ExportSystemAdminAuditLogsAction;
  upsertRetentionPolicyAction: UpsertRetentionPolicyAction;
}) {
  const copy = systemAdminAuditUiCopy;
  const exportFilters = buildSystemAdminAuditExportFilterFields(params);

  return (
    <div className="@container flex flex-col gap-surface-2xl">
      <SectionPanel
        headingLevel={2}
        title={copy.page.title}
        description={copy.page.description}
      />

      {canExport ? (
        <SystemAdminAuditExportActions
          exportAuditLogsAction={exportAuditLogsAction}
          filterFields={exportFilters}
        />
      ) : null}

      <SystemAdminAuditCoveragePanel gaps={coverageGaps} />

      <GovernedPatternCListSection
        title={copy.auditList.title}
        description={copy.auditList.description}
        surfaceKey={systemAdminAuditViewerSurfaceKey}
        listConfiguration={buildSystemAdminAuditViewerListSurface({
          rows,
          params,
          searchValue,
          totalCount,
          pageSize,
          page,
          hasNextPage,
        })}
        parentAccessAllowed
        layout="embedded"
      />

      {selected ? (
        <SystemAdminAuditDetailPanel
          detail={selected}
          backHref={buildSystemAdminAuditListHref(params)}
        />
      ) : null}

      <GovernedPatternCListSection
        title={copy.retentionList.title}
        description={copy.retentionList.description}
        surfaceKey={systemAdminRetentionSurfaceKey}
        listConfiguration={buildSystemAdminRetentionPoliciesListSurface({
          policies: retentionPolicies,
        })}
        parentAccessAllowed
        layout="embedded"
      />

      {canReview ? (
        <SectionPanel
          title={copy.retentionForm.title}
          description={copy.retentionForm.description}
        >
          <RetentionPolicyForm
            upsertRetentionPolicyAction={upsertRetentionPolicyAction}
          />
        </SectionPanel>
      ) : null}
    </div>
  );
}

export function SystemAdminAuditAccessDenied() {
  const copy = systemAdminAuditUiCopy;

  return (
    <div className="@container flex flex-col gap-surface-lg">
      <SectionPanel
        headingLevel={2}
        title={copy.page.title}
        description={copy.page.description}
      />
      <SectionPanel title={copy.accessDenied.title}>
        <p className="type-muted">{copy.accessDenied.description}</p>
      </SectionPanel>
    </div>
  );
}
