import { HR_COMPLIANCE_AUDIT_MODULE_KEY } from "../events/hr.workforce.compliance.audit-emitted.shared";
import { formatComplianceEnumLabel } from "../schemas/hr.workforce.compliance-form.shared";

export { HR_COMPLIANCE_AUDIT_MODULE_KEY };

const COMPLIANCE_SENSITIVE_AUDIT_ACTION_PREFIXES = [
  "hr.compliance.work_auth_documents.",
  "hr.compliance.work_eligibility.",
] as const;

const COMPLIANCE_SENSITIVE_AUDIT_METADATA_KEYS = new Set([
  "reviewNotes",
  "documentNumber",
]);

export type HrComplianceAuditTrailRow = {
  id: string;
  occurredAt: Date;
  action: string;
  category: string;
  actorAuthUserId: string;
  targetId: string;
  summary: string;
  metadata: Record<string, unknown> | null;
};

export type HrComplianceAuditTrailWindow = {
  rows: HrComplianceAuditTrailRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export function resolveComplianceAuditCategory(action: string): string {
  const segments = action.split(".");
  if (segments.length < 3 || segments[0] !== "hr" || segments[1] !== "compliance") {
    return "compliance";
  }

  return segments[2] ?? "compliance";
}

export function formatComplianceAuditCategoryLabel(category: string): string {
  return formatComplianceEnumLabel(category.replace(/_/g, " "));
}

export function formatComplianceAuditActionLabel(action: string): string {
  const category = resolveComplianceAuditCategory(action);
  const verb = action.split(".").slice(3).join(" ");
  if (!verb) {
    return formatComplianceEnumLabel(category);
  }

  return `${formatComplianceAuditCategoryLabel(category)} · ${formatComplianceEnumLabel(verb.replace(/_/g, " "))}`;
}

function isSensitiveComplianceAuditAction(action: string): boolean {
  return COMPLIANCE_SENSITIVE_AUDIT_ACTION_PREFIXES.some((prefix) =>
    action.startsWith(prefix),
  );
}

export function maskComplianceAuditMetadata(input: {
  action: string;
  metadata: Record<string, unknown> | null | undefined;
  canViewSensitive: boolean;
}): Record<string, unknown> | null {
  if (!input.metadata) {
    return null;
  }

  if (input.canViewSensitive || !isSensitiveComplianceAuditAction(input.action)) {
    return input.metadata;
  }

  const masked = { ...input.metadata };
  for (const key of COMPLIANCE_SENSITIVE_AUDIT_METADATA_KEYS) {
    if (key in masked) {
      masked[key] = null;
    }
  }

  return masked;
}

export function buildComplianceStatusUpdateAuditMetadata(input: {
  status: string;
  reviewNotes?: string | null;
  includeReviewNotes?: boolean;
  certificationExpiresAt?: Date | null;
  includeCertificationExpiry?: boolean;
  filingDeadline?: Date | null;
  includeFilingDeadline?: boolean;
}) {
  const metadata: Record<string, unknown> = { status: input.status };

  if (input.includeReviewNotes) {
    metadata.reviewNotes = input.reviewNotes ?? null;
  }

  if (input.includeCertificationExpiry) {
    metadata.certificationExpiresAt =
      input.certificationExpiresAt?.toISOString() ?? null;
  }

  if (input.includeFilingDeadline) {
    metadata.filingDeadline = input.filingDeadline?.toISOString() ?? null;
  }

  return metadata;
}
