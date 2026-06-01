"use server";

import { createHash } from "node:crypto";
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
import { SYSTEM_ADMIN_DATA_MANAGEMENT_QUERY_LIMIT } from "../contracts/system-admin.data-management.limits.shared";
import { systemAdminDataManagementAuditActions } from "../events";
import {
  requireSystemAdminDataManagementCancel,
  requireSystemAdminDataManagementExport,
  requireSystemAdminDataManagementManage,
  requireSystemAdminDataManagementRun,
} from "../policies/system-admin.data-management.policy.server";
import {
  exportSystemAdminDataManagementSchema,
  systemAdminImportJobCommandSchema,
} from "../schemas";
import { parseSystemAdminCsv } from "../data/system-admin.data-management-csv.parse.shared";
import { writeSystemAdminDataManagementAudit } from "../data/system-admin.data-management-audit.shared";
import { buildSystemAdminDataManagementExportCsv } from "../data/system-admin.data-management-export.build.server";
import { findMissingCsvHeaders } from "../data/system-admin.data-management-headers.shared";
import {
  getSystemAdminImportAdapter,
  getSystemAdminImportTemplate,
} from "../data/system-admin.import-adapter.registry.server";
import { parseSystemAdminImportJobFormData } from "../data/system-admin.import-job-form.shared";
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

export async function createSystemAdminImportJobAction(
  formData: FormData,
): Promise<SystemAdminActionResult<CreateSystemAdminImportJobActionData>> {
  const { context, organization } =
    await requireSystemAdminDataManagementManage();

  const parsed = parseSystemAdminImportJobFormData(formData);

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

  const missingHeaders = findMissingCsvHeaders(
    csv.headers,
    template.requiredHeaders,
  );
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

  await writeSystemAdminDataManagementAudit({
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

  await writeSystemAdminDataManagementAudit({
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
    await writeSystemAdminDataManagementAudit({
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

    if (jobBeforeRun.status === "completed") {
      return systemAdminActionSuccess({
        jobId: jobBeforeRun.id,
        status: jobBeforeRun.status,
        totalRows: jobBeforeRun.totalRows,
        failedRows: jobBeforeRun.failedRows,
      });
    }

    const adapter = getSystemAdminImportAdapter(jobBeforeRun.adapterId);
    if (!adapter) {
      return systemAdminActionFailure("Data import adapter is no longer available.");
    }

    const job = await runSystemAdminDataImportJob({
      organizationId: organization.id,
      jobId: parsed.data.jobId,
    });

    await writeSystemAdminDataManagementAudit({
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

    await writeSystemAdminDataManagementAudit({
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

    await writeSystemAdminDataManagementAudit({
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

    await writeSystemAdminDataManagementAudit({
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

  const { csv, rowCount, truncated } = buildSystemAdminDataManagementExportCsv({
    scope: parsed.data.scope,
    jobs: model.importJobs,
    failures: model.rowFailures,
    exports: model.exportJobs,
    queryLimit: SYSTEM_ADMIN_DATA_MANAGEMENT_QUERY_LIMIT,
  });

  const exportJob = await recordSystemAdminDataExportJob({
    organizationId: organization.id,
    exportType: parsed.data.scope,
    sourceLabel: `system-admin.data-management.${parsed.data.scope}`,
    rowCount,
    packageDigest: digest(csv),
    createdByAuthUserId: context.userId,
    metadata: {
      redacted: true,
      scope: parsed.data.scope,
      truncated,
    },
  });

  await writeSystemAdminDataManagementAudit({
    organizationId: organization.id,
    actorId: context.userId,
    actorType: context.actorType,
    action: systemAdminDataManagementAuditActions.export,
    targetId: exportJob.id,
    metadata: {
      exportType: parsed.data.scope,
      rowCount: exportJob.rowCount,
      packageDigest: exportJob.packageDigest,
      truncated,
    },
  });

  revalidatePath(systemAdminRoutePaths.dataManagement);

  return systemAdminActionSuccess({
    csv,
    rowCount: exportJob.rowCount,
    exportId: exportJob.id,
    truncated,
  });
}
