"use client";

import { Camera } from "lucide-react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { Alert, AlertDescription, AlertTitle, Button } from "@afenda/ui";

import { AppShellUtilityDropdownTemplate } from "../../template/utility-dropdown-template.client";

export function UtilityBarScreenshotPanel({
  children,
}: {
  children?: ReactNode;
}) {
  const pathname = usePathname();

  async function copyPath() {
    await navigator.clipboard.writeText(pathname);
  }

  return (
    <AppShellUtilityDropdownTemplate
      description="Shell-level screenshot and capture affordances."
      icon={<Camera aria-hidden="true" size={16} />}
      title="Screenshot"
      triggerLabel="Open screenshot panel"
      triggerTooltip="Open screenshot panel"
    >
      <div className="grid gap-3">
        {children ?? (
          <Alert>
            <Camera aria-hidden="true" />
            <AlertTitle>Capture handoff surface</AlertTitle>
            <AlertDescription>
              The ERP app can publish a governed capture flow here. The shell currently exposes a capture handoff surface.
            </AlertDescription>
          </Alert>
        )}
        <Button onClick={() => void copyPath()} size="sm" type="button" variant="outline">
          Copy current route
        </Button>
      </div>
    </AppShellUtilityDropdownTemplate>
  );
}
