/** ERP auth ingress routes (App Router `(auth)` segment). */
export type ErpAuthRoute =
  | "/sign-in"
  | "/sign-up"
  | "/otp"
  | "/verify-email"
  | "/forgot-password"
  | "/reset-password"
  | "/onboarding";

/** Canonical post-auth workspace entry — not an auth ingress route. */
export type AuthWorkspaceRoute = "/dashboard";

export const AUTH_ROUTES = {
  signIn: "/sign-in",
  signUp: "/sign-up",
  otp: "/otp",
  verifyEmail: "/verify-email",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  onboarding: "/onboarding",
  dashboard: "/dashboard",
} as const satisfies Record<string, ErpAuthRoute | AuthWorkspaceRoute>;
