"use server";

import { searchTenantAuditLogs, upsertRetentionPolicy } from "@afenda/db";
import { writeExecutionAuditEvent } from "@afenda/kernel/execution";
import { logServerEvent } from "@afenda/observability";
import { revalidatePath } from "next/cache";
import {
  systemAdminActionSuccess,
  type SystemAdminActionResult,
  zodActionFailure,
} from "../../tenant-execution/contracts/system-admin.action-result.contract";
import { dispatchSystemAdminWebhook } from "../../integrations/server";
import {
  requireSystemAdminAuditExport,
  requireSystemAdminAuditReview,
} from "../policies/system-admin.audit-viewer.policy.server";
import { systemAdminRetentionPolicyActionSchema } from "../schemas/system-admin.retention-action.schema";
import { systemAdminAuditExportFormatSchema } from "../schemas/system-admin.audit-export.schema";
import {
  systemAdminAuditViewerAuditActions,
  systemAdminAuditViewerWebhookEvents,
} from "../events/system-admin.audit-viewer.event";
import { parseAuditFilterDate } from "../data/system-admin.audit.query.server";
import { parseSystemAdminAuditSearchParams } from "../data/system-admin.audit-search-params.parse.shared";
import { buildAuditExportBody } from "../data/system-admin.audit-export.build.server";
import type { SystemAdminAuditExportPayload } from "../contracts/system-admin.audit-export.contract";

const EXPORT_ROW_LIMIT = 5_000;

export async function exportSystemAdminAuditLogsAction(
  formData: FormData,
): Promise<SystemAdminActionResult<SystemAdminAuditExportPayload>> {
  const { context, organization, session } =
    await requireSystemAdminAuditExport();

  const readOptional = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" && value.length > 0 ? value : undefined;
  };

  const formatParsed = systemAdminAuditExportFormatSchema.safeParse(
    readOptional("format") ?? "csv",
  );
  if (!formatParsed.success) {
    return zodActionFailure(formatParsed.error);
  }

  const params = parseSystemAdminAuditSearchParams({
    auditQ: readOptional("auditQ"),
    auditActor: readOptional("auditActor"),
    auditAction: readOptional("auditAction"),
    auditTargetType: readOptional("auditTargetType"),
    auditTargetId: readOptional("auditTargetId"),
    auditModule: readOptional("auditModule"),
    auditFrom: readOptional("auditFrom"),
    auditTo: readOptional("auditTo"),
    auditSort: readOptional("auditSort"),
  });

  const { rows } = await searchTenantAuditLogs({
    organizationId: organization.id,
    limit: EXPORT_ROW_LIMIT,
    offset: 0,
    filters: {
      actorAuthUserId: params.auditActor,
      action: params.auditAction,
      entityType: params.auditTargetType,
      entityId: params.auditTargetId,
      moduleKey: params.auditModule,
      query: params.auditQ,
      createdAfter: parseAuditFilterDate(params.auditFrom),
      createdBefore: parseAuditFilterDate(params.auditTo),
      sortDirection: params.auditSort ?? "desc",
    },
  });

  const exportBody = await Promise.resolve(
    buildAuditExportBody({
      format: formatParsed.data,
      rows,
    }),
  );

  await writeExecutionAuditEvent({
    organizationId: organization.id,
    actorId: context.userId,
    actorType: context.actorType,
    action: systemAdminAuditViewerAuditActions.export,
    targetType: "organization",
    targetId: organization.id,
    metadata: {
      rowCount: rows.length,
      format: formatParsed.data,
      filters: params,
    },
  });

  logServerEvent(
    "info",
    "System admin audit export generated.",
    {
      organizationId: organization.id,
      userId: session.id,
      module: "system-admin",
      operation: "audit.export",
    },
    { rowCount: rows.length, format: formatParsed.data },
  );

  revalidatePath("/system-admin/audit");
  return systemAdminActionSuccess({
    format: formatParsed.data,
    content: exportBody.content,
    rowCount: rows.length,
    mimeType: exportBody.mimeType,
    fileExtension: exportBody.fileExtension,
    encoding: exportBody.encoding,
  });
}

export async function upsertSystemAdminRetentionPolicyAction(
  _previous: SystemAdminActionResult | undefined,
  formData: FormData,
): Promise<SystemAdminActionResult> {
  const { session, organization, context } = await requireSystemAdminAuditReview();

  const parsed = systemAdminRetentionPolicyActionSchema.safeParse({
    entityType: formData.get("entityType"),
    retentionDays: formData.get("retentionDays"),
    legalHold: formData.get("legalHold"),
  });
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  await upsertRetentionPolicy({
    organizationId: organization.id,
    entityType: parsed.data.entityType,
    retentionDays: parsed.data.retentionDays,
    legalHold: parsed.data.legalHold,
    actorAuthUserId: session.id,
  });

  await writeExecutionAuditEvent({
    organizationId: organization.id,
    actorId: context.userId,
    actorType: context.actorType,
    action: systemAdminAuditViewerAuditActions.review,
    targetType: "organization",
    targetId: organization.id,
    metadata: {
      operation: "retention.update",
      entityType: parsed.data.entityType,
      retentionDays: parsed.data.retentionDays,
      legalHold: parsed.data.legalHold,
    },
  });

  logServerEvent(
    "info",
    "System admin retention policy updated.",
    {
      organizationId: organization.id,
      userId: session.id,
      module: "system-admin",
      operation: "audit.retention.update",
    },
    {
      entityType: parsed.data.entityType,
      legalHold: parsed.data.legalHold,
    },
  );
  await dispatchSystemAdminWebhook({
    organizationId: organization.id,
    userId: session.id,
    eventType: systemAdminAuditViewerWebhookEvents[0],
    payload: {
      entityType: parsed.data.entityType,
      retentionDays: parsed.data.retentionDays,
      legalHold: parsed.data.legalHold,
    },
  });

  revalidatePath("/system-admin/audit");
  return systemAdminActionSuccess(undefined);
}
