"use client";

import { ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import { AppShellUtilityDropdownTemplate } from "../../template/utility-dropdown-template.client";

export function UtilityBarSystemAdminPanel({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AppShellUtilityDropdownTemplate
      description="ERP-published governance and control surfaces."
      icon={<ShieldCheck aria-hidden="true" size={16} />}
      title="System admin"
      triggerLabel="Open system admin panel"
      triggerTooltip="Open system admin panel"
    >
      {children}
    </AppShellUtilityDropdownTemplate>
  );
}
