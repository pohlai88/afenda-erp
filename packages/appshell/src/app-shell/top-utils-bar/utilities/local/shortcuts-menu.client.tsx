"use client";

import { Keyboard } from "lucide-react";

import { AppShellUtilityDropdownTemplate } from "../../template/utility-dropdown-template.client";

const SHORTCUTS = [
  ["Command center", "Ctrl K"],
  ["Quick create", "C"],
  ["Go home", "G H"],
  ["Toggle rail", "Alt ["],
];

export function UtilityBarShortcutsPanel() {
  return (
    <AppShellUtilityDropdownTemplate
      description="Keyboard paths available in the ERP shell."
      icon={<Keyboard aria-hidden="true" size={16} />}
      title="Shortcuts"
      triggerLabel="Shortcuts"
      triggerTooltip="Show keyboard shortcuts"
    >
      <div className="grid gap-2">
        {SHORTCUTS.map(([label, chord]) => (
          <div className="flex items-center justify-between gap-3 text-sm" key={label}>
            <span>{label}</span>
            <kbd>{chord}</kbd>
          </div>
        ))}
      </div>
    </AppShellUtilityDropdownTemplate>
  );
}
