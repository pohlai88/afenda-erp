import type {
  SystemAdminDataExportJobRow,
  SystemAdminDataImportJobRow,
  SystemAdminDataImportRowEvidence,
} from "@afenda/db";
import { filterSystemAdminListRows } from "../../overview/contracts/system-admin.list-filter.shared";
import { resolveSystemAdminListSearch } from "../../overview/contracts/system-admin.list-search.shared";
import { SYSTEM_ADMIN_DATA_MANAGEMENT_QUERY_LIMIT } from "../contracts/system-admin.data-management.limits.shared";
import type {
  SystemAdminDataManagementSummary,
  SystemAdminExportJobListRow,
  SystemAdminImportJobListRow,
  SystemAdminImportRowFailure,
} from "../contracts/system-admin.import-job.contract";
import {
  formatSystemAdminExportJobStatusLabel,
  formatSystemAdminImportJobStatusLabel,
  formatSystemAdminImportRowStatusLabel,
} from "./system-admin.data-management.format.shared";
import { listSystemAdminImportTemplates } from "./system-admin.import-adapter.registry.server";
import {
  listSystemAdminDataExportJobs,
  listSystemAdminDataImportJobs,
  listSystemAdminDataImportRows,
} from "./system-admin.import-jobs.query.server";

export type SystemAdminDataManagementPageModel = {
  templates: ReturnType<typeof listSystemAdminImportTemplates>;
  importJobs: readonly SystemAdminImportJobListRow[];
  rowFailures: readonly SystemAdminImportRowFailure[];
  exportJobs: readonly SystemAdminExportJobListRow[];
  summary: SystemAdminDataManagementSummary;
  importJobsSearch?: string;
  failuresSearch?: string;
  exportsSearch?: string;
};

function templateLabel(templateId: string) {
  return (
    listSystemAdminImportTemplates().find((template) => template.id === templateId)
      ?.label ?? templateId
  );
}

function mapImportJob(
  row: SystemAdminDataImportJobRow,
): SystemAdminImportJobListRow {
  return {
    id: row.id,
    adapterId: row.adapterId,
    templateId: row.templateId,
    templateLabel: templateLabel(row.templateId),
    sourceLabel: row.sourceLabel,
    filename: row.filename ?? "Pasted source",
    inputDigest: row.inputDigest,
    status: row.status,
    statusLabel: formatSystemAdminImportJobStatusLabel(row.status),
    totalRows: row.totalRows,
    validatedRows: row.validatedRows,
    appliedRows: row.appliedRows,
    failedRows: row.failedRows,
    skippedRows: row.skippedRows,
    createdByAuthUserId: row.createdByAuthUserId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    completedAt: row.completedAt,
    canRun: row.status === "ready" || row.status === "running",
    canCancel:
      row.status === "uploaded" ||
      row.status === "validating" ||
      row.status === "ready" ||
      row.status === "running",
  };
}

function mapFailure(row: SystemAdminDataImportRowEvidence): SystemAdminImportRowFailure {
  return {
    id: row.id,
    jobId: row.jobId,
    rowNumber: row.rowNumber,
    status: row.status,
    statusLabel: formatSystemAdminImportRowStatusLabel(row.status),
    rowDigest: row.rowDigest,
    validationCode: row.validationCode ?? "row_failure",
    validationMessage: row.validationMessage ?? "Row did not apply.",
    redactedPreview: row.redactedPreview,
    createdAt: row.createdAt,
  };
}

function mapExport(row: SystemAdminDataExportJobRow): SystemAdminExportJobListRow {
  return {
    id: row.id,
    exportType: row.exportType,
    sourceLabel: row.sourceLabel,
    status: row.status,
    statusLabel: formatSystemAdminExportJobStatusLabel(row.status),
    rowCount: row.rowCount,
    packageDigest: row.packageDigest,
    createdByAuthUserId: row.createdByAuthUserId,
    createdAt: row.createdAt,
  };
}

function summarize(input: {
  jobs: readonly SystemAdminImportJobListRow[];
  exports: readonly SystemAdminExportJobListRow[];
}): SystemAdminDataManagementSummary {
  return {
    totalJobs: input.jobs.length,
    readyJobs: input.jobs.filter((job) => job.status === "ready").length,
    runningJobs: input.jobs.filter((job) => job.status === "running").length,
    completedJobs: input.jobs.filter((job) => job.status === "completed").length,
    failedJobs: input.jobs.filter((job) => job.status === "failed").length,
    cancelledJobs: input.jobs.filter((job) => job.status === "cancelled").length,
    totalRows: input.jobs.reduce((sum, job) => sum + job.totalRows, 0),
    failedRows: input.jobs.reduce((sum, job) => sum + job.failedRows, 0),
    exportCount: input.exports.length,
  };
}

export async function buildSystemAdminDataManagementPageModel(input: {
  organizationId: string;
  searchParams?: Record<string, string | string[] | undefined>;
}): Promise<SystemAdminDataManagementPageModel> {
  const [jobRows, failureRows, exportRows] = await Promise.all([
    listSystemAdminDataImportJobs({
      organizationId: input.organizationId,
      limit: SYSTEM_ADMIN_DATA_MANAGEMENT_QUERY_LIMIT,
    }),
    listSystemAdminDataImportRows({
      organizationId: input.organizationId,
      status: "failed",
      limit: SYSTEM_ADMIN_DATA_MANAGEMENT_QUERY_LIMIT,
    }),
    listSystemAdminDataExportJobs({
      organizationId: input.organizationId,
      limit: SYSTEM_ADMIN_DATA_MANAGEMENT_QUERY_LIMIT,
    }),
  ]);

  const importJobsSearch = resolveSystemAdminListSearch(
    input.searchParams,
    "importJobs",
  );
  const failuresSearch = resolveSystemAdminListSearch(
    input.searchParams,
    "importFailures",
  );
  const exportsSearch = resolveSystemAdminListSearch(
    input.searchParams,
    "dataExports",
  );

  const jobs = jobRows.map(mapImportJob);
  const failures = failureRows.map(mapFailure);
  const exports = exportRows.map(mapExport);

  return {
    templates: listSystemAdminImportTemplates(),
    importJobs: filterSystemAdminListRows(jobs, importJobsSearch, [
      "id",
      "adapterId",
      "templateLabel",
      "sourceLabel",
      "statusLabel",
      "createdByAuthUserId",
    ]),
    rowFailures: filterSystemAdminListRows(failures, failuresSearch, [
      "jobId",
      "statusLabel",
      "validationCode",
      "validationMessage",
      "rowDigest",
    ]),
    exportJobs: filterSystemAdminListRows(exports, exportsSearch, [
      "id",
      "exportType",
      "sourceLabel",
      "statusLabel",
      "createdByAuthUserId",
      "packageDigest",
    ]),
    summary: summarize({ jobs, exports }),
    importJobsSearch,
    failuresSearch,
    exportsSearch,
  };
}
