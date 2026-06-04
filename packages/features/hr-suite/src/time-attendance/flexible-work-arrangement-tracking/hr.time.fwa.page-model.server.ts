import {
  listHrFwaArrangementsWindow,
  listHrFwaComplianceBreaches,
  listHrFwaRequestsWindow,
  type HrFwaReportGroupBy,
} from "@afenda/db";
import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface";
import type { EmptyState } from "@afenda/governed-surface/schemas";

import { listHrFwaAuditTrailWindow } from "./hrs-hr-time-fwa-audit-trail-server";
import { buildHrFwaReportRows } from "./hrs-hr-time-fwa-report-server";
import { settleHrFwaListLoad } from "./hr.time.fwa-list-load.shared";
import { buildHrFwaArrangementsListSurface } from "./hr.time.fwa-arrangements-list.surface";
import { buildHrFwaComplianceListSurface } from "./hr.time.fwa-compliance-list.surface";
import { buildHrFwaRequestsListSurface } from "./hr.time.fwa-requests-list.surface";
import {
  buildFwaListSearchToolbar,
  buildFwaOperationalListSurface,
} from "./hr.time.fwa-list.shared";
import {
  hrFwaReportsColumnsId,
  hrFwaReportsSurfaceKey,
} from "./hr.time.fwa-surface-metadata.shared";
import { hrFwaUiCopy } from "./hr.time.fwa-ui.copy.shared";

const DEFAULT_PAGE_SIZE = 25;

function parseReportGroupBy(value?: string): HrFwaReportGroupBy {
  const allowed: readonly HrFwaReportGroupBy[] = [
    "employee",
    "department",
    "manager",
    "legal_entity",
    "location",
    "arrangement_kind",
    "status",
    "period",
  ];
  if (value && allowed.includes(value as HrFwaReportGroupBy)) {
    return value as HrFwaReportGroupBy;
  }
  return "department";
}

function buildHrFwaReportsListSurface(input: {
  rows: Awaited<ReturnType<typeof buildHrFwaReportRows>>;
}): ListSurfaceRendererConfigurationResolvedInput {
  const copy = hrFwaUiCopy.reports;

  return buildFwaOperationalListSurface({
    primaryColumnId: "group",
    searchToolbar: buildFwaListSearchToolbar({
      param: "fwaReportGroupBy",
      label: "Group by",
      placeholder: "department",
    }),
    window: {
      pageSize: input.rows.length,
      totalCount: input.rows.length,
      hasNextPage: false,
    },
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrFwaReportsColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "group", header: copy.colGroup, priority: "primary", pin: "start" },
      { id: "active", header: copy.colActive },
      { id: "pending", header: copy.colPending },
      { id: "breaches", header: copy.colBreaches },
    ],
    rows: input.rows.map((row) => ({
      id: row.groupKey,
      cells: {
        group: row.groupLabel,
        active: String(row.activeCount),
        pending: String(row.pendingRequestCount),
        breaches: String(row.complianceBreachCount),
      },
    })),
  });
}

function buildHrFwaAuditTrailListSurface(input: {
  window: Awaited<ReturnType<typeof listHrFwaAuditTrailWindow>>;
}): ListSurfaceRendererConfigurationResolvedInput {
  const copy = hrFwaUiCopy.audit;

  return buildFwaOperationalListSurface({
    primaryColumnId: "action",
    searchToolbar: buildFwaListSearchToolbar({
      param: "fwaAuditTrailSearch",
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: "hr.time.fwa.audit-trail.columns",
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "action", header: copy.colAction, priority: "primary", wrap: true },
      { id: "summary", header: copy.colSummary, wrap: true },
      { id: "when", header: copy.colWhen, cellKind: { kind: "date" } },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        action: row.action.replace(/_/g, " "),
        summary: row.summary,
        when: row.occurredAt.toISOString(),
      },
    })),
  });
}

export type HrFwaPageModelInput = {
  organizationId: string;
  canReadCompliance: boolean;
  canReadAudit: boolean;
  visibleEmployeeIds?: readonly string[] | null;
  arrangementsSearch?: string;
  requestsSearch?: string;
  complianceSearch?: string;
  auditTrailSearch?: string;
  reportGroupBy?: string;
};

export type HrFwaPageModel = {
  arrangements?: ListSurfaceRendererConfigurationResolvedInput;
  arrangementsLoadError?: EmptyState;
  requests?: ListSurfaceRendererConfigurationResolvedInput;
  requestsLoadError?: EmptyState;
  compliance?: ListSurfaceRendererConfigurationResolvedInput;
  complianceLoadError?: EmptyState;
  reports?: ListSurfaceRendererConfigurationResolvedInput;
  reportsLoadError?: EmptyState;
  auditTrail?: ListSurfaceRendererConfigurationResolvedInput;
  auditTrailLoadError?: EmptyState;
};

export async function buildHrFwaPageModel(
  input: HrFwaPageModelInput,
): Promise<HrFwaPageModel> {
  const groupBy = parseReportGroupBy(input.reportGroupBy);
  const visibleEmployeeIds = input.visibleEmployeeIds ?? null;

  const [
    arrangementsLoad,
    requestsLoad,
    complianceLoad,
    reportsLoad,
    auditLoad,
  ] = await Promise.all([
    settleHrFwaListLoad({
      sectionTitle: hrFwaUiCopy.arrangements.sectionTitle,
      load: async () => {
        const window = await listHrFwaArrangementsWindow({
          organizationId: input.organizationId,
          search: input.arrangementsSearch,
          limit: DEFAULT_PAGE_SIZE,
        });
        return buildHrFwaArrangementsListSurface({
          window,
          searchValue: input.arrangementsSearch,
        });
      },
    }),
    settleHrFwaListLoad({
      sectionTitle: hrFwaUiCopy.requests.sectionTitle,
      load: async () => {
        const window = await listHrFwaRequestsWindow({
          organizationId: input.organizationId,
          search: input.requestsSearch,
          visibleEmployeeIds,
          limit: DEFAULT_PAGE_SIZE,
        });
        return buildHrFwaRequestsListSurface({
          window,
          searchValue: input.requestsSearch,
        });
      },
    }),
    input.canReadCompliance
      ? settleHrFwaListLoad({
          sectionTitle: hrFwaUiCopy.compliance.sectionTitle,
          load: async () => {
            const rows = await listHrFwaComplianceBreaches({
              organizationId: input.organizationId,
              status: "open",
              limit: DEFAULT_PAGE_SIZE,
            });
            return buildHrFwaComplianceListSurface({
              rows,
              searchValue: input.complianceSearch,
            });
          },
        })
      : Promise.resolve({ data: undefined }),
    settleHrFwaListLoad({
      sectionTitle: hrFwaUiCopy.reports.sectionTitle,
      load: async () => {
        const rows = await buildHrFwaReportRows({
          organizationId: input.organizationId,
          groupBy,
          visibleEmployeeIds,
        });
        return buildHrFwaReportsListSurface({ rows });
      },
    }),
    input.canReadAudit
      ? settleHrFwaListLoad({
          sectionTitle: hrFwaUiCopy.audit.sectionTitle,
          load: async () => {
            const window = await listHrFwaAuditTrailWindow({
              organizationId: input.organizationId,
              search: input.auditTrailSearch,
              limit: DEFAULT_PAGE_SIZE,
            });
            return buildHrFwaAuditTrailListSurface({ window });
          },
        })
      : Promise.resolve({ data: undefined }),
  ]);

  return {
    arrangements: arrangementsLoad.data,
    arrangementsLoadError:
      "loadError" in arrangementsLoad ? arrangementsLoad.loadError : undefined,
    requests: requestsLoad.data,
    requestsLoadError:
      "loadError" in requestsLoad ? requestsLoad.loadError : undefined,
    compliance: complianceLoad.data,
    complianceLoadError:
      "loadError" in complianceLoad ? complianceLoad.loadError : undefined,
    reports: reportsLoad.data,
    reportsLoadError: "loadError" in reportsLoad ? reportsLoad.loadError : undefined,
    auditTrail: auditLoad.data,
    auditTrailLoadError:
      "loadError" in auditLoad ? auditLoad.loadError : undefined,
  };
}

export { hrFwaReportsSurfaceKey };
