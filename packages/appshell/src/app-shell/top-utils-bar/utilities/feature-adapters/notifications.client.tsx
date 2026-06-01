"use client";

import { Bell } from "lucide-react";
import type { ReactNode } from "react";

import { AppShellNotificationsAdvancedBlock } from "./notifications-advanced-block.client";
import { AppShellUtilityDropdownTemplate } from "../../template/utility-dropdown-template.client";

export function AppShellNexusUtilityNotifications({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AppShellUtilityDropdownTemplate
      description="ERP-published notification surfaces."
      icon={<Bell aria-hidden="true" size={16} />}
      title="Notifications"
      triggerLabel="Open notifications"
      triggerTooltip="Open notifications"
    >
      <AppShellNotificationsAdvancedBlock title="Notifications">
        {children}
      </AppShellNotificationsAdvancedBlock>
    </AppShellUtilityDropdownTemplate>
  );
}
