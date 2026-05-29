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
}) {
  const metadata: Record<string, unknown> = { status: input.status };

  if (input.includeCertificationExpiry) {
    metadata.certificationExpiresAt =
      input.certificationExpiresAt?.toISOString() ?? null;
  }

  return metadata;
}
