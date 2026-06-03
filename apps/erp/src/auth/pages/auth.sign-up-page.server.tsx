import "server-only";

import { isDevCookieAuthEnabled } from "@afenda/config/env";
import { getAuthPageShellCopy, signUpEnvironmentCopy } from "@afenda/kernel";
import { Button } from "@afenda/ui/button";
import type { Metadata } from "next";
import Link from "next/link";
import { DevSignInForm } from "../dev/auth.dev-sign-in-form.server";
import { NeonAuthForm } from "../forms/auth.neon-auth-forms.client";
import { AuthPageFrame } from "../ingress/auth-page-frame.server";
import { requireGuestSession } from "../ingress/auth.require-guest-session.server";
import {
  AuthShell,
  createAuthPageMetadata,
} from "../ingress/auth-shell.server";
import { isNeonAuthUiReady } from "@afenda/neon-auth/server";
import { resolveAuthMethodReadiness } from "../policy/auth-method-readiness.shared";

const shellCopy = getAuthPageShellCopy("signUp");

export const metadata: Metadata = createAuthPageMetadata("signUp");

export default function SignUpPage() {
  return (
    <AuthPageFrame pageKey="signUp">
      <SignUpPageInner />
    </AuthPageFrame>
  );
}

async function SignUpPageInner() {
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
      pageKey="signUp"
      title={shellCopy.title}
    >
      {neonAuthReady ? (
        <NeonAuthForm mode="sign-up" readiness={readiness} />
      ) : devCookieAuthEnabled ? (
        <>
          <p className="type-muted">{signUpEnvironmentCopy.devHint}</p>
          <DevSignInForm />
          <Button asChild className="mt-surface-xl" variant="outline">
            <Link href="/sign-in">{signUpEnvironmentCopy.actionLabel}</Link>
          </Button>
        </>
      ) : (
        <div className="flex flex-col gap-surface-xl">
          <h2 className="type-section-title font-semibold text-foreground">
            {signUpEnvironmentCopy.title}
          </h2>
          <p className="type-muted leading-6">
            {signUpEnvironmentCopy.description}
          </p>
          <Button asChild className="w-full">
            <Link href="/sign-in">{signUpEnvironmentCopy.actionLabel}</Link>
          </Button>
        </div>
      )}
    </AuthShell>
  );
}
