"use client";

import { GripVertical, LayoutGrid, RotateCcw } from "lucide-react";

import { Button, Card, CardContent } from "@afenda/ui";

import { useAppShellRuntime } from "../../appshell.client";
import { AppShellUtilityDropdownTemplate } from "../template/utility-dropdown-template.client";
import { UTILITY_BAR_CATALOG } from "../metadata/utility-bar-items.shared";

export function AppShellUtilityBarConfigPopover() {
  const runtime = useAppShellRuntime();

  const orderedIds =
    runtime.utilityOrder.length > 0
      ? [...runtime.utilityOrder]
      : UTILITY_BAR_CATALOG.map((item) => item.id);

  function move(id: string, direction: -1 | 1) {
    runtime.setUtilityOrder((current) => {
      const next = current.length > 0 ? [...current] : UTILITY_BAR_CATALOG.map((item) => item.id);
      const index = next.indexOf(id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= next.length) {
        return next;
      }
      const [item] = next.splice(index, 1);
      if (!item) {
        return next;
      }
      next.splice(target, 0, item);
      return next;
    });
  }

  return (
    <AppShellUtilityDropdownTemplate
      description="Reorder the utility bar without changing ERP authority."
      icon={<LayoutGrid aria-hidden="true" size={16} />}
      title="Utility layout"
      triggerLabel="Utility layout"
      triggerTooltip="Configure utility layout"
      contentClassName="w-96"
      footer={
        <Button
          className="w-full justify-center"
          onClick={() => runtime.setUtilityOrder(UTILITY_BAR_CATALOG.map((item) => item.id))}
          size="sm"
          type="button"
          variant="outline"
        >
          <RotateCcw aria-hidden="true" className="mr-2" size={14} />
          Reset order
        </Button>
      }
    >
      <div className="grid gap-2">
        {orderedIds.map((id) => {
          const definition = UTILITY_BAR_CATALOG.find((item) => item.id === id);
          if (!definition) {
            return null;
          }
          return (
            <Card className="gap-0 py-0" key={id} size="sm">
              <CardContent className="flex items-center gap-2 px-3 py-2">
                <GripVertical aria-hidden="true" className="text-muted-foreground" size={14} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{definition.label}</div>
                  <div className="text-xs text-muted-foreground">{definition.description}</div>
                </div>
                <div className="flex gap-1">
                  <Button onClick={() => move(id, -1)} size="sm" type="button" variant="outline">
                    Up
                  </Button>
                  <Button onClick={() => move(id, 1)} size="sm" type="button" variant="outline">
                    Down
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </AppShellUtilityDropdownTemplate>
  );
}
