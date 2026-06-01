"use client";

import { MessageCircle } from "lucide-react";
import type { ReactNode } from "react";

import { AppShellUtilityDropdownTemplate } from "../../template/utility-dropdown-template.client";

export function UtilityBarMessengerPanel({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AppShellUtilityDropdownTemplate
      description="ERP-published operator conversation surfaces."
      icon={<MessageCircle aria-hidden="true" size={16} />}
      title="Messages"
      triggerLabel="Open messages"
      triggerTooltip="Open messages"
    >
      {children}
    </AppShellUtilityDropdownTemplate>
  );
}
