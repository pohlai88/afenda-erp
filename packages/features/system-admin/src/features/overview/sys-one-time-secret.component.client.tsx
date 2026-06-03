"use client";

import { uiRadius, uiSurfaceInset } from "@afenda/ui/design-system";
import { Alert, AlertDescription, AlertTitle } from "@afenda/ui/alert";
import { cn } from "@afenda/ui/utils";

export const systemAdminOneTimeSecretCopy = {
  defaultTitle: "One-time invitation token",
  defaultDetail: "Copy this token now. It will not be shown again.",
} as const;

export function SystemAdminOneTimeSecretPanel({
  title = systemAdminOneTimeSecretCopy.defaultTitle,
  secret,
  detail = systemAdminOneTimeSecretCopy.defaultDetail,
}: {
  title?: string;
  secret: string;
  detail?: string;
}) {
  return (
    <Alert className="mt-surface-sm">
      <AlertTitle>{title}</AlertTitle>
      {detail ? <AlertDescription>{detail}</AlertDescription> : null}
      <code
        className={cn(
          "mt-surface-sm block overflow-x-auto bg-background type-mono-cell",
          uiRadius.control,
          uiSurfaceInset.sm,
        )}
      >
        {secret}
      </code>
    </Alert>
  );
}
