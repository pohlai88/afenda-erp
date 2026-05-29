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
import { dispatchSystemAdminWebhook } from "../../integrations";
import {
  requireSystemAdminAuditExport,
  requireSystemAdminAuditRead,
} from "../policies/system-admin.audit-viewer.policy.server";
import { systemAdminRetentionPolicyActionSchema } from "../schemas/system-admin.retention-action.schema";
import {
  systemAdminAuditViewerAuditActions,
  systemAdminAuditViewerWebhookEvents,
} from "../events/system-admin.audit-viewer.event";
import {
  mapTenantAuditLogToRow,
  parseAuditFilterDate,
} from "../data/system-admin.audit.query.server";
import { parseSystemAdminAuditSearchParams } from "../data/parse-audit-search-params";
import { redactAuditMetadata } from "../data/redact-audit-metadata";

const EXPORT_ROW_LIMIT = 5_000;

function escapeCsvCell(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

export async function exportSystemAdminAuditLogsAction(
  formData: FormData,
): Promise<SystemAdminActionResult<{ csv: string; rowCount: number }>> {
  const { context, organization, session } =
    await requireSystemAdminAuditExport();

  const readOptional = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" && value.length > 0 ? value : undefined;
  };

  const params = parseSystemAdminAuditSearchParams({
    auditQ: readOptional("auditQ"),
    auditActor: readOptional("auditActor"),
    auditAction: readOptional("auditAction"),
    auditTargetType: readOptional("auditTargetType"),
    auditModule: readOptional("auditModule"),
    auditFrom: readOptional("auditFrom"),
    auditTo: readOptional("auditTo"),
  });

  const { rows } = await searchTenantAuditLogs({
    organizationId: organization.id,
    limit: EXPORT_ROW_LIMIT,
    offset: 0,
    filters: {
      actorAuthUserId: params.auditActor,
      action: params.auditAction,
      entityType: params.auditTargetType,
      moduleKey: params.auditModule,
      query: params.auditQ,
      createdAfter: parseAuditFilterDate(params.auditFrom),
      createdBefore: parseAuditFilterDate(params.auditTo),
    },
  });

  const mapped = rows.map(mapTenantAuditLogToRow);
  const header = [
    "time",
    "actor",
    "action",
    "target",
    "module",
    "result",
    "summary",
    "metadata",
  ];
  const lines = mapped.map((row) =>
    [
      row.occurredAt,
      row.actorId,
      row.action,
      row.target,
      row.moduleKey,
      row.result,
      row.summary,
      JSON.stringify(
        redactAuditMetadata(
          rows.find((entry) => entry.id === row.id)?.metadata ?? {},
        ),
      ),
    ]
      .map((cell) => escapeCsvCell(String(cell)))
      .join(","),
  );
  const csv = [header.join(","), ...lines].join("\n");

  await writeExecutionAuditEvent({
    organizationId: organization.id,
    actorId: context.userId,
    actorType: context.actorType,
    action: systemAdminAuditViewerAuditActions.export,
    targetType: "organization",
    targetId: organization.id,
    metadata: {
      rowCount: mapped.length,
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
    { rowCount: mapped.length },
  );

  revalidatePath("/system-admin/audit");
  return systemAdminActionSuccess({ csv, rowCount: mapped.length });
}

export async function upsertSystemAdminRetentionPolicyAction(
  _previous: SystemAdminActionResult | undefined,
  formData: FormData,
): Promise<SystemAdminActionResult> {
  const { session, organization } = await requireSystemAdminAuditExport();

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

export async function recordSystemAdminAuditViewerAccess(input: {
  organizationId: string;
}) {
  await requireSystemAdminAuditRead();
  return input.organizationId;
}
