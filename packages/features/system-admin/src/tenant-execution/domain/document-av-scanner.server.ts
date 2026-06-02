import { getDocumentAvEnv } from "@afenda/config/env";
import type { ModuleId } from "@afenda/kernel";
import {
  assertObjectStorageConfigured,
  createObjectStore,
} from "@afenda/object-storage/server";
import type { ErpDocumentScanStatus } from "@afenda/db";

export type DocumentAvScanJob = {
  organizationId: string;
  documentId: string;
  moduleId: ModuleId;
  pathname: string;
  blobUrl: string;
  contentType: string;
  sizeBytes: number;
};

export type DocumentAvScanOutcome =
  | { mode: "resolved"; status: Exclude<ErpDocumentScanStatus, "pending" | "scanning"> }
  | { mode: "deferred" };

const AV_SCAN_DOWNLOAD_TTL_MS = 60 * 60 * 1000;

function resolveTerminalScanStatus(
  value: string,
): Exclude<ErpDocumentScanStatus, "pending" | "scanning"> | null {
  if (value === "passed" || value === "failed" || value === "quarantined") {
    return value;
  }

  return null;
}

async function runBuiltInObjectPresenceScan(
  job: DocumentAvScanJob,
): Promise<DocumentAvScanOutcome> {
  const objectStorageEnv = assertObjectStorageConfigured();
  const store = createObjectStore(objectStorageEnv);

  if (objectStorageEnv.provider === "vercel-blob") {
    if (!job.blobUrl.trim()) {
      return { mode: "resolved", status: "failed" };
    }

    return { mode: "resolved", status: "passed" };
  }

  try {
    await store.headObject(job.pathname);
    return { mode: "resolved", status: "passed" };
  } catch {
    return { mode: "resolved", status: "failed" };
  }
}

async function runExternalAvScan(
  job: DocumentAvScanJob,
): Promise<DocumentAvScanOutcome> {
  const avEnv = getDocumentAvEnv();

  if (!avEnv.apiUrl) {
    return runBuiltInObjectPresenceScan(job);
  }

  const objectStorageEnv = assertObjectStorageConfigured();
  const store = createObjectStore(objectStorageEnv);
  const validUntilMs = Date.now() + AV_SCAN_DOWNLOAD_TTL_MS;
  const signed = await store.getSignedDownloadUrl({
    pathname: job.pathname,
    access: "private",
    contentDisposition: "inline",
    validUntilMs,
  });

  const headers: Record<string, string> = {
    "content-type": "application/json",
  };

  if (avEnv.apiKey) {
    headers.authorization = `Bearer ${avEnv.apiKey}`;
  }

  const response = await fetch(avEnv.apiUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      organizationId: job.organizationId,
      documentId: job.documentId,
      moduleId: job.moduleId,
      pathname: job.pathname,
      contentType: job.contentType,
      sizeBytes: job.sizeBytes,
      downloadUrl: signed.url,
      downloadValidUntil: new Date(validUntilMs).toISOString(),
    }),
  });

  if (response.status === 202) {
    return { mode: "deferred" };
  }

  if (!response.ok) {
    throw new Error(
      `Document AV scan request failed (${response.status}): ${await response.text()}`,
    );
  }

  const payload = (await response.json()) as Record<string, unknown>;
  const deferred = payload.deferred === true || payload.async === true;

  if (deferred) {
    return { mode: "deferred" };
  }

  const status = resolveTerminalScanStatus(String(payload.status ?? ""));

  if (!status) {
    throw new Error("Document AV scan response missing terminal status.");
  }

  return { mode: "resolved", status };
}

/** Runs built-in presence scan or dispatches to an external AV worker. */
export async function runTenantDocumentAvScan(
  job: DocumentAvScanJob,
): Promise<DocumentAvScanOutcome> {
  return runExternalAvScan(job);
}
