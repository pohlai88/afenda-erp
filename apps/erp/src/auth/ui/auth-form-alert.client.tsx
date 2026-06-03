"use client";

import { AuthNotice } from "./auth-ui.primitives";

export function AuthFormAlert({
  message,
  tone,
}: {
  message: string | null;
  tone: "error" | "success" | "info";
}) {
  if (!message) {
    return null;
  }

  return (
    <div aria-live="polite">
      <AuthNotice tone={tone}>{message}</AuthNotice>
    </div>
  );
}
