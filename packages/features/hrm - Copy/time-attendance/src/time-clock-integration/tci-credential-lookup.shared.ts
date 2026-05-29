import { createHash } from "node:crypto"

import { isVendorScheduledSyncCredential } from "./data/tci-vendor-adapter.shared"

/** SHA-256 hex for indexed API-key lookup (vendor poll URLs are not indexed). */
export function resolveTimeClockApiCredentialSha256(
  credentialRef: string | null | undefined
): string | null {
  const trimmed = credentialRef?.trim()
  if (!trimmed || isVendorScheduledSyncCredential(trimmed)) {
    return null
  }
  return createHash("sha256").update(trimmed, "utf8").digest("hex")
}

export function resolveTimeClockBearerTokenSha256(token: string): string {
  return createHash("sha256").update(token.trim(), "utf8").digest("hex")
}
