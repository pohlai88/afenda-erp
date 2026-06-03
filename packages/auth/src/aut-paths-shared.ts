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

/**
 * Neon Auth UI defaults to `basePath: "/auth"` (quickstart layout).
 * Afenda `(auth)` routes are flat — see `erpAuthRouteToNeonUiAuthView`.
 */
export const erpNeonAuthUiBasePath = "";

/** Permanent redirects from Neon quickstart `/auth/*` URLs to Afenda flat routes. */
export const erpNeonAuthLegacyPathRedirects = [
  { source: "/auth/sign-in", destination: "/sign-in" },
  { source: "/auth/sign-up", destination: "/sign-up" },
  { source: "/auth/forgot-password", destination: "/forgot-password" },
  { source: "/auth/reset-password", destination: "/reset-password" },
  { source: "/auth/email-otp", destination: "/verify-email" },
  { source: "/auth/magic-link", destination: "/magic-link" },
  { source: "/auth/callback", destination: "/callback" },
  { source: "/auth/sign-out", destination: "/sign-out" },
] as const;
