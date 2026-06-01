"use client";

import { Check, LayoutGrid } from "lucide-react";

import { Button } from "@afenda/ui";

import { useAppShellRuntime } from "../../../appshell.client";
import { AppShellUtilityDropdownTemplate } from "../../template/utility-dropdown-template.client";

export function UtilityBarDensityPanel() {
  const runtime = useAppShellRuntime();

  return (
    <AppShellUtilityDropdownTemplate
      description="Adjust how much information is packed into the shell."
      icon={<LayoutGrid aria-hidden="true" size={16} />}
      title="Density"
      triggerLabel="Density"
      triggerTooltip="Adjust shell density"
    >
      <div className="grid gap-2">
        {(["comfortable", "compact"] as const).map((density) => (
          <Button
            className="justify-between"
            key={density}
            onClick={() => runtime.setDensity(density)}
            type="button"
            variant={runtime.density === density ? "default" : "outline"}
          >
            <span className="capitalize">{density}</span>
            {runtime.density === density ? <Check aria-hidden="true" size={14} /> : null}
          </Button>
        ))}
      </div>
    </AppShellUtilityDropdownTemplate>
  );
}
