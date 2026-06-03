import {
  getTenantDocument,
  updateTenantDocumentScanStatus,
  type ErpDocumentScanStatus,
} from "@afenda/db";
import type { ModuleId } from "@afenda/kernel";
import { z } from "zod";

import { recordTenantDocumentEvidenceEvent } from "../api/system-admin.object-storage-governance.server";

export class ReportTenantDocumentScanResultError extends Error {
  readonly code:
    | "document_not_found"
    | "invalid_status"
    | "scan_not_in_progress";

  constructor(code: ReportTenantDocumentScanResultError["code"]) {
    super(code);
    this.code = code;
  }
}

const terminalScanStatusSchema = z.enum(["passed", "failed", "quarantined"]);

export const reportTenantDocumentScanResultInputSchema = z.object({
  organizationId: z.string().min(1),
  documentId: z.string().min(1),
  moduleId: z.string().min(1),
  status: terminalScanStatusSchema,
  scannerReference: z.string().optional(),
});

/** Completes an async external AV scan — idempotent when status is already terminal. */
export async function reportTenantDocumentScanResultCommand(
  input: z.infer<typeof reportTenantDocumentScanResultInputSchema>,
): Promise<ErpDocumentScanStatus> {
  const parsed = reportTenantDocumentScanResultInputSchema.parse(input);

  const document = await getTenantDocument({
    organizationId: parsed.organizationId,
    documentId: parsed.documentId,
    moduleId: parsed.moduleId as ModuleId,
  });

  if (!document) {
    throw new ReportTenantDocumentScanResultError("document_not_found");
  }

  if (
    document.scanStatus === "passed" ||
    document.scanStatus === "failed" ||
    document.scanStatus === "quarantined"
  ) {
    return document.scanStatus;
  }

  if (document.scanStatus !== "scanning" && document.scanStatus !== "pending") {
    throw new ReportTenantDocumentScanResultError("scan_not_in_progress");
  }

  await updateTenantDocumentScanStatus({
    organizationId: parsed.organizationId,
    documentId: parsed.documentId,
    scanStatus: parsed.status,
  });

  if (parsed.status === "failed" || parsed.status === "quarantined") {
    await recordTenantDocumentEvidenceEvent({
      action: "DOCUMENT_MALWARE_DETECTED",
      organizationId: parsed.organizationId,
      moduleId: parsed.moduleId as ModuleId,
      userId: "system",
      timestamp: new Date().toISOString(),
      documentId: parsed.documentId,
      pathname: document.pathname,
      classification: document.classification,
      retentionClass: document.retentionClass,
      metadata: {
        scanStatus: parsed.status,
        source: "document-av-webhook",
        scannerReference: parsed.scannerReference,
      },
    });
  }

  return parsed.status;
}
