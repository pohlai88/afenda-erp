"use client";

import { useState } from "react";
import type { Route } from "next";
import {
  Check,
  ChevronDown,
  Download,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { Badge } from "@afenda/ui/badge";
import { Button } from "@afenda/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@afenda/ui/dropdown-menu";
import { Input } from "@afenda/ui/input";
import { NativeSelect, NativeSelectOption } from "@afenda/ui/native-select";
import {
  buildGovernedListToolbarClearHref,
  buildGovernedListToolbarParamHref,
  governedListToolbarOwnedParams,
  governedListToolbarResetParams,
} from "../../client";
import type { ListSurfaceToolbar } from "../../schemas/list-surface-toolbar.schema";
import type { uiDensity } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";

export type ListSurfaceToolbarClientProps = {
  toolbar?: ListSurfaceToolbar;
  density: keyof typeof uiDensity;
  onDensityChange?: (density: keyof typeof uiDensity) => void;
  hiddenColumnIds?: ReadonlySet<string>;
  onToggleColumn?: (columnId: string) => void;
  columnIds?: readonly string[];
  exportFormId?: string;
  exportTriggerElementId?: string;
  selectedCount?: number;
  selectionLabel?: string;
};

function currentToolbarHref(): string {
  if (typeof window === "undefined") {
    return "http://localhost/playground/metadata-renderer-gallery";
  }
  return (
    window.location.href ||
    "http://localhost/playground/metadata-renderer-gallery"
  );
}

function toolbarParamHref(
  toolbar: ListSurfaceToolbar,
  param: string,
  value: string,
): Route {
  return buildGovernedListToolbarParamHref({
    currentHref: currentToolbarHref(),
    param,
    value,
    resetParams: governedListToolbarResetParams(toolbar),
  }) as Route;
}

function toolbarClearHref(toolbar: ListSurfaceToolbar): Route {
  return buildGovernedListToolbarClearHref({
    currentHref: currentToolbarHref(),
    ownedParams: governedListToolbarOwnedParams(toolbar),
    resetParams: governedListToolbarResetParams(toolbar),
  }) as Route;
}

export function ListSurfaceToolbarClient({
  toolbar,
  density,
  onDensityChange,
  hiddenColumnIds,
  onToggleColumn,
  columnIds = [],
  exportFormId,
  exportTriggerElementId,
  selectedCount = 0,
  selectionLabel,
}: ListSurfaceToolbarClientProps) {
  const router = useRouter();
  const [showColumns, setShowColumns] = useState(false);

  if (!toolbar) {
    return null;
  }

  const activeFilterChips = [
    toolbar.search?.value
      ? {
          key: "search",
          label: `${toolbar.search.label}: ${toolbar.search.value}`,
          clearHref: toolbarParamHref(toolbar, toolbar.search.param, ""),
        }
      : null,
    ...(toolbar.filters ?? [])
      .filter((filter) => Boolean(filter.value))
      .map((filter) => {
        const optionLabel =
          filter.options.find((option) => option.value === filter.value)
            ?.label ?? filter.value;
        return {
          key: `filter:${filter.id}`,
          label: `${filter.label}: ${optionLabel}`,
          clearHref: toolbarParamHref(toolbar, filter.param, ""),
        };
      }),
    toolbar.sort?.value
      ? {
          key: "sort",
          label: `${toolbar.sort.label}: ${
            toolbar.sort.options.find(
              (option) => option.value === toolbar.sort?.value,
            )?.label ?? toolbar.sort.value
          }`,
          clearHref: toolbar.sort
            ? toolbarParamHref(toolbar, toolbar.sort.param, "")
            : ("" as Route),
        }
      : null,
  ].filter((chip): chip is { key: string; label: string; clearHref: Route } =>
    Boolean(chip),
  );
  const savedViewItems = toolbar.savedView?.items ?? [];

  return (
    <div
      className="mb-3 flex flex-wrap items-center justify-end gap-2"
      data-testid="governed-list-toolbar"
    >
      {selectedCount > 0 ? (
        <Badge variant="outline">
          {selectedCount} {selectionLabel ?? "selected"}
        </Badge>
      ) : null}
      {activeFilterChips.map((chip) => (
        <Badge key={chip.key} variant="secondary" className="gap-1 pr-1">
          <span>{chip.label}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="size-4 rounded-full p-0"
            aria-label={`Clear ${chip.label}`}
            onClick={() => router.replace(chip.clearHref)}
          >
            <X data-icon="inline-end" aria-hidden />
          </Button>
        </Badge>
      ))}
      {activeFilterChips.length > 0 ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => router.replace(toolbarClearHref(toolbar))}
        >
          <X data-icon="inline-start" aria-hidden />
          Clear
        </Button>
      ) : null}
      {toolbar.search ? (
        <form
          className="flex min-w-48 items-center gap-1"
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            const next = String(data.get(toolbar.search?.param ?? "") ?? "");
            if (toolbar.search) {
              router.push(
                toolbarParamHref(toolbar, toolbar.search.param, next),
              );
            }
          }}
        >
          <Input
            name={toolbar.search.param}
            defaultValue={toolbar.search.value}
            placeholder={toolbar.search.placeholder ?? toolbar.search.label}
            aria-label={toolbar.search.label}
            className="h-8"
          />
          <Button type="submit" variant="outline" size="sm">
            <Search aria-hidden />
            <span className="sr-only">{toolbar.search.label}</span>
          </Button>
        </form>
      ) : null}
      {toolbar.filters?.map((filter) => (
        <label
          key={filter.id}
          className="flex items-center gap-1 text-label-small text-muted-foreground"
        >
          <span>{filter.label}</span>
          <NativeSelect
            size="sm"
            value={filter.value ?? ""}
            onChange={(event) =>
              router.replace(
                toolbarParamHref(
                  toolbar,
                  filter.param,
                  event.currentTarget.value,
                ),
              )
            }
          >
            <NativeSelectOption value="">All</NativeSelectOption>
            {filter.options.map((option) => (
              <NativeSelectOption key={option.value} value={option.value}>
                {option.count === undefined
                  ? option.label
                  : `${option.label} (${option.count})`}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </label>
      ))}
      {toolbar.sort ? (
        <label className="flex items-center gap-1 text-label-small text-muted-foreground">
          <span>{toolbar.sort.label}</span>
          <NativeSelect
            size="sm"
            value={toolbar.sort.value ?? ""}
            onChange={(event) =>
              toolbar.sort
                ? router.replace(
                    toolbarParamHref(
                      toolbar,
                      toolbar.sort.param,
                      event.currentTarget.value,
                    ),
                  )
                : undefined
            }
          >
            <NativeSelectOption value="">Default</NativeSelectOption>
            {toolbar.sort.options.map((option) => (
              <NativeSelectOption key={option.value} value={option.value}>
                {option.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </label>
      ) : null}
      {toolbar.savedView && savedViewItems.length > 0 ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" size="sm">
              {toolbar.savedView.activeLabel ?? toolbar.savedView.label}
              <ChevronDown data-icon="inline-end" aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              {savedViewItems.map((item) => (
                <DropdownMenuItem
                  key={item.id ?? item.href}
                  onSelect={() => router.push(item.href as Route)}
                >
                  {item.active ? <Check aria-hidden /> : null}
                  <span>{item.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : toolbar.savedView ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!toolbar.savedView.href}
          onClick={() => {
            if (toolbar.savedView?.href) {
              router.push(toolbar.savedView.href as Route);
            }
          }}
        >
          {toolbar.savedView.activeLabel ?? toolbar.savedView.label}
        </Button>
      ) : null}
      {toolbar.densityToggle && onDensityChange ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            onDensityChange(density === "compact" ? "comfortable" : "compact")
          }
        >
          {density === "compact" ? "Comfortable" : "Compact"}
        </Button>
      ) : null}
      {toolbar.columnPicker && columnIds.length > 0 ? (
        <div className="relative">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowColumns((open) => !open)}
            aria-expanded={showColumns}
          >
            <SlidersHorizontal data-icon="inline-start" aria-hidden />
            Columns
          </Button>
          {showColumns ? (
            <div
              className={cn(
                "absolute end-0 top-full z-10 mt-1 min-w-[10rem] rounded-md border border-border bg-popover p-2 shadow-md",
              )}
              role="menu"
            >
              {columnIds.map((columnId) => (
                <label
                  key={columnId}
                  className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-muted"
                >
                  <input
                    type="checkbox"
                    checked={!hiddenColumnIds?.has(columnId)}
                    onChange={() => onToggleColumn?.(columnId)}
                  />
                  {columnId}
                </label>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
      {toolbar.export && exportTriggerElementId ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            document.getElementById(exportTriggerElementId)?.click()
          }
        >
          <Download data-icon="inline-start" aria-hidden />
          {toolbar.export.label}
        </Button>
      ) : null}
      {toolbar.export && exportFormId && !exportTriggerElementId ? (
        <Button type="submit" form={exportFormId} variant="outline" size="sm">
          <Download data-icon="inline-start" aria-hidden />
          {toolbar.export.label}
        </Button>
      ) : null}
      {toolbar.bulkActions?.map((action) => (
        <Button
          key={action.actionId}
          type="button"
          variant="outline"
          size="sm"
          disabled={Boolean(action.disabledReason)}
          title={action.disabledReason}
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
}
