/** @see https://neon.com/docs/auth/reference/nextjs-server#upstream-fetch-errors */
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
