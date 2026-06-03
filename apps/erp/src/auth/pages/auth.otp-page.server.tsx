import "server-only";

import { getAuthPageShellCopy, signInEnvironmentCopy } from "@afenda/kernel";
import type { Metadata } from "next";
import { EmailOtpSignInForm } from "../forms/auth.email-otp-sign-in-form.client";
import { AuthPageFrame } from "../ingress/auth-page-frame.server";
import { requireGuestSession } from "../ingress/auth.require-guest-session.server";
import {
  AuthShell,
  createAuthPageMetadata,
} from "../ingress/auth-shell.server";
import { isNeonAuthUiReady } from "@afenda/auth/neon-auth-server";
import { resolveAuthMethodReadiness } from "../policy/auth-method-readiness.shared";

const shellCopy = getAuthPageShellCopy("otp");

export const metadata: Metadata = createAuthPageMetadata("otp");

export default function OtpPage() {
  return (
    <AuthPageFrame pageKey="otp" skeletonHeightClass="h-44">
      <OtpPageInner />
    </AuthPageFrame>
  );
}

async function OtpPageInner() {
  await requireGuestSession();

  const neonAuthReady = isNeonAuthUiReady();
  const readiness = resolveAuthMethodReadiness({
    neonAuthReady,
    devCookieAuthEnabled: false,
  }).methods;

  return (
    <AuthShell
      description={shellCopy.description}
      pageKey="otp"
      title={shellCopy.title}
    >
      {readiness.emailOtp ? (
        <EmailOtpSignInForm />
      ) : (
        <div className="rounded-section border border-line bg-surface-inset px-surface-lg py-surface-lg type-muted leading-6">
          {signInEnvironmentCopy.emailOtpDisabledMessage}
        </div>
      )}
    </AuthShell>
  );
}
