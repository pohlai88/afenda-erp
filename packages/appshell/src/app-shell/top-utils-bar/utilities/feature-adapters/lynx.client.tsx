"use client";

import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";

import { AppShellUtilityDropdownTemplate } from "../../template/utility-dropdown-template.client";

export function UtilityBarLynxPanel({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AppShellUtilityDropdownTemplate
      description="ERP-published Lynx surfaces."
      icon={<Sparkles aria-hidden="true" size={16} />}
      title="Lynx"
      triggerLabel="Open Lynx panel"
      triggerTooltip="Open Lynx panel"
    >
      {children}
    </AppShellUtilityDropdownTemplate>
  );
}
