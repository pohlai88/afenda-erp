import { getPostSignInDestination, getSession } from "@afenda/auth/server";
import { getAuthPageShellCopy } from "@afenda/kernel";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import {
  AuthShell,
  createAuthPageMetadata,
} from "../(auth)/_components/auth-shell";
import { OnboardingForm } from "./onboarding-form";

const shellCopy = getAuthPageShellCopy("onboarding");

export const metadata: Metadata = createAuthPageMetadata("onboarding");

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <AuthShell
          description={shellCopy.suspenseDescription}
          title={shellCopy.title}
        >
          <div className="h-48 rounded-section bg-muted" />
        </AuthShell>
      }
    >
      <OnboardingPageInner />
    </Suspense>
  );
}

async function OnboardingPageInner() {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  if (session.source === "dev" || session.organizations.length > 0) {
    redirect(getPostSignInDestination(session));
  }

  return (
    <AuthShell description={shellCopy.description} title={shellCopy.title}>
      <OnboardingForm />
    </AuthShell>
  );
}
