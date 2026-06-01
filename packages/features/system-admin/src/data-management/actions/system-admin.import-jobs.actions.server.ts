"use server";

import { createHash } from "node:crypto";
import {
  writeExecutionAuditEvent,
  type ExecutionActorType,
} from "@afenda/kernel/execution";
import { revalidatePath } from "next/cache";
import { systemAdminRoutePaths } from "../../overview/contracts/system-admin.route-paths.contract";
import {
  systemAdminActionFailure,
  systemAdminActionSuccess,
  type SystemAdminActionResult,
  zodActionFailure,
} from "../../tenant-execution/contracts/system-admin.action-result.contract";
import type {
  CreateSystemAdminImportJobActionData,
  ExportSystemAdminDataManagementActionData,
} from "../contracts";
import { systemAdminDataManagementAuditActions } from "../events";
import {
  requireSystemAdminDataManagementCancel,
  requireSystemAdminDataManagementExport,
  requireSystemAdminDataManagementManage,
  requireSystemAdminDataManagementRun,
} from "../policies/system-admin.data-management.policy.server";
import {
  createSystemAdminImportJobSchema,
  exportSystemAdminDataManagementSchema,
  systemAdminImportJobCommandSchema,
} from "../schemas";
import { parseSystemAdminCsv } from "../data/system-admin.data-management-csv.parse.shared";
import {
  getSystemAdminImportAdapter,
  getSystemAdminImportTemplate,
} from "../data/system-admin.import-adapter.registry.server";
import {
  cancelSystemAdminDataImportJob,
  createSystemAdminDataImportJob,
  getSystemAdminDataImportJob,
  recordSystemAdminDataExportJob,
  retrySystemAdminDataImportJob,
  runSystemAdminDataImportJob,
} from "../data/system-admin.import-jobs.query.server";
import { buildSystemAdminDataManagementPageModel } from "../data/system-admin.data-management.page-model.server";

function digest(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

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

function normalizeFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function findMissingHeaders(
  actualHeaders: readonly string[],
  requiredHeaders: readonly string[],
) {
  const actual = new Set(actualHeaders.map((header) => header.toLowerCase()));
  return requiredHeaders.filter((header) => !actual.has(header.toLowerCase()));
}

async function writeDataManagementAudit(input: {
  organizationId: string;
  actorId: string;
  actorType: ExecutionActorType;
  action: string;
  targetId: string;
  metadata?: Record<string, unknown>;
}) {
  await writeExecutionAuditEvent({
    organizationId: input.organizationId,
    actorId: input.actorId,
    actorType: input.actorType,
    action: input.action,
    targetType: "system_admin_data_management",
    targetId: input.targetId,
    metadata: input.metadata,
  });
}

export async function createSystemAdminImportJobAction(
  formData: FormData,
): Promise<SystemAdminActionResult<CreateSystemAdminImportJobActionData>> {
  const { context, organization } =
    await requireSystemAdminDataManagementManage();

  const parsed = createSystemAdminImportJobSchema.safeParse({
    templateId: normalizeFormString(formData, "templateId"),
    sourceLabel: normalizeFormString(formData, "sourceLabel"),
    filename: normalizeFormString(formData, "filename") || undefined,
    sourceData: normalizeFormString(formData, "sourceData"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const template = getSystemAdminImportTemplate(parsed.data.templateId);
  if (!template) {
    return systemAdminActionFailure("Select an approved import template.", {
      templateId: "Unknown import template.",
    });
  }

  const adapter = getSystemAdminImportAdapter(template.adapterId);
  if (!adapter || adapter.template.id !== template.id) {
    return systemAdminActionFailure("Selected import adapter is not approved.", {
      templateId: "Template and adapter are not compatible.",
    });
  }

  const csv = parseSystemAdminCsv(parsed.data.sourceData);
  if (csv.errors.length > 0) {
    return systemAdminActionFailure("CSV source could not be parsed.", {
      sourceData: csv.errors.join(" "),
    });
  }

  const missingHeaders = findMissingHeaders(csv.headers, template.requiredHeaders);
  if (missingHeaders.length > 0) {
    return systemAdminActionFailure("CSV source is missing required headers.", {
      sourceData: `Missing headers: ${missingHeaders.join(", ")}`,
    });
  }

  const rows = csv.records.map((record, index) => {
    const result = adapter.parseRow(record);
    const rowDigest = digest(JSON.stringify(record));

    if (!result.ok) {
      return {
        rowNumber: index + 2,
        status: "failed" as const,
        rowDigest,
        validationCode: result.code,
        validationMessage: result.message,
        redactedPreview: result.redactedPreview,
      };
    }

    return {
      rowNumber: index + 2,
      status: "validated" as const,
      rowDigest,
      validationCode: null,
      validationMessage: null,
      redactedPreview: result.redactedPreview,
    };
  });

  const job = await createSystemAdminDataImportJob({
    organizationId: organization.id,
    adapterId: adapter.id,
    templateId: template.id,
    sourceLabel: parsed.data.sourceLabel,
    filename: parsed.data.filename ?? null,
    inputDigest: digest(parsed.data.sourceData),
    createdByAuthUserId: context.userId,
    metadata: {
      templateVersion: template.version,
      targetDomain: template.targetDomain,
      rawFileStored: false,
      parser: "system-admin.data-management.csv",
    },
    rows,
  });

  await writeDataManagementAudit({
    organizationId: organization.id,
    actorId: context.userId,
    actorType: context.actorType,
    action: systemAdminDataManagementAuditActions.importCreate,
    targetId: job.id,
    metadata: {
      adapterId: adapter.id,
      templateId: template.id,
      sourceLabel: parsed.data.sourceLabel,
      inputDigest: job.inputDigest,
      totalRows: job.totalRows,
      failedRows: job.failedRows,
      rawFileStored: false,
    },
  });

  await writeDataManagementAudit({
    organizationId: organization.id,
    actorId: context.userId,
    actorType: context.actorType,
    action: systemAdminDataManagementAuditActions.importValidate,
    targetId: job.id,
    metadata: {
      status: job.status,
      validatedRows: job.validatedRows,
      failedRows: job.failedRows,
      skippedRows: job.skippedRows,
      failureCodes: [
        ...new Set(
          rows
            .map((row) => row.validationCode)
            .filter((code): code is string => Boolean(code)),
        ),
      ],
    },
  });

  if (job.failedRows > 0) {
    await writeDataManagementAudit({
      organizationId: organization.id,
      actorId: context.userId,
      actorType: context.actorType,
      action: systemAdminDataManagementAuditActions.importRowReject,
      targetId: job.id,
      metadata: {
        rejectedRows: job.failedRows,
        failureCodes: [
          ...new Set(
            rows
              .map((row) => row.validationCode)
              .filter((code): code is string => Boolean(code)),
          ),
        ],
      },
    });
  }

  revalidatePath(systemAdminRoutePaths.dataManagement);

  return systemAdminActionSuccess({
    jobId: job.id,
    status: job.status,
    totalRows: job.totalRows,
    failedRows: job.failedRows,
  });
}

export async function createSystemAdminImportJobFormAction(
  _previous:
    | SystemAdminActionResult<CreateSystemAdminImportJobActionData>
    | undefined,
  formData: FormData,
) {
  return createSystemAdminImportJobAction(formData);
}

export async function runSystemAdminImportJobAction(
  jobId: string,
): Promise<SystemAdminActionResult<CreateSystemAdminImportJobActionData>> {
  const { context, organization } = await requireSystemAdminDataManagementRun();
  const parsed = systemAdminImportJobCommandSchema.safeParse({ jobId });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const jobBeforeRun = await getSystemAdminDataImportJob({
      organizationId: organization.id,
      jobId: parsed.data.jobId,
    });

    if (!jobBeforeRun) {
      return systemAdminActionFailure("Data import job was not found.");
    }

    const adapter = getSystemAdminImportAdapter(jobBeforeRun.adapterId);
    if (!adapter) {
      return systemAdminActionFailure("Data import adapter is no longer available.");
    }

    const job = await runSystemAdminDataImportJob({
      organizationId: organization.id,
      jobId: parsed.data.jobId,
    });

    await writeDataManagementAudit({
      organizationId: organization.id,
      actorId: context.userId,
      actorType: context.actorType,
      action: systemAdminDataManagementAuditActions.importRun,
      targetId: job.id,
      metadata: {
        adapterId: job.adapterId,
        templateId: job.templateId,
        appliedRows: job.appliedRows,
        failedRows: job.failedRows,
      },
    });

    await writeDataManagementAudit({
      organizationId: organization.id,
      actorId: context.userId,
      actorType: context.actorType,
      action:
        job.status === "completed"
          ? systemAdminDataManagementAuditActions.importComplete
          : systemAdminDataManagementAuditActions.importFail,
      targetId: job.id,
      metadata: {
        status: job.status,
        appliedRows: job.appliedRows,
        failedRows: job.failedRows,
        errorSummary: job.errorSummary,
      },
    });

    revalidatePath(systemAdminRoutePaths.dataManagement);

    return systemAdminActionSuccess({
      jobId: job.id,
      status: job.status,
      totalRows: job.totalRows,
      failedRows: job.failedRows,
    });
  } catch (error) {
    return systemAdminActionFailure(
      error instanceof Error ? error.message : "Import job run failed.",
    );
  }
}

export async function cancelSystemAdminImportJobAction(
  jobId: string,
): Promise<SystemAdminActionResult<CreateSystemAdminImportJobActionData>> {
  const { context, organization } =
    await requireSystemAdminDataManagementCancel();
  const parsed = systemAdminImportJobCommandSchema.safeParse({ jobId });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const job = await cancelSystemAdminDataImportJob({
      organizationId: organization.id,
      jobId: parsed.data.jobId,
    });

    await writeDataManagementAudit({
      organizationId: organization.id,
      actorId: context.userId,
      actorType: context.actorType,
      action: systemAdminDataManagementAuditActions.importCancel,
      targetId: job.id,
      metadata: {
        status: job.status,
        appliedRows: job.appliedRows,
        failedRows: job.failedRows,
        cancelledAt: job.cancelledAt?.toISOString() ?? null,
      },
    });

    revalidatePath(systemAdminRoutePaths.dataManagement);

    return systemAdminActionSuccess({
      jobId: job.id,
      status: job.status,
      totalRows: job.totalRows,
      failedRows: job.failedRows,
    });
  } catch (error) {
    return systemAdminActionFailure(
      error instanceof Error ? error.message : "Import job cancellation failed.",
    );
  }
}

export async function retrySystemAdminImportJobAction(
  jobId: string,
): Promise<SystemAdminActionResult<CreateSystemAdminImportJobActionData>> {
  const { context, organization } = await requireSystemAdminDataManagementRun();
  const parsed = systemAdminImportJobCommandSchema.safeParse({ jobId });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const currentJob = await getSystemAdminDataImportJob({
      organizationId: organization.id,
      jobId: parsed.data.jobId,
    });

    if (!currentJob) {
      return systemAdminActionFailure("Data import job was not found.");
    }

    const adapter = getSystemAdminImportAdapter(currentJob.adapterId);
    if (!adapter?.template.retrySafe) {
      return systemAdminActionFailure(
        "This import adapter is not declared retry-safe.",
      );
    }

    const job = await retrySystemAdminDataImportJob({
      organizationId: organization.id,
      jobId: parsed.data.jobId,
    });

    await writeDataManagementAudit({
      organizationId: organization.id,
      actorId: context.userId,
      actorType: context.actorType,
      action: systemAdminDataManagementAuditActions.importValidate,
      targetId: job.id,
      metadata: {
        status: job.status,
        retry: true,
        adapterId: job.adapterId,
        validatedRows: job.validatedRows,
        failedRows: job.failedRows,
      },
    });

    revalidatePath(systemAdminRoutePaths.dataManagement);

    return systemAdminActionSuccess({
      jobId: job.id,
      status: job.status,
      totalRows: job.totalRows,
      failedRows: job.failedRows,
    });
  } catch (error) {
    return systemAdminActionFailure(
      error instanceof Error ? error.message : "Import job retry failed.",
    );
  }
}

export async function exportSystemAdminDataManagementAction(input?: {
  scope?: "jobs" | "failures" | "exports";
}): Promise<SystemAdminActionResult<ExportSystemAdminDataManagementActionData>> {
  const { context, organization } =
    await requireSystemAdminDataManagementExport();
  const parsed = exportSystemAdminDataManagementSchema.safeParse({
    scope: input?.scope ?? "jobs",
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const model = await buildSystemAdminDataManagementPageModel({
    organizationId: organization.id,
  });

  const csv =
    parsed.data.scope === "failures"
      ? buildCsv([
          [
            "id",
            "jobId",
            "rowNumber",
            "status",
            "code",
            "message",
            "rowDigest",
          ],
          ...model.rowFailures.map((row) => [
            row.id,
            row.jobId,
            row.rowNumber,
            row.status,
            row.validationCode,
            row.validationMessage,
            row.rowDigest,
          ]),
        ])
      : parsed.data.scope === "exports"
        ? buildCsv([
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
            ...model.exportJobs.map((row) => [
              row.id,
              row.exportType,
              row.sourceLabel,
              row.status,
              row.rowCount,
              row.packageDigest,
              row.createdByAuthUserId,
              row.createdAt.toISOString(),
            ]),
          ])
        : buildCsv([
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
            ...model.importJobs.map((row) => [
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

  const exportJob = await recordSystemAdminDataExportJob({
    organizationId: organization.id,
    exportType: parsed.data.scope,
    sourceLabel: `system-admin.data-management.${parsed.data.scope}`,
    rowCount:
      parsed.data.scope === "failures"
        ? model.rowFailures.length
        : parsed.data.scope === "exports"
          ? model.exportJobs.length
          : model.importJobs.length,
    packageDigest: digest(csv),
    createdByAuthUserId: context.userId,
    metadata: {
      redacted: true,
      scope: parsed.data.scope,
    },
  });

  await writeDataManagementAudit({
    organizationId: organization.id,
    actorId: context.userId,
    actorType: context.actorType,
    action: systemAdminDataManagementAuditActions.export,
    targetId: exportJob.id,
    metadata: {
      exportType: parsed.data.scope,
      rowCount: exportJob.rowCount,
      packageDigest: exportJob.packageDigest,
    },
  });

  revalidatePath(systemAdminRoutePaths.dataManagement);

  return systemAdminActionSuccess({
    csv,
    rowCount: exportJob.rowCount,
    exportId: exportJob.id,
  });
}
