import {
  getPostSignInDestination,
  getSession,
  isNeonAuthReady,
} from "@afenda/auth/server";
import { getAuthPageShellCopy, signUpEnvironmentCopy } from "@afenda/kernel";
import { Button } from "@afenda/ui/button";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthShell, createAuthPageMetadata } from "../_components/auth-shell";
import { NeonAuthForm } from "../_components/neon-auth-forms";

const shellCopy = getAuthPageShellCopy("signUp");

export const metadata: Metadata = createAuthPageMetadata("signUp");

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <AuthShell
          description={shellCopy.suspenseDescription}
          title={shellCopy.title}
        >
          <div className="h-56 rounded-section bg-muted" />
        </AuthShell>
      }
    >
      <SignUpPageInner />
    </Suspense>
  );
}

async function SignUpPageInner() {
  const session = await getSession();

  if (session) {
    redirect(getPostSignInDestination(session));
  }

  const neonAuthReady = isNeonAuthReady();

  return (
    <AuthShell description={shellCopy.description} title={shellCopy.title}>
      {neonAuthReady ? (
        <NeonAuthForm mode="sign-up" />
      ) : (
        <div>
          <h2 className="type-section-title font-semibold text-foreground">
            {signUpEnvironmentCopy.title}
          </h2>
          <p className="mt-3 type-body leading-6 text-muted-foreground">
            {signUpEnvironmentCopy.description}
          </p>
          <Button asChild className="mt-surface-3xl">
            <Link href="/sign-in">{signUpEnvironmentCopy.actionLabel}</Link>
          </Button>
        </div>
      )}
    </AuthShell>
  );
}
