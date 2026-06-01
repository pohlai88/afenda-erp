"use client";

import { MessageSquare } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { APP_SHELL_QUICK_CREATE_EVENT } from "../../../appshell-global-shortcuts.client";
import { AppShellUtilityDropdownTemplate } from "../../template/utility-dropdown-template.client";

export function UtilityBarQuickCreatePanel({
  children,
}: {
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onQuickCreate() {
      setOpen(true);
    }

    window.addEventListener(APP_SHELL_QUICK_CREATE_EVENT, onQuickCreate);
    return () =>
      window.removeEventListener(APP_SHELL_QUICK_CREATE_EVENT, onQuickCreate);
  }, []);

  return (
    <AppShellUtilityDropdownTemplate
      description="ERP-published quick-create actions."
      icon={<MessageSquare aria-hidden="true" size={16} />}
      onOpenChange={setOpen}
      open={open}
      title="Quick create"
      triggerLabel="Open quick create"
      triggerTooltip="Open quick create"
    >
      {children}
    </AppShellUtilityDropdownTemplate>
  );
}
