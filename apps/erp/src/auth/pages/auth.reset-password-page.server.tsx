import "server-only";

import { getAuthPageShellCopy } from "@afenda/kernel";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ResetPasswordForm } from "../forms/auth.reset-password-form.client";
import { AuthPageFrame } from "../ingress/auth-page-frame.server";
import { AuthShell, createAuthPageMetadata } from "../ingress/auth-shell.server";
import { isNeonAuthUiReady } from "@afenda/neon-auth/server";
import {
  getPostSignInDestination,
  getSession,
} from "@afenda/auth/server";

const shellCopy = getAuthPageShellCopy("resetPassword");

export const metadata: Metadata = createAuthPageMetadata("resetPassword");

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string; error?: string }>;
};

export default function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  return (
    <AuthPageFrame pageKey="resetPassword" skeletonHeightClass="h-44">
      <ResetPasswordPageInner searchParams={searchParams} />
    </AuthPageFrame>
  );
}

async function ResetPasswordPageInner({
  searchParams,
}: ResetPasswordPageProps) {
  const session = await getSession();

  if (session) {
    redirect(getPostSignInDestination(session));
  }

  if (!isNeonAuthUiReady()) {
    redirect("/sign-in");
  }

  const params = await searchParams;
  const token = params.token?.trim() ?? "";

  return (
    <AuthShell
      description={shellCopy.description}
      pageKey="resetPassword"
      title={shellCopy.title}
    >
      <ResetPasswordForm initialToken={token} />
    </AuthShell>
  );
}
