import "server-only";

import { isDevCookieAuthEnabled } from "@afenda/config/env";
import { getAuthPageShellCopy, signInEnvironmentCopy } from "@afenda/kernel";
import type { Metadata } from "next";
import { DevSignInForm } from "../dev/auth.dev-sign-in-form.server";
import { NeonAuthForm } from "../forms/auth.neon-auth-forms.client";
import { NeonPasswordlessSignIn } from "../forms/auth.neon-passwordless-sign-in.client";
import { AuthPageFrame } from "../ingress/auth-page-frame.server";
import { requireGuestSession } from "../ingress/auth.require-guest-session.server";
import {
  AuthShell,
  createAuthPageMetadata,
} from "../ingress/auth-shell.server";
import { isNeonAuthUiReady } from "@afenda/neon-auth/server";
import { resolveAuthMethodReadiness } from "../policy/auth-method-readiness.shared";

const shellCopy = getAuthPageShellCopy("signIn");

export const metadata: Metadata = createAuthPageMetadata("signIn");

export default function SignInPage() {
  return (
    <AuthPageFrame pageKey="signIn">
      <SignInPageInner />
    </AuthPageFrame>
  );
}

async function SignInPageInner() {
  await requireGuestSession();

  const neonAuthReady = isNeonAuthUiReady();
  const devCookieAuthEnabled = isDevCookieAuthEnabled();
  const readiness = resolveAuthMethodReadiness({
    neonAuthReady,
    devCookieAuthEnabled,
  }).methods;

  return (
    <AuthShell
      description={shellCopy.description}
      pageKey="signIn"
      title={shellCopy.title}
    >
      {neonAuthReady ? (
        <>
          <NeonAuthForm mode="sign-in" readiness={readiness} />
          <NeonPasswordlessSignIn readiness={readiness} />
        </>
      ) : devCookieAuthEnabled ? (
        <DevSignInForm />
      ) : (
        <div className="rounded-section border border-line bg-surface-inset px-surface-lg py-surface-lg type-muted leading-6">
          {signInEnvironmentCopy.disabledMessage}
        </div>
      )}
    </AuthShell>
  );
}
