"use client";

import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

import { AUTH_ROUTES } from "../contracts/auth.routes.shared";

const POST_RESET_REDIRECT_DELAY_MS = 450;

export function buildResetRedirectUrl(): string {
  if (typeof window === "undefined") {
    return AUTH_ROUTES.resetPassword;
  }

  return `${window.location.origin}${AUTH_ROUTES.resetPassword}`;
}

export function redirectAfterPasswordReset(
  router: AppRouterInstance,
  signedIn: boolean,
): void {
  window.setTimeout(() => {
    router.push(signedIn ? AUTH_ROUTES.dashboard : AUTH_ROUTES.signIn);
    router.refresh();
  }, POST_RESET_REDIRECT_DELAY_MS);
}

export function redirectAuthenticatedGuestAway(
  router: AppRouterInstance,
): void {
  router.replace(AUTH_ROUTES.dashboard);
  router.refresh();
}
