export const authErrorCodes = [
  "invalid_credentials",
  "password_policy_failed",
  "email_already_registered",
  "verification_code_expired",
  "too_many_attempts",
  "provider_not_configured",
  "email_delivery_unavailable",
  "network_unavailable",
  "unknown_auth_error",
] as const;

export type AuthErrorCode = (typeof authErrorCodes)[number];
