"use client";

import type { ReactNode } from "react";
import { authErrorCopy } from "../copy/auth-error-copy.shared";
import { AuthFormAlert } from "./auth-form-alert.client";

export function AuthMethodGate({
  ready,
  required = false,
  children,
}: {
  ready: boolean;
  required?: boolean;
  children: ReactNode;
}) {
  if (ready) {
    return children;
  }

  if (!required) {
    return null;
  }

  return (
    <AuthFormAlert
      message={authErrorCopy.provider_not_configured}
      tone="error"
    />
  );
}
