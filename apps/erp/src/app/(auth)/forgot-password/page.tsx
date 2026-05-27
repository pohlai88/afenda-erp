import { getSession, isNeonAuthReady } from "@afenda/auth/server";
import { getAuthPageShellCopy } from "@afenda/domain";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthShell, createAuthPageMetadata } from "../_components/auth-shell";
import { ForgotPasswordForm } from "../_components/forgot-password-form";

const shellCopy = getAuthPageShellCopy("forgotPassword");

export const metadata: Metadata = createAuthPageMetadata("forgotPassword");

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthShell
          description={shellCopy.suspenseDescription}
          title={shellCopy.title}
        >
          <div className="h-40 rounded-lg bg-muted" />
        </AuthShell>
      }
    >
      <ForgotPasswordPageInner />
    </Suspense>
  );
}

async function ForgotPasswordPageInner() {
  const session = await getSession();

  if (session) {
    redirect("/");
  }

  if (!isNeonAuthReady()) {
    redirect("/sign-in");
  }

  return (
    <AuthShell description={shellCopy.description} title={shellCopy.title}>
      <ForgotPasswordForm />
    </AuthShell>
  );
}
