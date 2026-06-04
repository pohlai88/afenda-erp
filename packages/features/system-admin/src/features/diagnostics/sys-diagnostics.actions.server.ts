"use server";

import { writeExecutionAuditEvent } from "@afenda/kernel/execution";
import {
  systemAdminActionSuccess,
  type SystemAdminActionResult,
} from "../tenant-execution/sys-action-result.contract";
import { requireSystemAdminDiagnosticsRead } from "./sys-diagnostics.policy.server";
import { getSystemAdminDiagnosticsPageModel } from "./sys-diagnostics.page-model.server";

function escapeCsvCell(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

export async function exportSystemAdminDiagnosticsAction(): Promise<
  SystemAdminActionResult<{ csv: string; rowCount: number }>
> {
  const { context, organization } = await requireSystemAdminDiagnosticsRead();

  const model = await getSystemAdminDiagnosticsPageModel({
    organizationId: organization.id,
  });

  const header = [
    "id",
    "category",
    "severity",
    "title",
    "description",
    "targetType",
    "targetId",
    "recommendedAction",
  ];

  const rows = model.issues.map((issue) => [
    issue.id,
    issue.category,
    issue.severity,
    issue.title,
    issue.description,
    issue.targetType ?? "",
    issue.targetId ?? "",
    issue.recommendedAction ?? "",
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map((cell) => escapeCsvCell(cell)).join(","))
    .join("\n");

  await writeExecutionAuditEvent({
    organizationId: organization.id,
    actorId: context.userId,
    actorType: context.actorType,
    action: "system-admin.diagnostics.export",
    targetType: "organization",
    targetId: organization.id,
    metadata: { rowCount: rows.length },
  });

  return systemAdminActionSuccess({ csv, rowCount: rows.length });
}
