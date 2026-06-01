"use client";

import { FileUp } from "lucide-react";
import type { ReactNode } from "react";

import { Alert, AlertDescription, AlertTitle } from "@afenda/ui";

import { AppShellUtilityDropdownTemplate } from "../../template/utility-dropdown-template.client";

export function UtilityBarUploadPanel({
  children,
}: {
  children?: ReactNode;
}) {
  return (
    <AppShellUtilityDropdownTemplate
      description="ERP-owned upload flows can be mounted into this shell utility."
      icon={<FileUp aria-hidden="true" size={16} />}
      title="Upload"
      triggerLabel="Open upload panel"
      triggerTooltip="Open upload panel"
    >
      {children ?? (
        <Alert>
          <FileUp aria-hidden="true" />
          <AlertTitle>Upload surface ready</AlertTitle>
          <AlertDescription>
            The shell runtime is ready. The ERP app still owns the final upload flow and route contract.
          </AlertDescription>
        </Alert>
      )}
    </AppShellUtilityDropdownTemplate>
  );
}
