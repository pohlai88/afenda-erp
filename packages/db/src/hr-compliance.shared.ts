import { and, asc, desc, eq, gte, inArray, isNotNull, isNull, lt, lte, or, sql } from "drizzle-orm";
import type { hrComplianceWorkEligibility } from "./schema/hr";
import { hrComplianceWorkAuthorizationDocuments } from "./schema/hr";

type HrComplianceWorkEligibilityStatus =
  (typeof hrComplianceWorkEligibility.$inferSelect)["status"];

type HrComplianceWorkAuthDocumentStatus =
  (typeof hrComplianceWorkAuthorizationDocuments.$inferSelect)["status"];

export const HR_COMPLIANCE_WORK_AUTH_DOCUMENT_TYPES = [
  "work_permit",
  "visa",
  "passport",
  "right_to_work",
] as const;

export type HrComplianceWorkAuthDocumentType =
  (typeof HR_COMPLIANCE_WORK_AUTH_DOCUMENT_TYPES)[number];

export const HR_COMPLIANCE_WORK_AUTH_DOCUMENT_STATUSES = [
  "missing",
  "pending_verification",
  "verified",
  "rejected",
  "waived",
] as const satisfies readonly HrComplianceWorkAuthDocumentStatus[];

const AUTHORIZED_WORK_ELIGIBILITY_STATUSES = new Set<HrComplianceWorkEligibilityStatus>([
  "eligible",
  "conditional",
]);

const VERIFIED_WORK_AUTH_DOCUMENT_STATUSES = new Set<HrComplianceWorkAuthDocumentStatus>([
  "verified",
]);

const EVIDENCE_REQUIRED_WORK_AUTH_DOCUMENT_STATUSES =
  new Set<HrComplianceWorkAuthDocumentStatus>(["pending_verification", "verified"]);

/** HRM-CMP-011 — pending/verified without a document number is flagged as missing. */
export function normalizeWorkAuthDocumentStatus(input: {
  status: HrComplianceWorkAuthDocumentStatus;
  documentNumber?: string | null;
}): HrComplianceWorkAuthDocumentStatus {
  const documentNumber = input.documentNumber?.trim();
  if (documentNumber) {
    return input.status;
  }

  if (EVIDENCE_REQUIRED_WORK_AUTH_DOCUMENT_STATUSES.has(input.status)) {
    return "missing";
  }

  return input.status;
}

/** HRM-CMP-012 / HRM-CMP-015 — shared 14-day at-risk window for requirements and work auth. */
export const HR_COMPLIANCE_AT_RISK_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

/** @deprecated Prefer `HR_COMPLIANCE_AT_RISK_WINDOW_MS`. */
export const WORK_AUTH_DOCUMENT_AT_RISK_WINDOW_MS = HR_COMPLIANCE_AT_RISK_WINDOW_MS;

/** HRM-CMP-011 / HRM-CMP-012 — search tokens for derived work-auth posture (not always stored). */
export function parseEffectiveWorkAuthDocumentStatusSearchToken(
  search: string,
): "missing" | "expired" | "expiring" | null {
  const normalized = search.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (normalized === "missing") {
    return "missing";
  }
  if (normalized === "expired") {
    return "expired";
  }
  if (normalized === "expiring" || normalized === "at_risk") {
    return "expiring";
  }
  return null;
}

export function buildWorkAuthDocumentMissingSearchCondition(input: {
  statusColumn?: typeof hrComplianceWorkAuthorizationDocuments.status;
  documentNumberColumn?: typeof hrComplianceWorkAuthorizationDocuments.documentNumber;
} = {}) {
  const statusColumn =
    input.statusColumn ?? hrComplianceWorkAuthorizationDocuments.status;
  const documentNumberColumn =
    input.documentNumberColumn ??
    hrComplianceWorkAuthorizationDocuments.documentNumber;

  return or(
    eq(statusColumn, "missing"),
    and(
      inArray(statusColumn, ["pending_verification", "verified"]),
      or(isNull(documentNumberColumn), eq(sql`btrim(${documentNumberColumn})`, "")),
    ),
  )!;
}

export function buildWorkAuthDocumentExpiredSearchCondition(input: {
  statusColumn?: typeof hrComplianceWorkAuthorizationDocuments.status;
  documentNumberColumn?: typeof hrComplianceWorkAuthorizationDocuments.documentNumber;
  expiresAtColumn?: typeof hrComplianceWorkAuthorizationDocuments.expiresAt;
  now?: Date;
} = {}) {
  const statusColumn =
    input.statusColumn ?? hrComplianceWorkAuthorizationDocuments.status;
  const documentNumberColumn =
    input.documentNumberColumn ??
    hrComplianceWorkAuthorizationDocuments.documentNumber;
  const expiresAtColumn =
    input.expiresAtColumn ?? hrComplianceWorkAuthorizationDocuments.expiresAt;
  const now = input.now ?? new Date();

  return and(
    inArray(statusColumn, ["pending_verification", "verified"]),
    isNotNull(expiresAtColumn),
    lt(expiresAtColumn, now),
    isNotNull(documentNumberColumn),
    sql`btrim(${documentNumberColumn}) <> ''`,
  )!;
}

/** HRM-CMP-012 — verified/pending documents expiring within the at-risk window. */
export function buildWorkAuthDocumentExpiringSearchCondition(input: {
  statusColumn?: typeof hrComplianceWorkAuthorizationDocuments.status;
  documentNumberColumn?: typeof hrComplianceWorkAuthorizationDocuments.documentNumber;
  expiresAtColumn?: typeof hrComplianceWorkAuthorizationDocuments.expiresAt;
  now?: Date;
} = {}) {
  const statusColumn =
    input.statusColumn ?? hrComplianceWorkAuthorizationDocuments.status;
  const documentNumberColumn =
    input.documentNumberColumn ??
    hrComplianceWorkAuthorizationDocuments.documentNumber;
  const expiresAtColumn =
    input.expiresAtColumn ?? hrComplianceWorkAuthorizationDocuments.expiresAt;
  const now = input.now ?? new Date();
  const atRiskCutoff = new Date(now.getTime() + WORK_AUTH_DOCUMENT_AT_RISK_WINDOW_MS);

  return and(
    inArray(statusColumn, ["pending_verification", "verified"]),
    isNotNull(expiresAtColumn),
    gte(expiresAtColumn, now),
    lte(expiresAtColumn, atRiskCutoff),
    isNotNull(documentNumberColumn),
    sql`btrim(${documentNumberColumn}) <> ''`,
  )!;
}

/** HRM-CMP-011 / HRM-CMP-012 — expired, expiring, then missing rows first. */
export function buildWorkAuthDocumentFlaggedFirstOrderBy(input: {
  statusColumn: typeof hrComplianceWorkAuthorizationDocuments.status;
  documentNumberColumn: typeof hrComplianceWorkAuthorizationDocuments.documentNumber;
  expiresAtColumn: typeof hrComplianceWorkAuthorizationDocuments.expiresAt;
  updatedAtColumn: typeof hrComplianceWorkAuthorizationDocuments.updatedAt;
  now?: Date;
}) {
  const now = input.now ?? new Date();
  const atRiskCutoff = new Date(now.getTime() + WORK_AUTH_DOCUMENT_AT_RISK_WINDOW_MS);

  return [
    sql`CASE
      WHEN ${input.statusColumn} IN ('pending_verification', 'verified') AND ${input.documentNumberColumn} IS NOT NULL AND btrim(${input.documentNumberColumn}) <> '' AND ${input.expiresAtColumn} IS NOT NULL AND ${input.expiresAtColumn} < ${now} THEN 0
      WHEN ${input.statusColumn} IN ('pending_verification', 'verified') AND ${input.documentNumberColumn} IS NOT NULL AND btrim(${input.documentNumberColumn}) <> '' AND ${input.expiresAtColumn} IS NOT NULL AND ${input.expiresAtColumn} >= ${now} AND ${input.expiresAtColumn} <= ${atRiskCutoff} THEN 1
      WHEN ${input.statusColumn} = 'missing' OR (${input.statusColumn} IN ('pending_verification', 'verified') AND (${input.documentNumberColumn} IS NULL OR btrim(${input.documentNumberColumn}) = '')) THEN 2
      ELSE 3
    END`,
    sql`CASE WHEN ${input.expiresAtColumn} IS NULL THEN 1 ELSE 0 END`,
    asc(input.expiresAtColumn),
    desc(input.updatedAtColumn),
  ];
}

export function formatHrEmployeeDisplayName(input: {
  preferredName: string | null | undefined;
  legalName: string | null | undefined;
}): string {
  return input.preferredName?.trim() || input.legalName?.trim() || "—";
}

export function buildPaginatedWindow<T>(input: {
  rows: readonly T[];
  pageSize: number;
  offset: number;
  totalCount: number;
}): {
  rows: readonly T[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
} {
  return {
    rows: input.rows,
    pageSize: input.pageSize,
    totalCount: input.totalCount,
    hasNextPage: input.offset + input.rows.length < input.totalCount,
  };
}

export function resolveWorkEligibilityVerifiedAt(input: {
  status: HrComplianceWorkEligibilityStatus;
  verifiedAt?: Date | null;
  existingVerifiedAt?: Date | null;
}): Date | null {
  if (input.verifiedAt !== undefined) {
    return input.verifiedAt;
  }

  if (AUTHORIZED_WORK_ELIGIBILITY_STATUSES.has(input.status)) {
    return input.existingVerifiedAt ?? new Date();
  }

  return null;
}

export function resolveWorkAuthDocumentVerifiedAt(input: {
  status: HrComplianceWorkAuthDocumentStatus;
  verifiedAt?: Date | null;
  existingVerifiedAt?: Date | null;
}): Date | null {
  if (input.verifiedAt !== undefined) {
    return input.verifiedAt;
  }

  if (VERIFIED_WORK_AUTH_DOCUMENT_STATUSES.has(input.status)) {
    return input.existingVerifiedAt ?? new Date();
  }

  return null;
}
