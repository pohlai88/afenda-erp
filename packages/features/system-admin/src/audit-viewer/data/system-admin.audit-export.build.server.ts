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

function escapeCsvCell(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

function mapExportRows(rows: readonly TenantAuditLog[]) {
  const metadataById = new Map(
    rows.map((row) => [row.id, redactAuditMetadata(row.metadata)]),
  );
  const mapped = rows.map(mapTenantAuditLogToRow);

  return mapped.map((row) => ({
    time: row.occurredAt,
    actor: row.actorId,
    action: row.action,
    target: row.target,
    module: row.moduleKey,
    result: row.result,
    summary: row.summary,
    metadata: JSON.stringify(metadataById.get(row.id) ?? {}),
  }));
}

async function buildPdfExport(rows: ReturnType<typeof mapExportRows>) {
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
  drawLine("---");

  for (const row of rows) {
    drawLine(
      `${row.time} | ${row.actor} | ${row.action} | ${row.target} | ${row.summary}`,
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
}): AuditExportBody | Promise<AuditExportBody> {
  const exportRows = mapExportRows(input.rows);

  if (input.format === "json") {
    const payload = exportRows.map((row) => ({
      ...row,
      metadata: JSON.parse(row.metadata) as Record<string, unknown>,
    }));

    return {
      content: JSON.stringify(payload, null, 2),
      mimeType: "application/json;charset=utf-8",
      fileExtension: "json",
      encoding: "utf8",
    };
  }

  if (input.format === "xlsx") {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportRows);
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
    return buildPdfExport(exportRows);
  }

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
  const lines = exportRows.map((row) =>
    [
      row.time,
      row.actor,
      row.action,
      row.target,
      row.module,
      row.result,
      row.summary,
      row.metadata,
    ]
      .map((cell) => escapeCsvCell(String(cell)))
      .join(","),
  );

  return {
    content: [header.join(","), ...lines].join("\n"),
    mimeType: "text/csv;charset=utf-8",
    fileExtension: "csv",
    encoding: "utf8",
  };
}
