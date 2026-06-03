import "server-only";

import { NeonAuthUiAuthPage } from "./neon-auth-ui-auth-page.client";
import { NeonAuthUiPageGate } from "./neon-auth-ui-page-gate.server";
import { neonAuthUiAuthViews, type NeonAuthUiAuthViewSlug } from "./neon-auth-ui.routes.shared";

async function renderAuthView(view: NeonAuthUiAuthViewSlug) {
  return (
    <NeonAuthUiPageGate>
      <NeonAuthUiAuthPage view={view} />
    </NeonAuthUiPageGate>
  );
}

export async function NeonAuthSignInPage() {
  return renderAuthView(neonAuthUiAuthViews.signIn);
}

export async function NeonAuthSignUpPage() {
  return renderAuthView(neonAuthUiAuthViews.signUp);
}

export async function NeonAuthForgotPasswordPage() {
  return renderAuthView(neonAuthUiAuthViews.forgotPassword);
}

export async function NeonAuthResetPasswordPage() {
  return renderAuthView(neonAuthUiAuthViews.resetPassword);
}

export async function NeonAuthVerifyEmailPage() {
  return renderAuthView(neonAuthUiAuthViews.emailOtp);
}

export async function NeonAuthOtpPage() {
  return renderAuthView(neonAuthUiAuthViews.emailOtp);
}

export async function NeonAuthCallbackPage() {
  return renderAuthView(neonAuthUiAuthViews.callback);
}

export async function NeonAuthSignOutPage() {
  return renderAuthView(neonAuthUiAuthViews.signOut);
}

export async function NeonAuthMagicLinkPage() {
  return renderAuthView(neonAuthUiAuthViews.magicLink);
}
