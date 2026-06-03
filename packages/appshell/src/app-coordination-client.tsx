"use client";

import { BriefcaseBusiness } from "lucide-react";
import type { ReactNode } from "react";

import { AppShellUtilityDropdownTemplate } from "./app-utility-dropdown-template-client";

export function UtilityBarCoordinationPanel({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AppShellUtilityDropdownTemplate
      description="ERP-published operational coordination surfaces."
      icon={<BriefcaseBusiness aria-hidden="true" size={16} />}
      title="Coordination"
      triggerLabel="Open coordination"
      triggerTooltip="Open coordination"
    >
      {children}
    </AppShellUtilityDropdownTemplate>
  );
}
