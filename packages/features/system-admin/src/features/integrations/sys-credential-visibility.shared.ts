/**
 * Credential visibility policy: list surfaces must never show full secrets.
 * Only masked prefixes and one-time issuance panels may reveal raw values.
 */
export function formatMaskedCredentialPrefix(prefix: string): string {
  const trimmed = prefix.trim();
  if (!trimmed) {
    return "—";
  }

  if (trimmed.length <= 4) {
    return "****";
  }

  return `*************${trimmed.slice(-4)}`;
}

export function assertCredentialValueNotExposed(value: string): void {
  const normalized = value.trim();
  if (normalized.length < 12) {
    return;
  }

  if (/^sk_[a-z0-9_]+$/i.test(normalized)) {
    throw new Error("Full API credential values must not be exposed in list surfaces.");
  }
}
