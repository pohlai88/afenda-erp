import {
  accountViewPaths,
  authViewPaths,
  type AccountViewPath,
  type AuthViewPath,
} from "@neondatabase/auth-ui/server";

/** Canonical Neon Auth UI auth view slugs (`AuthView` `path` prop). */
export const neonAuthUiAuthViews = {
  signIn: authViewPaths.SIGN_IN,
  signUp: authViewPaths.SIGN_UP,
  forgotPassword: authViewPaths.FORGOT_PASSWORD,
  resetPassword: authViewPaths.RESET_PASSWORD,
  emailOtp: authViewPaths.EMAIL_OTP,
  magicLink: authViewPaths.MAGIC_LINK,
  callback: authViewPaths.CALLBACK,
  signOut: authViewPaths.SIGN_OUT,
  twoFactor: authViewPaths.TWO_FACTOR,
} as const;

export type NeonAuthUiAuthViewSlug =
  (typeof neonAuthUiAuthViews)[keyof typeof neonAuthUiAuthViews];

/** Neon Auth UI account settings slugs (`AccountView` `path` prop). */
export const neonAuthUiAccountViews = {
  settings: accountViewPaths.SETTINGS,
  security: accountViewPaths.SECURITY,
  teams: accountViewPaths.TEAMS,
  apiKeys: accountViewPaths.API_KEYS,
  organizations: accountViewPaths.ORGANIZATIONS,
} as const;

export type NeonAuthUiAccountViewSlug =
  (typeof neonAuthUiAccountViews)[keyof typeof neonAuthUiAccountViews];

/**
 * Afenda ERP `(auth)` flat routes → Neon Auth UI view slugs.
 * Wire each App Router page to the matching page export from this package.
 */
export const erpAuthRouteToNeonUiAuthView = {
  "/sign-in": neonAuthUiAuthViews.signIn,
  "/sign-up": neonAuthUiAuthViews.signUp,
  "/forgot-password": neonAuthUiAuthViews.forgotPassword,
  "/reset-password": neonAuthUiAuthViews.resetPassword,
  "/verify-email": neonAuthUiAuthViews.emailOtp,
  "/otp": neonAuthUiAuthViews.emailOtp,
  "/callback": neonAuthUiAuthViews.callback,
  "/sign-out": neonAuthUiAuthViews.signOut,
  "/magic-link": neonAuthUiAuthViews.magicLink,
} as const;

export type ErpAuthRouteForNeonUi = keyof typeof erpAuthRouteToNeonUiAuthView;

export { authViewPaths, accountViewPaths, type AuthViewPath, type AccountViewPath };

/** Next.js catch-all under `/auth/[path]` — Neon quickstart pattern. */
export function neonAuthUiAuthGenerateStaticParams() {
  return Object.values(authViewPaths).map((path) => ({ path }));
}

export function neonAuthUiAccountGenerateStaticParams() {
  return Object.values(accountViewPaths).map((path) => ({ path }));
}

export function isNeonAuthUiAuthViewPath(path: string): path is NeonAuthUiAuthViewSlug {
  return (Object.values(neonAuthUiAuthViews) as string[]).includes(path);
}

export function isNeonAuthUiAccountViewPath(path: string): path is NeonAuthUiAccountViewSlug {
  return (Object.values(neonAuthUiAccountViews) as string[]).includes(path);
}
