/** ERP proxies Neon Auth at this path. @see Neon quickstart `app/api/auth/[...path]` */
export const neonAuthHttpProxyPath = "/api/auth";

/** Afenda internal webhook ingress (ARCH-1004). Neon console must use HTTPS hostname. */
export const neonAuthWebhookHttpPath = "/api/internal/v1/webhooks/neon-auth";

/** Pre-login `(auth)` routes — proxy skips Neon middleware when no session cookie yet. */
export const erpPreLoginAuthPathPrefixes = [
  "/sign-in",
  "/sign-up",
  "/verify-email",
  "/otp",
  "/forgot-password",
  "/reset-password",
  "/callback",
  "/sign-out",
  "/magic-link",
] as const;

/** Neon Auth UI account routes (require session; not guest-only). */
export const erpNeonAccountPathPrefixes = ["/account"] as const;

/** Default post-Neon-sign-in destination before tenant session layer (phase C). */
export const erpPreLoginPostAuthPath = "/account";
