/** HRM-FHC-024 — health certificate fields hidden from non-audit roles. */
export const FHC_HEALTH_REDACTED_LABEL = "[redacted]" as const

export function redactFhcHealthCertificateRef(
  certificateRef: string | null | undefined,
  canReadHealthDetails: boolean
): string | null {
  const trimmed = certificateRef?.trim() ?? ""
  if (trimmed.length === 0) return null
  return canReadHealthDetails ? trimmed : FHC_HEALTH_REDACTED_LABEL
}
