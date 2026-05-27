import {
  getPostSignInDestination,
  getSession,
  isNeonAuthReady,
} from "@afenda/auth/server";
import { isDevCookieAuthEnabled } from "@afenda/config/env";
import { getAuthPageShellCopy, signInEnvironmentCopy } from "@afenda/domain";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthShell, createAuthPageMetadata } from "../_components/auth-shell";
import { DevSignInForm } from "../_components/dev-sign-in-form";
import { NeonAuthForm } from "../_components/neon-auth-forms";

const shellCopy = getAuthPageShellCopy("signIn");

export const metadata: Metadata = createAuthPageMetadata("signIn");

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <AuthShell
          description={shellCopy.suspenseDescription}
          title={shellCopy.title}
        >
          <div className="h-56 rounded-lg bg-muted" />
        </AuthShell>
      }
    >
      <SignInPageInner />
    </Suspense>
  );
}

async function SignInPageInner() {
  const session = await getSession();

  if (session) {
    redirect(getPostSignInDestination(session));
  }

  const neonAuthReady = isNeonAuthReady();
  const devCookieAuthEnabled = isDevCookieAuthEnabled();

  return (
    <AuthShell description={shellCopy.description} title={shellCopy.title}>
      {neonAuthReady ? (
        <NeonAuthForm mode="sign-in" />
      ) : devCookieAuthEnabled ? (
        <DevSignInForm />
      ) : (
        <div className="rounded-lg border border-line bg-surface px-4 py-3 text-sm leading-6 text-muted">
          {signInEnvironmentCopy.disabledMessage}
        </div>
      )}
    </AuthShell>
  );
}
