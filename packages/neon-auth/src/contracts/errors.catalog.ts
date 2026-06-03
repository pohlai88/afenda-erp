/** Upstream transport error codes from Neon Auth SDK. @see Next.js Server SDK reference */
export const neonAuthNetworkErrorCodes = [
  "NETWORK_DNS",
  "NETWORK_REFUSED",
  "NETWORK_TIMEOUT",
  "NETWORK_TLS",
  "NETWORK_RESET",
  "NETWORK_ABORT",
  "NETWORK_ERROR",
] as const;

export type NeonAuthNetworkErrorCode = (typeof neonAuthNetworkErrorCodes)[number];

export function isNeonAuthNetworkErrorCode(code: unknown): code is NeonAuthNetworkErrorCode {
  return typeof code === "string" && (neonAuthNetworkErrorCodes as readonly string[]).includes(code);
}
