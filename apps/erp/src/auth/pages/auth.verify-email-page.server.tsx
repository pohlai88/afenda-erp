import "server-only";

import { getAuthPageShellCopy } from "@afenda/kernel";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { VerifyEmailForm } from "../forms/auth.verify-email-form.client";
import { AuthPageFrame } from "../ingress/auth-page-frame.server";
import { AuthShell, createAuthPageMetadata } from "../ingress/auth-shell.server";
import { isNeonAuthUiReady } from "@afenda/neon-auth/server";
import {
  getPostSignInDestination,
  getSession,
} from "@afenda/auth/server";

const shellCopy = getAuthPageShellCopy("verifyEmail");

export const metadata: Metadata = createAuthPageMetadata("verifyEmail");

type VerifyEmailPageProps = {
  searchParams: Promise<{ email?: string }>;
};

export default function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  return (
    <AuthPageFrame pageKey="verifyEmail" skeletonHeightClass="h-48">
      <VerifyEmailPageInner searchParams={searchParams} />
    </AuthPageFrame>
  );
}

async function VerifyEmailPageInner({ searchParams }: VerifyEmailPageProps) {
  const session = await getSession();

  if (session) {
    redirect(getPostSignInDestination(session));
  }

  if (!isNeonAuthUiReady()) {
    redirect("/sign-in");
  }

  const { email } = await searchParams;

  return (
    <AuthShell
      description={shellCopy.description}
      pageKey="verifyEmail"
      title={shellCopy.title}
    >
      <VerifyEmailForm initialEmail={email?.trim() ?? ""} />
    </AuthShell>
  );
}
