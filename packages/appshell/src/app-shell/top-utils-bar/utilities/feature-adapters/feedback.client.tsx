"use client";

import { PenLine } from "lucide-react";
import type { ReactNode } from "react";

import { AppShellUtilityDropdownTemplate } from "../../template/utility-dropdown-template.client";

export function UtilityBarFeedbackPanel({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AppShellUtilityDropdownTemplate
      description="ERP-published feedback and knowledge actions."
      icon={<PenLine aria-hidden="true" size={16} />}
      title="Feedback"
      triggerLabel="Open feedback panel"
      triggerTooltip="Open feedback panel"
    >
      {children}
    </AppShellUtilityDropdownTemplate>
  );
}
