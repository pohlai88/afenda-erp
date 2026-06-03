import "server-only";

import { getAuthPageShellCopy } from "@afenda/kernel";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ForgotPasswordForm } from "../forms/forgot-password/auth.forgot-password-form.client";
import { AuthPageFrame } from "../ingress/auth-page-frame.server";
import { AuthShell, createAuthPageMetadata } from "../ingress/auth-shell.server";
import { isNeonAuthUiReady } from "@afenda/auth/neon-auth-server";
import {
  getPostSignInDestination,
  getSession,
} from "@afenda/auth/server";

const shellCopy = getAuthPageShellCopy("forgotPassword");

export const metadata: Metadata = createAuthPageMetadata("forgotPassword");

type ForgotPasswordPageProps = {
  searchParams: Promise<{ email?: string }>;
};

export default function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
  return (
    <AuthPageFrame pageKey="forgotPassword" skeletonHeightClass="h-40">
      <ForgotPasswordPageInner searchParams={searchParams} />
    </AuthPageFrame>
  );
}

async function ForgotPasswordPageInner({ searchParams }: ForgotPasswordPageProps) {
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
      pageKey="forgotPassword"
      title={shellCopy.title}
    >
      <ForgotPasswordForm initialEmail={email?.trim() ?? ""} />
    </AuthShell>
  );
}
