import type {
  SystemAdminExportJobListRow,
  SystemAdminImportJobListRow,
  SystemAdminImportRowFailure,
} from "./sys-import-job.contract";

function escapeCsvCell(value: string | number | null | undefined) {
  const normalized = String(value ?? "");
  if (/[",\n]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }

  return normalized;
}

function buildCsv(rows: readonly (readonly (string | number | null | undefined)[])[]) {
  return rows.map((row) => row.map(escapeCsvCell).join(",")).join("\n");
}

export function buildSystemAdminDataManagementExportCsv(input: {
  scope: "jobs" | "failures" | "exports";
  jobs: readonly SystemAdminImportJobListRow[];
  failures: readonly SystemAdminImportRowFailure[];
  exports: readonly SystemAdminExportJobListRow[];
  queryLimit: number;
}): { csv: string; rowCount: number; truncated: boolean } {
  if (input.scope === "failures") {
    const truncated = input.failures.length >= input.queryLimit;
    const csv = buildCsv([
      [
        "id",
        "jobId",
        "rowNumber",
        "status",
        "code",
        "message",
        "rowDigest",
      ],
      ...input.failures.map((row) => [
        row.id,
        row.jobId,
        row.rowNumber,
        row.status,
        row.validationCode,
        row.validationMessage,
        row.rowDigest,
      ]),
    ]);

    return { csv, rowCount: input.failures.length, truncated };
  }

  if (input.scope === "exports") {
    const truncated = input.exports.length >= input.queryLimit;
    const csv = buildCsv([
      [
        "id",
        "exportType",
        "sourceLabel",
        "status",
        "rowCount",
        "packageDigest",
        "createdBy",
        "createdAt",
      ],
      ...input.exports.map((row) => [
        row.id,
        row.exportType,
        row.sourceLabel,
        row.status,
        row.rowCount,
        row.packageDigest,
        row.createdByAuthUserId,
        row.createdAt.toISOString(),
      ]),
    ]);

    return { csv, rowCount: input.exports.length, truncated };
  }

  const truncated = input.jobs.length >= input.queryLimit;
  const csv = buildCsv([
    [
      "id",
      "adapterId",
      "templateId",
      "sourceLabel",
      "status",
      "totalRows",
      "validatedRows",
      "appliedRows",
      "failedRows",
      "skippedRows",
      "inputDigest",
      "createdBy",
      "createdAt",
      "completedAt",
    ],
    ...input.jobs.map((row) => [
      row.id,
      row.adapterId,
      row.templateId,
      row.sourceLabel,
      row.status,
      row.totalRows,
      row.validatedRows,
      row.appliedRows,
      row.failedRows,
      row.skippedRows,
      row.inputDigest,
      row.createdByAuthUserId,
      row.createdAt.toISOString(),
      row.completedAt?.toISOString() ?? "",
    ]),
  ]);

  return { csv, rowCount: input.jobs.length, truncated };
}
