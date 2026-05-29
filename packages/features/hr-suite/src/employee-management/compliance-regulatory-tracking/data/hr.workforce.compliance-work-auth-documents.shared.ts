import {
  deriveWorkAuthEffectiveStatus,
  HR_COMPLIANCE_WORK_AUTH_DOCUMENT_STATUSES,
  HR_COMPLIANCE_WORK_AUTH_DOCUMENT_TYPES,
  normalizeWorkAuthDocumentStatus,
  resolveWorkAuthDocumentVerifiedAt,
} from "@afenda/db";

import { toEnumMember } from "./hr.workforce.compliance-enum-guard.shared";

export {
  HR_COMPLIANCE_WORK_AUTH_DOCUMENT_STATUSES as HRM_COMPLIANCE_WORK_AUTH_DOCUMENT_STATUSES,
  HR_COMPLIANCE_WORK_AUTH_DOCUMENT_TYPES,
  normalizeWorkAuthDocumentStatus,
  resolveWorkAuthDocumentVerifiedAt,
};

export type HrmComplianceWorkAuthDocumentStatus =
  (typeof HR_COMPLIANCE_WORK_AUTH_DOCUMENT_STATUSES)[number];

export type HrmComplianceWorkAuthDocumentEffectiveStatus =
  | HrmComplianceWorkAuthDocumentStatus
  | "expired"
  | "expiring";

const WORK_AUTH_EFFECTIVE_STATUSES = [
  ...HR_COMPLIANCE_WORK_AUTH_DOCUMENT_STATUSES,
  "expired",
  "expiring",
] as const satisfies readonly HrmComplianceWorkAuthDocumentEffectiveStatus[];

export function deriveEffectiveWorkAuthDocumentStatus(input: {
  status: HrmComplianceWorkAuthDocumentStatus;
  documentNumber?: string | null;
  expiresAt: Date | null | undefined;
  now?: Date;
}): HrmComplianceWorkAuthDocumentEffectiveStatus {
  return toEnumMember(
    deriveWorkAuthEffectiveStatus({
      status: input.status,
      documentNumber: input.documentNumber,
      expiresAt: input.expiresAt ?? null,
      now: input.now ?? new Date(),
    }),
    WORK_AUTH_EFFECTIVE_STATUSES,
    "work authorization document status",
  );
}

/** HRM-CMP-011 — true when effective posture is explicitly missing. */
export function isWorkAuthDocumentMissing(input: {
  status: HrmComplianceWorkAuthDocumentStatus;
  documentNumber?: string | null;
  expiresAt?: Date | null;
  now?: Date;
}): boolean {
  return (
    deriveEffectiveWorkAuthDocumentStatus({
      status: input.status,
      documentNumber: input.documentNumber,
      expiresAt: input.expiresAt ?? null,
      now: input.now,
    }) === "missing"
  );
}

/** HRM-CMP-012 — true when document expiry is within the at-risk window. */
export function isWorkAuthDocumentExpiring(input: {
  status: HrmComplianceWorkAuthDocumentStatus;
  documentNumber?: string | null;
  expiresAt?: Date | null;
  now?: Date;
}): boolean {
  return (
    deriveEffectiveWorkAuthDocumentStatus({
      status: input.status,
      documentNumber: input.documentNumber,
      expiresAt: input.expiresAt ?? null,
      now: input.now,
    }) === "expiring"
  );
}

/** Trailing select accepts stored enum values only — map derived expired/expiring to stored status. */
export function normalizeWorkAuthStatusForTrailingSelect(input: {
  effectiveStatus: HrmComplianceWorkAuthDocumentEffectiveStatus;
  storedStatus: HrmComplianceWorkAuthDocumentStatus;
}): HrmComplianceWorkAuthDocumentStatus {
  if (
    input.effectiveStatus === "expired" ||
    input.effectiveStatus === "expiring"
  ) {
    return input.storedStatus;
  }

  return input.effectiveStatus;
}
