"use client";

import type { ComponentProps, ReactNode } from "react";
import { AuthPrimaryButton } from "./auth-ui.primitives";

export function AuthSubmitButton({
  pending,
  pendingLabel,
  children,
  disabled,
  ...props
}: Omit<ComponentProps<typeof AuthPrimaryButton>, "children"> & {
  pending: boolean;
  pendingLabel: string;
  children: ReactNode;
}) {
  return (
    <AuthPrimaryButton
      {...props}
      aria-disabled={pending || disabled}
      disabled={pending || disabled}
    >
      {pending ? pendingLabel : children}
    </AuthPrimaryButton>
  );
}
