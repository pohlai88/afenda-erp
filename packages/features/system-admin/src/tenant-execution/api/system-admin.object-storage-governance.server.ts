import {
  getHrEmployeeDocumentForDownload,
  getOrganizationDocumentStorageBytes,
  getOrganizationEncryptionSettings,
  getOrganizationObjectStorageProvider,
  getTenantDocument,
} from "@afenda/db";
import { isAppCapability, type AppCapability } from "@afenda/auth";
import type { ModuleId } from "@afenda/kernel";
import {
  hasExecutionPermission,
  requireExecutionContext,
  writeExecutionAuditEvent,
} from "@afenda/kernel/execution";
import type {
  ObjectStorageDownloadGovernanceInput,
  ObjectStorageEvidenceAuditEvent,
  ObjectStorageGateDecision,
  ObjectStorageHandlerDeps,
  ObjectStorageUploadQuotaInput,
  TenantDocumentDownloadRecord,
} from "@afenda/object-storage/server";
import type { ObjectStorageDocumentScanStatus } from "@afenda/object-storage/metadata";
import {
  isObjectStorageClassificationSensitive,
  type ObjectStorageDocumentClassification,
} from "@afenda/object-storage/metadata";

const DEFAULT_ORG_STORAGE_QUOTA_BYTES = 50 * 1024 * 1024 * 1024;
const QUOTA_WARN_RATIO = 0.8;
const QUOTA_ALERT_RATIO = 0.9;

function resolveOrganizationStorageQuotaBytes(): number {
  const configured = process.env.OBJECT_STORAGE_ORG_QUOTA_BYTES?.trim();
  if (!configured) {
    return DEFAULT_ORG_STORAGE_QUOTA_BYTES;
  }

  const parsed = Number.parseInt(configured, 10);
  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : DEFAULT_ORG_STORAGE_QUOTA_BYTES;
}

function resolveSensitiveReadCapability(
  moduleId: string,
): AppCapability | null {
  const hrSensitive = "hr.documents.sensitive.read";
  if (moduleId === "hr" && isAppCapability(hrSensitive)) {
    return hrSensitive;
  }

  const moduleSensitive = `${moduleId}.documents.sensitive.read`;
  if (isAppCapability(moduleSensitive)) {
    return moduleSensitive;
  }

  return null;
}

function mapHrVerificationToScanStatus(
  verificationStatus: "pending" | "verified" | "rejected",
): ObjectStorageDocumentScanStatus {
  if (verificationStatus === "verified") {
    return "passed";
  }

  if (verificationStatus === "rejected") {
    return "failed";
  }

  return "pending";
}

async function getTenantDocumentForDownload(input: {
  organizationId: string;
  documentId: string;
  moduleId: ModuleId;
}): Promise<TenantDocumentDownloadRecord | null> {
  if (input.moduleId === "hr") {
    const hrDocument = await getHrEmployeeDocumentForDownload({
      organizationId: input.organizationId,
      documentId: input.documentId,
    });

    if (!hrDocument) {
      return null;
    }

    return {
      id: hrDocument.id,
      title: hrDocument.title,
      pathname: hrDocument.pathname,
      access: "private",
      moduleId: "hr",
      classification:
        hrDocument.classification satisfies ObjectStorageDocumentClassification,
      retentionClass: "standard",
      scanStatus: mapHrVerificationToScanStatus(hrDocument.verificationStatus),
    };
  }

  return getTenantDocument(input);
}

export async function recordTenantDocumentEvidenceEvent(
  event: ObjectStorageEvidenceAuditEvent,
): Promise<void> {
  await writeExecutionAuditEvent({
    organizationId: event.organizationId,
    actorId: event.userId,
    actorType: "user",
    action: event.action,
    targetType: "document",
    targetId: event.documentId ?? event.pathname,
    metadata: {
      moduleId: event.moduleId,
      pathname: event.pathname,
      classification: event.classification,
      retentionClass: event.retentionClass,
      sourceIp: event.sourceIp,
      sessionId: event.sessionId,
      evidenceTimestamp: event.timestamp,
      ...(event.metadata ?? {}),
    },
  });
}

export async function authorizeTenantDocumentDownload(
  input: ObjectStorageDownloadGovernanceInput,
): Promise<ObjectStorageGateDecision | void> {
  const classification =
    input.classification ?? ("internal" satisfies ObjectStorageDocumentClassification);

  if (!isObjectStorageClassificationSensitive(classification)) {
    return;
  }

  const context = await requireExecutionContext();

  const sensitiveCapability = resolveSensitiveReadCapability(input.moduleId);
  if (
    sensitiveCapability &&
    hasExecutionPermission(context, sensitiveCapability)
  ) {
    return;
  }

  if (
    (classification === "highly-restricted" || classification === "regulated") &&
    hasExecutionPermission(context, "system-admin.security.read")
  ) {
    return;
  }

  return {
    allowed: false,
    status: 403,
    reason: "Sensitive document access is required.",
  };
}

export async function assertTenantUploadQuota(
  input: ObjectStorageUploadQuotaInput,
): Promise<ObjectStorageGateDecision | void> {
  const quotaBytes = resolveOrganizationStorageQuotaBytes();
  const consumedBytes = await getOrganizationDocumentStorageBytes({
    organizationId: input.organizationId,
  });
  const projectedBytes = consumedBytes + input.sizeBytes;
  const usageRatio = projectedBytes / quotaBytes;

  if (projectedBytes > quotaBytes) {
    return {
      allowed: false,
      status: 429,
      reason: "Organization storage quota exceeded.",
      metadata: {
        consumedBytes,
        projectedBytes,
        quotaBytes,
        usageRatio,
      },
    };
  }

  if (usageRatio >= QUOTA_ALERT_RATIO) {
    return {
      allowed: true,
      metadata: {
        quotaAlert: "critical",
        consumedBytes,
        projectedBytes,
        quotaBytes,
        usageRatio,
      },
    };
  }

  if (usageRatio >= QUOTA_WARN_RATIO) {
    return {
      allowed: true,
      metadata: {
        quotaAlert: "warning",
        consumedBytes,
        projectedBytes,
        quotaBytes,
        usageRatio,
      },
    };
  }
}

/** App-wired deps for ARCH-1004 object-storage ingress routes. */
export const tenantObjectStorageHandlerDeps: ObjectStorageHandlerDeps = {
  getTenantDocument: getTenantDocumentForDownload,
  registerUploadedDocument: undefined,
  recordEvidenceEvent: recordTenantDocumentEvidenceEvent,
  authorizeDocumentDownload: authorizeTenantDocumentDownload,
  assertUploadQuota: assertTenantUploadQuota,
  resolveOrganizationObjectStorageProvider: async (organizationId) =>
    getOrganizationObjectStorageProvider({ organizationId }),
  resolveOrganizationEncryptionSettings: async (organizationId) => {
    const settings = await getOrganizationEncryptionSettings({ organizationId });

    return {
      mode: settings.mode,
      kmsAdapter: settings.kmsAdapter,
      kmsKeyRef: settings.kmsKeyRef,
    };
  },
};

export function createTenantObjectStorageUploadDeps(input: {
  registerUploadedDocument: NonNullable<
    ObjectStorageHandlerDeps["registerUploadedDocument"]
  >;
}): ObjectStorageHandlerDeps {
  return {
    ...tenantObjectStorageHandlerDeps,
    registerUploadedDocument: input.registerUploadedDocument,
  };
}

export function createTenantObjectStorageDownloadDeps(): Pick<
  ObjectStorageHandlerDeps,
  | "getTenantDocument"
  | "recordEvidenceEvent"
  | "authorizeDocumentDownload"
  | "getDocumentScanStatus"
  | "resolveOrganizationObjectStorageProvider"
  | "resolveOrganizationEncryptionSettings"
> {
  return {
    getTenantDocument: getTenantDocumentForDownload,
    recordEvidenceEvent: recordTenantDocumentEvidenceEvent,
    authorizeDocumentDownload: authorizeTenantDocumentDownload,
    getDocumentScanStatus: async (governanceInput) => {
      const document = await getTenantDocumentForDownload({
        organizationId: governanceInput.organizationId,
        documentId: governanceInput.documentId,
        moduleId: governanceInput.moduleId,
      });

      return document?.scanStatus ?? null;
    },
    resolveOrganizationObjectStorageProvider:
      tenantObjectStorageHandlerDeps.resolveOrganizationObjectStorageProvider,
    resolveOrganizationEncryptionSettings:
      tenantObjectStorageHandlerDeps.resolveOrganizationEncryptionSettings,
  };
}

export function createTenantObjectStorageUploadConfigDeps(): Pick<
  ObjectStorageHandlerDeps,
  | "resolveOrganizationObjectStorageProvider"
  | "resolveOrganizationEncryptionSettings"
> {
  return {
    resolveOrganizationObjectStorageProvider:
      tenantObjectStorageHandlerDeps.resolveOrganizationObjectStorageProvider,
    resolveOrganizationEncryptionSettings:
      tenantObjectStorageHandlerDeps.resolveOrganizationEncryptionSettings,
  };
}
