import {
  claimTenantDocumentForScan,
  getTenantDocument,
  updateTenantDocumentScanStatus,
  type ErpDocumentScanStatus,
} from "@afenda/db";
import { getDocumentAvEnv } from "@afenda/config/env";
import type { ModuleId } from "@afenda/kernel";

import { recordTenantDocumentEvidenceEvent } from "../api/system-admin.object-storage-governance.server";
import { runTenantDocumentAvScan } from "../domain/document-av-scanner.server";
import { incrementObjectStorageMetric } from "@afenda/object-storage/server";

export type TenantDocumentScanCommandResult =
  | ErpDocumentScanStatus
  | "skipped"
  | "deferred";

function resolveStaleScanningBefore() {
  const avEnv = getDocumentAvEnv();
  const staleBefore = new Date();
  staleBefore.setUTCMinutes(
    staleBefore.getUTCMinutes() - avEnv.staleScanningMinutes,
  );
  return staleBefore;
}

async function recordScanTerminalEvidence(input: {
  organizationId: string;
  documentId: string;
  moduleId: ModuleId;
  pathname: string;
  classification: string;
  retentionClass: string;
  status: Exclude<ErpDocumentScanStatus, "pending" | "scanning">;
}) {
  if (input.status !== "quarantined" && input.status !== "failed") {
    return;
  }

  await recordTenantDocumentEvidenceEvent({
    action: "DOCUMENT_MALWARE_DETECTED",
    organizationId: input.organizationId,
    moduleId: input.moduleId,
    userId: "system",
    timestamp: new Date().toISOString(),
    documentId: input.documentId,
    pathname: input.pathname,
    classification: input.classification as "internal",
    retentionClass: input.retentionClass as "standard",
    metadata: {
      scanStatus: input.status,
      source: "document-av-scan",
    },
  });
}

/** Claims a pending document, runs AV scan, and writes terminal scan status. */
export async function processTenantDocumentScanCommand(input: {
  organizationId: string;
  documentId: string;
  moduleId: ModuleId;
}): Promise<TenantDocumentScanCommandResult> {
  const staleScanningBefore = resolveStaleScanningBefore();
  const claimed = await claimTenantDocumentForScan({
    organizationId: input.organizationId,
    documentId: input.documentId,
    staleScanningBefore,
  });

  if (!claimed) {
    return "skipped";
  }

  const document = await getTenantDocument({
    organizationId: input.organizationId,
    documentId: input.documentId,
    moduleId: input.moduleId,
  });

  if (!document || document.scanStatus !== "scanning") {
    return "skipped";
  }

  const outcome = await runTenantDocumentAvScan({
    organizationId: input.organizationId,
    documentId: input.documentId,
    moduleId: input.moduleId,
    pathname: document.pathname,
    blobUrl: document.blobUrl,
    contentType: document.contentType,
    sizeBytes: document.sizeBytes,
  });

  if (outcome.mode === "deferred") {
    return "deferred";
  }

  await updateTenantDocumentScanStatus({
    organizationId: input.organizationId,
    documentId: input.documentId,
    scanStatus: outcome.status,
  });

  await recordScanTerminalEvidence({
    organizationId: input.organizationId,
    documentId: input.documentId,
    moduleId: input.moduleId,
    pathname: document.pathname,
    classification: document.classification,
    retentionClass: document.retentionClass,
    status: outcome.status,
  });

  if (outcome.status === "quarantined" || outcome.status === "failed") {
    incrementObjectStorageMetric("malware_detected", {
      organizationId: input.organizationId,
      moduleId: input.moduleId,
    });
  }

  return outcome.status;
}
