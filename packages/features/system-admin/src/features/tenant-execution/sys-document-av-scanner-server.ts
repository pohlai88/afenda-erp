import { getDocumentAvEnv } from "@afenda/config/env";
import type { ModuleId } from "@afenda/kernel";
import {
  getOrganizationEncryptionSettings,
  getOrganizationObjectStorageProvider,
} from "@afenda/db";
import {
  assertObjectStorageConfigured,
  createObjectStore,
  decryptStoredDocumentBody,
  buildObjectStorageEncryptionContext,
} from "@afenda/object-storage/server";
import { parseDocumentEncryptionMetadata } from "@afenda/object-storage/metadata";
import type { ErpDocumentScanStatus } from "@afenda/db";

export type DocumentAvScanJob = {
  organizationId: string;
  documentId: string;
  moduleId: ModuleId;
  pathname: string;
  blobUrl: string;
  contentType: string;
  sizeBytes: number;
  metadata?: Record<string, unknown>;
};

export type DocumentAvScanOutcome =
  | { mode: "resolved"; status: Exclude<ErpDocumentScanStatus, "pending" | "scanning"> }
  | { mode: "deferred" };

const AV_SCAN_DOWNLOAD_TTL_MS = 60 * 60 * 1000;
const AV_SCAN_SAMPLE_BYTES = 512 * 1024;

function resolveTerminalScanStatus(
  value: string,
): Exclude<ErpDocumentScanStatus, "pending" | "scanning"> | null {
  if (value === "passed" || value === "failed" || value === "quarantined") {
    return value;
  }

  return null;
}

async function createAvScanObjectStoreDeps(organizationId: string) {
  const objectStorageEnv = assertObjectStorageConfigured();
  const organizationProviderId = await getOrganizationObjectStorageProvider({
    organizationId,
  });
  const encryptionSettings = await getOrganizationEncryptionSettings({
    organizationId,
  });

  const store = createObjectStore(objectStorageEnv, {
    organizationId,
    organizationProviderId,
    encryption: buildObjectStorageEncryptionContext({
      organizationId,
      settings: {
        mode: encryptionSettings.mode,
        kmsAdapter: encryptionSettings.kmsAdapter,
        kmsKeyRef: encryptionSettings.kmsKeyRef,
      },
    }),
    sseKmsKeyId: encryptionSettings.kmsKeyRef,
  });

  const deps = {
    resolveOrganizationObjectStorageProvider: async () => organizationProviderId,
    resolveOrganizationEncryptionSettings: async () => ({
      mode: encryptionSettings.mode,
      kmsAdapter: encryptionSettings.kmsAdapter,
      kmsKeyRef: encryptionSettings.kmsKeyRef,
    }),
  };

  return { store, deps };
}

async function runBuiltInObjectPresenceScan(
  job: DocumentAvScanJob,
): Promise<DocumentAvScanOutcome> {
  const { store } = await createAvScanObjectStoreDeps(job.organizationId);

  if (!job.pathname.trim() && !job.blobUrl.trim()) {
    return { mode: "resolved", status: "failed" };
  }

  if (!job.pathname.trim()) {
    return { mode: "resolved", status: "passed" };
  }

  try {
    await store.headObject(job.pathname);
    return { mode: "resolved", status: "passed" };
  } catch {
    return { mode: "resolved", status: "failed" };
  }
}

async function resolveAvScanPayloadBytes(job: DocumentAvScanJob) {
  const encryption = parseDocumentEncryptionMetadata(job.metadata);

  if (!encryption) {
    return null;
  }

  const { store, deps } = await createAvScanObjectStoreDeps(job.organizationId);
  const plaintext = await decryptStoredDocumentBody({
    organizationId: job.organizationId,
    pathname: job.pathname,
    metadata: job.metadata,
    store,
    deps,
  });

  if (!plaintext) {
    return null;
  }

  return plaintext.slice(0, Math.min(plaintext.byteLength, AV_SCAN_SAMPLE_BYTES));
}

async function runExternalAvScan(
  job: DocumentAvScanJob,
): Promise<DocumentAvScanOutcome> {
  const avEnv = getDocumentAvEnv();

  if (!avEnv.apiUrl) {
    return runBuiltInObjectPresenceScan(job);
  }

  const { store } = await createAvScanObjectStoreDeps(job.organizationId);
  const validUntilMs = Date.now() + AV_SCAN_DOWNLOAD_TTL_MS;
  const envelopeSample = await resolveAvScanPayloadBytes(job);
  const signed =
    envelopeSample == null
      ? await store.getSignedDownloadUrl({
          pathname: job.pathname,
          access: "private",
          contentDisposition: "inline",
          validUntilMs,
        })
      : null;

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
      ...(envelopeSample
        ? {
            contentSampleBase64: Buffer.from(envelopeSample).toString("base64"),
            encryptionAdapter: parseDocumentEncryptionMetadata(job.metadata)?.adapter,
          }
        : signed
          ? {
              downloadUrl: signed.url,
              downloadValidUntil: new Date(validUntilMs).toISOString(),
            }
          : {}),
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
