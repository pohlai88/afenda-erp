import { buildComplianceStatusUpdateAuditMetadata } from "./hr.workforce.compliance.audit-trail.shared";

export { buildComplianceStatusUpdateAuditMetadata } from "./hr.workforce.compliance.audit-trail.shared";

export function resolveCertificationExpiresAtMutationInput(
  formData: FormData,
  certificationExpiresAt: Date | null,
): Date | null | undefined {
  return formData.has("certificationExpiresAt")
    ? certificationExpiresAt
    : undefined;
}

export function resolveFilingDeadlineMutationInput(
  formData: FormData,
  filingDeadline: Date | null,
): Date | null | undefined {
  return formData.has("filingDeadline") ? filingDeadline : undefined;
}

export function buildRequirementStatusAuditMetadata(input: {
  status: string;
  certificationExpiresAt?: Date | null;
  includeCertificationExpiry?: boolean;
  reviewNotes?: string | null;
  includeReviewNotes?: boolean;
}) {
  return buildComplianceStatusUpdateAuditMetadata({
    status: input.status,
    reviewNotes: input.reviewNotes,
    includeReviewNotes: input.includeReviewNotes,
    certificationExpiresAt: input.certificationExpiresAt,
    includeCertificationExpiry: input.includeCertificationExpiry,
  });
}
