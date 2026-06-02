import "server-only";

import type { ModuleId } from "@afenda/kernel";
import { uploadRouteCopy } from "@afenda/kernel";
import type {
  ObjectStorageEvidenceAuditEvent,
  ObjectStorageEvidenceAuditSink,
  ObjectStorageGateDecision,
  ObjectStorageUploadQuotaInput,
} from "../contracts/index";
import type {
  ObjectStorageDocumentClassification,
  ObjectStorageRetentionClass,
} from "../policies/document-governance-policy.shared";
import { UploadRouteError } from "../domain/upload-route.error.shared";

export function getRequestSourceIp(request: Request): string | undefined {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    undefined
  );
}

export function assertGateDecisionAllowed(
  decision: ObjectStorageGateDecision | void | null | undefined,
) {
  if (!decision || decision.allowed) {
    return;
  }

  throw new UploadRouteError(decision.status ?? 403, decision.reason);
}

export async function assertUploadQuotaAllowed(input: {
  quotaGate?: (
    quotaInput: ObjectStorageUploadQuotaInput,
  ) => Promise<ObjectStorageGateDecision | void>;
  quotaInput: ObjectStorageUploadQuotaInput;
  recordDenied?: ObjectStorageEvidenceAuditSink;
  sourceIp?: string;
}) {
  const decision = await input.quotaGate?.(input.quotaInput);

  if (decision && !decision.allowed) {
    await recordGovernanceDeniedEvidenceEvent({
      sink: input.recordDenied,
      action: "DOCUMENT_UPLOAD_DENIED",
      status: decision.status ?? 429,
      reason: decision.reason ?? "Upload denied.",
      event: {
        organizationId: input.quotaInput.organizationId,
        moduleId: input.quotaInput.moduleId,
        userId: input.quotaInput.uploadedByAuthUserId,
        pathname: input.quotaInput.pathname,
        classification: input.quotaInput.classification,
        retentionClass: input.quotaInput.retentionClass,
        sourceIp: input.sourceIp,
      },
    });
  }

  assertGateDecisionAllowed(decision);
}

export function assertDocumentScanPassed(input: {
  scanStatus: string | null | undefined;
}) {
  if (input.scanStatus === "passed") {
    return;
  }

  throw new UploadRouteError(423, uploadRouteCopy.documentNotFound);
}

export async function recordEvidenceEvent(input: {
  sink?: ObjectStorageEvidenceAuditSink;
  event: Omit<ObjectStorageEvidenceAuditEvent, "timestamp"> & {
    timestamp?: string;
  };
}) {
  if (!input.sink) {
    return;
  }

  await input.sink({
    ...input.event,
    timestamp: input.event.timestamp ?? new Date().toISOString(),
  });
}

const GOVERNANCE_DENIED_STATUSES = new Set([403, 423, 429]);

export async function recordGovernanceDeniedEvidenceEvent(input: {
  sink?: ObjectStorageEvidenceAuditSink;
  action: "DOCUMENT_DOWNLOAD_DENIED" | "DOCUMENT_UPLOAD_DENIED";
  status: number;
  reason: string;
  event: Omit<
    ObjectStorageEvidenceAuditEvent,
    "action" | "timestamp" | "metadata"
  > & {
    timestamp?: string;
    metadata?: Record<string, unknown>;
  };
}) {
  if (!input.sink || !GOVERNANCE_DENIED_STATUSES.has(input.status)) {
    return;
  }

  await recordEvidenceEvent({
    sink: input.sink,
    event: {
      ...input.event,
      action: input.action,
      metadata: {
        ...(input.event.metadata ?? {}),
        denialStatus: input.status,
        denialReason: input.reason,
      },
    },
  });
}

export type UploadDeniedAuditContext = {
  organizationId?: string;
  moduleId?: ModuleId;
  userId?: string;
  pathname?: string;
  classification?: ObjectStorageDocumentClassification;
  retentionClass?: ObjectStorageRetentionClass;
  sourceIp?: string;
};

export async function recordUploadRouteDeniedEvidence(input: {
  sink?: ObjectStorageEvidenceAuditSink;
  error: unknown;
  context: UploadDeniedAuditContext;
}) {
  if (!(input.error instanceof UploadRouteError)) {
    return;
  }

  const { organizationId, moduleId, userId } = input.context;
  if (!organizationId || !moduleId || !userId) {
    return;
  }

  await recordGovernanceDeniedEvidenceEvent({
    sink: input.sink,
    action: "DOCUMENT_UPLOAD_DENIED",
    status: input.error.status,
    reason: input.error.message,
    event: {
      organizationId,
      moduleId,
      userId,
      pathname: input.context.pathname,
      classification: input.context.classification,
      retentionClass: input.context.retentionClass,
      sourceIp: input.context.sourceIp,
    },
  });
}

export async function runUploadWithDeniedAudit<T>(input: {
  sink?: ObjectStorageEvidenceAuditSink;
  context: UploadDeniedAuditContext;
  action: () => Promise<T> | T;
}): Promise<T> {
  try {
    return await input.action();
  } catch (error) {
    await recordUploadRouteDeniedEvidence({
      sink: input.sink,
      error,
      context: input.context,
    });
    throw error;
  }
}
