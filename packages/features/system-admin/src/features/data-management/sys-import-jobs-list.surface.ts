import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationResolvedInput,
  type ListSurfaceRow,
} from "@afenda/governed-surface";
import { formatErpDateTime } from "@afenda/kernel";
import {
  buildSystemAdminListToolbar,
  buildSystemAdminStaticPagination,
} from "../../overview/surfaces/system-admin.list-surface.shared";
import type {
  SystemAdminExportJobListRow,
  SystemAdminImportJobListRow,
  SystemAdminImportJobStatus,
  SystemAdminImportRowFailure,
  SystemAdminImportTemplate,
} from "./sys-import-job.contract";
import { systemAdminDataManagementUiCopy } from "./system-admin.data-management-ui.copy.shared";
import { resolveSystemAdminImportJobRowTrailingAction } from "./system-admin.import-jobs-list-trailing.shared";

export const systemAdminImportTemplatesSurfaceKey =
  "system-admin.data-management.templates.list";

export const systemAdminImportJobsSurfaceKey =
  "system-admin.data-management.import-jobs.list";

export const systemAdminImportFailuresSurfaceKey =
  "system-admin.data-management.import-failures.list";

export const systemAdminDataExportsSurfaceKey =
  "system-admin.data-management.exports.list";

const JOB_STATUS_BADGE: Record<
  SystemAdminImportJobStatus,
  NonNullable<ListSurfaceRow["cellKinds"]>[string]
> = {
  uploaded: { kind: "badge", tone: "default" },
  validating: { kind: "badge", tone: "attention" },
  ready: { kind: "badge", tone: "positive" },
  running: { kind: "badge", tone: "attention" },
  completed: { kind: "badge", tone: "positive" },
  failed: { kind: "badge", tone: "critical" },
  cancelled: { kind: "badge", tone: "default" },
};

function digestShort(value: string) {
  return value.length <= 16 ? value : `${value.slice(0, 16)}...`;
}

export function buildSystemAdminImportTemplatesListSurface(input: {
  templates: readonly SystemAdminImportTemplate[];
}): ListSurfaceRendererConfigurationResolvedInput {
  const copy = systemAdminDataManagementUiCopy.templates;

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    presentation: {
      toolbar: buildSystemAdminListToolbar({
        scope: "importTemplates",
        searchPlaceholder: copy.searchPlaceholder,
        sortColumn: "label",
      }),
    },
    requiresErpPermission: {
      module: "system-admin",
      object: "data-management",
      function: "read",
    },
    pagination: buildSystemAdminStaticPagination(input.templates.length),
    surface: {
      header: { title: copy.title, description: copy.description },
      columnsId: "system-admin-data-management-templates",
      rowKey: "id",
      empty: {
        variant: "muted",
        title: copy.emptyTitle,
        description: copy.emptyDescription,
      },
    },
    columns: [
      { id: "label", header: "Template", priority: "primary", pin: "start" },
      { id: "targetDomain", header: "Target" },
      { id: "adapterId", header: "Adapter" },
      { id: "version", header: "Version" },
      { id: "retrySafe", header: "Retry" },
      { id: "requiredHeaders", header: "Required headers", minWidth: 240 },
    ],
    rows: input.templates.map((template) => ({
      id: template.id,
      cells: {
        label: template.label,
        targetDomain: template.targetDomain,
        adapterId: template.adapterId,
        version: template.version,
        retrySafe: template.retrySafe ? "Retry-safe" : "Manual review",
        requiredHeaders: template.requiredHeaders.join(", "),
      },
      cellKinds: {
        retrySafe: {
          kind: "badge",
          tone: template.retrySafe ? "positive" : "attention",
        },
      },
    })),
  });
}

export function buildSystemAdminImportJobsListSurface(input: {
  jobs: readonly SystemAdminImportJobListRow[];
  canRun: boolean;
  canCancel: boolean;
  searchValue?: string;
  totalCount?: number;
}): ListSurfaceRendererConfigurationResolvedInput {
  const copy = systemAdminDataManagementUiCopy.importJobs;
  const totalCount = input.totalCount ?? input.jobs.length;

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    presentation: {
      toolbar: buildSystemAdminListToolbar({
        scope: "importJobs",
        searchPlaceholder: copy.searchPlaceholder,
        sortColumn: "createdAt",
        searchValue: input.searchValue,
        filters: [
          {
            id: "status",
            label: "Status",
            param: "importJobsStatus",
            options: [
              { label: "Ready", value: "ready" },
              { label: "Running", value: "running" },
              { label: "Completed", value: "completed" },
              { label: "Failed", value: "failed" },
              { label: "Cancelled", value: "cancelled" },
            ],
          },
        ],
      }),
    },
    requiresErpPermission: {
      module: "system-admin",
      object: "data-management",
      function: "read",
    },
    pagination: buildSystemAdminStaticPagination(totalCount, input.jobs.length),
    surface: {
      header: { title: copy.title, description: copy.description },
      columnsId: "system-admin-data-management-import-jobs",
      rowKey: "id",
      empty: {
        variant: "muted",
        title: copy.emptyTitle,
        description: copy.emptyDescription,
      },
    },
    columns: [
      { id: "sourceLabel", header: "Source", priority: "primary", pin: "start" },
      { id: "status", header: "Status", cellKind: { kind: "badge" } },
      { id: "template", header: "Template" },
      { id: "rows", header: "Rows" },
      { id: "failures", header: "Failures" },
      { id: "digest", header: "Digest" },
      { id: "createdBy", header: "Actor" },
      { id: "createdAt", header: "Created" },
    ],
    rows: input.jobs.map((job) => ({
      id: job.id,
      cells: {
        jobId: job.id,
        jobStatus: job.status,
        canRun: String(input.canRun && job.canRun),
        canCancel: String(input.canCancel && job.canCancel),
        sourceLabel: job.sourceLabel,
        status: job.statusLabel,
        template: job.templateLabel,
        rows: `${job.appliedRows}/${job.totalRows} applied`,
        failures: String(job.failedRows),
        digest: digestShort(job.inputDigest),
        createdBy: job.createdByAuthUserId,
        createdAt: formatErpDateTime(job.createdAt),
      },
      cellKinds: {
        status: JOB_STATUS_BADGE[job.status],
        failures: {
          kind: "badge",
          tone: job.failedRows > 0 ? "critical" : "positive",
        },
      },
      trailingAction: resolveSystemAdminImportJobRowTrailingAction({
        status: job.status,
        canRun: input.canRun,
        canCancel: input.canCancel,
      }),
    })),
  });
}

export function buildSystemAdminImportFailuresListSurface(input: {
  failures: readonly SystemAdminImportRowFailure[];
  searchValue?: string;
}): ListSurfaceRendererConfigurationResolvedInput {
  const copy = systemAdminDataManagementUiCopy.failures;

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    presentation: {
      toolbar: buildSystemAdminListToolbar({
        scope: "importFailures",
        searchPlaceholder: copy.searchPlaceholder,
        sortColumn: "rowNumber",
        searchValue: input.searchValue,
      }),
    },
    requiresErpPermission: {
      module: "system-admin",
      object: "data-management",
      function: "read",
    },
    pagination: buildSystemAdminStaticPagination(input.failures.length),
    surface: {
      header: { title: copy.title, description: copy.description },
      columnsId: "system-admin-data-management-import-failures",
      rowKey: "id",
      empty: {
        variant: "muted",
        title: copy.emptyTitle,
        description: copy.emptyDescription,
      },
    },
    columns: [
      { id: "jobId", header: "Job", priority: "primary", pin: "start" },
      { id: "rowNumber", header: "Row" },
      { id: "code", header: "Code", cellKind: { kind: "badge" } },
      { id: "message", header: "Message", minWidth: 240 },
      { id: "preview", header: "Redacted preview", minWidth: 260 },
      { id: "digest", header: "Digest" },
    ],
    rows: input.failures.map((failure) => ({
      id: failure.id,
      cells: {
        jobId: failure.jobId,
        rowNumber: String(failure.rowNumber),
        code: failure.validationCode,
        message: failure.validationMessage,
        preview: Object.entries(failure.redactedPreview)
          .map(([key, value]) => `${key}: ${value}`)
          .join("; "),
        digest: digestShort(failure.rowDigest),
      },
      cellKinds: {
        code: { kind: "badge", tone: "critical" },
      },
    })),
  });
}

export function buildSystemAdminDataExportsListSurface(input: {
  exports: readonly SystemAdminExportJobListRow[];
  searchValue?: string;
}): ListSurfaceRendererConfigurationResolvedInput {
  const copy = systemAdminDataManagementUiCopy.exports;

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    presentation: {
      toolbar: buildSystemAdminListToolbar({
        scope: "dataExports",
        searchPlaceholder: copy.searchPlaceholder,
        sortColumn: "createdAt",
        searchValue: input.searchValue,
      }),
    },
    requiresErpPermission: {
      module: "system-admin",
      object: "data-management",
      function: "read",
    },
    pagination: buildSystemAdminStaticPagination(input.exports.length),
    surface: {
      header: { title: copy.title, description: copy.description },
      columnsId: "system-admin-data-management-exports",
      rowKey: "id",
      empty: {
        variant: "muted",
        title: copy.emptyTitle,
        description: copy.emptyDescription,
      },
    },
    columns: [
      { id: "sourceLabel", header: "Source", priority: "primary", pin: "start" },
      { id: "exportType", header: "Type" },
      { id: "status", header: "Status", cellKind: { kind: "badge" } },
      { id: "rowCount", header: "Rows" },
      { id: "digest", header: "Digest" },
      { id: "createdBy", header: "Actor" },
      { id: "createdAt", header: "Created" },
    ],
    rows: input.exports.map((exportJob) => ({
      id: exportJob.id,
      cells: {
        sourceLabel: exportJob.sourceLabel,
        exportType: exportJob.exportType,
        status: exportJob.statusLabel,
        rowCount: String(exportJob.rowCount),
        digest: digestShort(exportJob.packageDigest),
        createdBy: exportJob.createdByAuthUserId,
        createdAt: formatErpDateTime(exportJob.createdAt),
      },
      cellKinds: {
        status: {
          kind: "badge",
          tone: exportJob.status === "ready" ? "positive" : "critical",
        },
      },
    })),
  });
}
