"use server";

import { searchTenantAuditLogs, getRetentionPolicy, upsertRetentionPolicy } from "@afenda/db";
import { writeExecutionAuditEvent } from "@afenda/kernel/execution";
import { logServerEvent } from "@afenda/observability/server";
import { revalidatePath } from "next/cache";
import {
  systemAdminActionSuccess,
  type SystemAdminActionResult,
  zodActionFailure,
} from "../../tenant-execution/contracts/system-admin.action-result.contract";
import { dispatchSystemAdminWebhook } from "../../integrations/events/system-admin.webhook-dispatch.event";
import {
  requireSystemAdminAuditExport,
  requireSystemAdminAuditReview,
} from "../policies/system-admin.audit-viewer.policy.server";
import { systemAdminRetentionPolicyActionSchema } from "../schemas/system-admin.retention-action.schema";
import {
  systemAdminAuditViewerAuditActions,
  systemAdminAuditViewerRetentionUpdatedWebhookEvent,
} from "../events/system-admin.audit-viewer.event";
import { buildSystemAdminAuditSearchFilters } from "./system-admin.audit-search-filters.shared";
import { parseSystemAdminAuditExportFormData } from "./system-admin.audit-export-form.shared";
import { buildAuditExportBody } from "./system-admin.audit-export.build.server";
import type { SystemAdminAuditExportPayload } from "../contracts/system-admin.audit-export.contract";
import { SYSTEM_ADMIN_AUDIT_EXPORT_ROW_LIMIT } from "../contracts/system-admin.audit-viewer.limits.shared";
import { SYSTEM_ADMIN_AUDIT_PATH } from "../surface/system-admin.audit-pagination.shared";

export async function exportSystemAdminAuditLogsAction(
  formData: FormData,
): Promise<SystemAdminActionResult<SystemAdminAuditExportPayload>> {
  const { context, organization, session } =
    await requireSystemAdminAuditExport();

  const { formatParsed, paramsParsed } = parseSystemAdminAuditExportFormData(formData);
  if (!formatParsed.success) {
    return zodActionFailure(formatParsed.error);
  }
  if (!paramsParsed.success) {
    return zodActionFailure(paramsParsed.error);
  }

  const params = paramsParsed.data;

  const { rows, totalCount } = await searchTenantAuditLogs({
    organizationId: organization.id,
    limit: SYSTEM_ADMIN_AUDIT_EXPORT_ROW_LIMIT,
    offset: 0,
    filters: buildSystemAdminAuditSearchFilters(params),
  });

  const truncated = totalCount > rows.length;

  const exportBody = await buildAuditExportBody({
    format: formatParsed.data,
    rows,
    truncated,
    totalCount,
    rowLimit: SYSTEM_ADMIN_AUDIT_EXPORT_ROW_LIMIT,
  });

  await writeExecutionAuditEvent({
    organizationId: organization.id,
    actorId: context.userId,
    actorType: context.actorType,
    action: systemAdminAuditViewerAuditActions.export,
    targetType: "organization",
    targetId: organization.id,
    metadata: {
      rowCount: rows.length,
      totalCount,
      truncated,
      rowLimit: SYSTEM_ADMIN_AUDIT_EXPORT_ROW_LIMIT,
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
    { rowCount: rows.length, totalCount, truncated, format: formatParsed.data },
  );

  revalidatePath(SYSTEM_ADMIN_AUDIT_PATH);
  return systemAdminActionSuccess({
    format: formatParsed.data,
    content: exportBody.content,
    rowCount: rows.length,
    totalCount,
    truncated,
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

  const existingPolicy = await getRetentionPolicy({
    organizationId: organization.id,
    entityType: parsed.data.entityType,
  });

  const orgHoldActivated =
    parsed.data.legalHold &&
    !existingPolicy?.legalHold &&
    (parsed.data.entityType === "document" ||
      parsed.data.entityType === "organization");

  await upsertRetentionPolicy({
    organizationId: organization.id,
    entityType: parsed.data.entityType,
    retentionDays: parsed.data.retentionDays,
    legalHold: parsed.data.legalHold,
    actorAuthUserId: session.id,
  });

  if (orgHoldActivated) {
    const { cascadeOrganizationLegalHoldCommand } = await import(
      "../../tenant-execution/commands/cascade-organization-legal-hold.command.server"
    );

    await cascadeOrganizationLegalHoldCommand({
      organizationId: organization.id,
      actorAuthUserId: session.id,
    });
  }

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
    eventType: systemAdminAuditViewerRetentionUpdatedWebhookEvent,
    payload: {
      entityType: parsed.data.entityType,
      retentionDays: parsed.data.retentionDays,
      legalHold: parsed.data.legalHold,
    },
  });

  revalidatePath(SYSTEM_ADMIN_AUDIT_PATH);
  return systemAdminActionSuccess(undefined);
}
