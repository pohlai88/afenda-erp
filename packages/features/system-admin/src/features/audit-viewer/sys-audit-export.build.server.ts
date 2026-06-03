import type { TenantAuditLog } from "@afenda/db";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import * as XLSX from "xlsx";
import type { SystemAdminAuditExportFormat } from "../schemas/system-admin.audit-export.schema";
import { mapTenantAuditLogToRow } from "./system-admin.audit.query.server";
import { redactAuditMetadata } from "./system-admin.audit-metadata.redact.shared";

export type AuditExportBody = {
  content: string;
  mimeType: string;
  fileExtension: string;
  encoding: "utf8" | "base64";
};

type AuditExportRow = {
  id: string;
  time: string;
  actor: string;
  actorType: string;
  actorRole: string;
  action: string;
  targetType: string;
  target: string;
  targetId: string;
  targetDisplayName: string;
  entityType: string;
  entityId: string;
  module: string;
  surface: string;
  route: string;
  channel: string;
  result: string;
  outcome: string;
  reason: string;
  policyReference: string;
  approvalId: string;
  requestId: string;
  operationId: string;
  summary: string;
  before: unknown;
  after: unknown;
  diff: unknown;
  metadata: unknown;
};

function escapeCsvCell(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

function serializeRedactedMetadata(value: unknown) {
  try {
    return JSON.stringify(value ?? {});
  } catch (error) {
    throw new Error("Audit export metadata is not JSON-serializable.", {
      cause: error,
    });
  }
}

function mapExportRows(rows: readonly TenantAuditLog[]): AuditExportRow[] {
  const metadataById = new Map(
    rows.map((row) => [row.id, redactAuditMetadata(row.metadata)]),
  );
  const mapped = rows.map((row) => {
    const rowView = mapTenantAuditLogToRow(row);

    return {
      ...rowView,
      actorType: row.actorType ?? "",
      actorRole: row.actorRole ?? "",
      targetType: rowView.targetType ?? row.targetType ?? row.entityType,
      targetId: rowView.targetId ?? row.targetId ?? row.entityId,
      targetDisplayName: row.targetDisplayName ?? "",
      entityType: row.entityType,
      entityId: row.entityId,
      surface: row.surface ?? "",
      route: row.route ?? "",
      channel: row.channel ?? "",
      reason: row.reason ?? "",
      policyReference: row.policyReference ?? "",
      approvalId: row.approvalId ?? "",
      requestId: row.requestId ?? "",
      operationId: row.operationId ?? "",
      outcome: row.outcome ?? rowView.result ?? "",
      beforeJson: row.beforeJson ?? null,
      afterJson: row.afterJson ?? null,
      diffJson: row.diffJson ?? null,
    };
  });

  return mapped.map((row) => ({
    id: row.id,
    time: row.occurredAt,
    actor: row.actorId,
    actorType: row.actorType,
    actorRole: row.actorRole,
    action: row.action,
    targetType: row.targetType,
    target: row.target,
    targetId: row.targetId,
    targetDisplayName: row.targetDisplayName,
    entityType: row.entityType,
    entityId: row.entityId,
    module: row.moduleKey,
    surface: row.surface,
    route: row.route,
    channel: row.channel,
    result: row.outcome || row.result,
    outcome: row.outcome,
    reason: row.reason,
    policyReference: row.policyReference,
    approvalId: row.approvalId,
    requestId: row.requestId,
    operationId: row.operationId,
    summary: row.summary,
    before: row.beforeJson ?? null,
    after: row.afterJson ?? null,
    diff: row.diffJson ?? null,
    metadata: metadataById.get(row.id) ?? {},
  }));
}

function serializeTabularRow(row: AuditExportRow) {
  return {
    time: row.time,
    actor: row.actor,
    actorType: row.actorType,
    actorRole: row.actorRole,
    action: row.action,
    targetType: row.targetType,
    target: row.target,
    targetId: row.targetId,
    targetDisplayName: row.targetDisplayName,
    entityType: row.entityType,
    entityId: row.entityId,
    module: row.module,
    surface: row.surface,
    route: row.route,
    channel: row.channel,
    result: row.result,
    outcome: row.outcome,
    reason: row.reason,
    policyReference: row.policyReference,
    approvalId: row.approvalId,
    requestId: row.requestId,
    operationId: row.operationId,
    summary: row.summary,
    before: serializeRedactedMetadata(row.before),
    after: serializeRedactedMetadata(row.after),
    diff: serializeRedactedMetadata(row.diff),
    metadata: serializeRedactedMetadata(row.metadata),
  };
}

function buildTruncationNotice(input: {
  truncated: boolean;
  rowCount: number;
  totalCount: number;
  rowLimit: number;
}) {
  if (!input.truncated) {
    return null;
  }

  return `Export truncated: ${input.rowCount} of ${input.totalCount} matching events (limit ${input.rowLimit}).`;
}

async function buildPdfExport(
  rows: readonly ReturnType<typeof serializeTabularRow>[],
  truncationNotice: string | null,
) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontSize = 9;
  const lineHeight = 12;
  const margin = 40;
  const pageWidth = 595;
  const pageHeight = 842;
  const maxWidth = pageWidth - margin * 2;

  let page = pdf.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  const drawLine = (text: string) => {
    if (y < margin + lineHeight) {
      page = pdf.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }

    page.drawText(text.slice(0, 120), {
      x: margin,
      y,
      size: fontSize,
      font,
      color: rgb(0.1, 0.1, 0.1),
      maxWidth,
    });
    y -= lineHeight;
  };

  drawLine("Afenda administrative audit evidence export");
  drawLine(`Generated: ${new Date().toISOString()}`);
  if (truncationNotice) {
    drawLine(truncationNotice);
  }
  drawLine("---");

  for (const row of rows) {
    drawLine(
      `${row.time} | ${row.actor} | ${row.action} | ${row.target} | ${row.result} | ${row.summary}`,
    );
    drawLine(
      `targetType=${row.targetType} targetId=${row.targetId} module=${row.module}`,
    );
  }

  const bytes = await pdf.save();

  return {
    content: Buffer.from(bytes).toString("base64"),
    mimeType: "application/pdf",
    fileExtension: "pdf",
    encoding: "base64" as const,
  };
}

export function buildAuditExportBody(input: {
  format: SystemAdminAuditExportFormat;
  rows: readonly TenantAuditLog[];
  truncated?: boolean;
  totalCount?: number;
  rowLimit?: number;
}): AuditExportBody | Promise<AuditExportBody> {
  const exportRows = mapExportRows(input.rows);
  const tabularRows = exportRows.map(serializeTabularRow);
  const truncationNotice = buildTruncationNotice({
    truncated: input.truncated ?? false,
    rowCount: tabularRows.length,
    totalCount: input.totalCount ?? exportRows.length,
    rowLimit: input.rowLimit ?? tabularRows.length,
  });

  if (input.format === "json") {
    return {
      content: JSON.stringify(
        {
          ...(truncationNotice ? { exportNotice: truncationNotice } : {}),
          rows: exportRows,
        },
        null,
        2,
      ),
      mimeType: "application/json;charset=utf-8",
      fileExtension: "json",
      encoding: "utf8",
    };
  }

  if (input.format === "xlsx") {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(tabularRows);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Audit evidence");
    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    }) as Buffer;

    return {
      content: Buffer.from(buffer).toString("base64"),
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      fileExtension: "xlsx",
      encoding: "base64",
    };
  }

  if (input.format === "pdf") {
    return buildPdfExport(tabularRows, truncationNotice);
  }

  const header = [
    "time",
    "actor",
    "actorType",
    "actorRole",
    "action",
    "targetType",
    "target",
    "targetId",
    "targetDisplayName",
    "entityType",
    "entityId",
    "module",
    "surface",
    "route",
    "channel",
    "result",
    "outcome",
    "reason",
    "policyReference",
    "approvalId",
    "requestId",
    "operationId",
    "summary",
    "before",
    "after",
    "diff",
    "metadata",
  ];
  const lines = tabularRows.map((row) =>
    [
      row.time,
      row.actor,
      row.actorType,
      row.actorRole,
      row.action,
      row.targetType,
      row.target,
      row.targetId,
      row.targetDisplayName,
      row.entityType,
      row.entityId,
      row.module,
      row.surface,
      row.route,
      row.channel,
      row.result,
      row.outcome,
      row.reason,
      row.policyReference,
      row.approvalId,
      row.requestId,
      row.operationId,
      row.summary,
      row.before,
      row.after,
      row.diff,
      row.metadata,
    ]
      .map((cell) => escapeCsvCell(String(cell)))
      .join(","),
  );

  return {
    content: [
      ...(truncationNotice ? [`# ${truncationNotice}`] : []),
      header.join(","),
      ...lines,
    ].join("\n"),
    mimeType: "text/csv;charset=utf-8",
    fileExtension: "csv",
    encoding: "utf8",
  };
}
