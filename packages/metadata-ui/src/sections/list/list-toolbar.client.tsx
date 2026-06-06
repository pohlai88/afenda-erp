"use client";

import {
  Badge,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@afenda/ui";
import { ui } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";

import type {
  MetadataUiTableClientModel,
  MetadataUiTableToolbarSortOptionModel,
} from "../../runtime/table-state.shared";

export type MetadataUiListToolbarSortValue =
  `${string}:${MetadataUiTableToolbarSortOptionModel["direction"]}`;

export type MetadataUiClientListToolbarProps = Readonly<{
  toolbar: MetadataUiTableClientModel["toolbar"];
  density: MetadataUiTableClientModel["density"];
  rowCount: number;
  selectedRowCount: number;
  searchQuery: string;
  sortValue: MetadataUiListToolbarSortValue | "";
  onSearchQueryChange: (value: string) => void;
  onDensityChange: (value: MetadataUiTableClientModel["density"]) => void;
  onSortChange: (value: MetadataUiListToolbarSortValue | "") => void;
  onReset: () => void;
}>;

const METADATA_UI_DENSITY_OPTIONS = [
  {
    value: "comfortable",
    label: "Comfortable",
  },
  {
    value: "compact",
    label: "Compact",
  },
  {
    value: "dense",
    label: "Dense",
  },
] as const satisfies readonly {
  value: MetadataUiTableClientModel["density"];
  label: string;
}[];

function createMetadataUiSortValue(
  option: MetadataUiTableToolbarSortOptionModel,
): MetadataUiListToolbarSortValue {
  return `${option.id}:${option.direction}`;
}

function isMetadataUiDensity(
  value: string,
): value is MetadataUiTableClientModel["density"] {
  return value === "comfortable" || value === "compact" || value === "dense";
}

function isMetadataUiSortValue(
  value: string,
): value is MetadataUiListToolbarSortValue {
  return /^[a-zA-Z0-9_.-]+:(asc|desc)$/.test(value);
}

export function MetadataUiClientListToolbar({
  toolbar,
  density,
  rowCount,
  selectedRowCount,
  searchQuery,
  sortValue,
  onSearchQueryChange,
  onDensityChange,
  onSortChange,
  onReset,
}: MetadataUiClientListToolbarProps) {
  if (!toolbar.enabled) {
    return null;
  }

  return (
    <div
      className={cn(
        "metadata-ui-list-toolbar grid rounded-section border border-border/70 bg-card p-surface-sm shadow-sm",
        ui.surfaceGap.sm,
      )}
      data-metadata-ui-list-toolbar="client"
      role="toolbar"
      aria-label="List toolbar"
    >
      <div className={cn("grid items-center gap-surface-sm xl:grid-cols-[minmax(18rem,1fr)_auto]")}>
        <div className={cn("flex min-w-0 flex-wrap items-center", ui.surfaceGap.xs)}>
          {toolbar.showSearch ? (
            <Input
              type="search"
              value={searchQuery}
              placeholder={toolbar.searchPlaceholder}
              aria-label={toolbar.searchPlaceholder}
              spellCheck={false}
              autoComplete="off"
              className="h-9 w-full min-w-56 max-w-sm bg-background xl:w-80"
              onChange={(event) => onSearchQueryChange(event.currentTarget.value)}
            />
          ) : null}
          {toolbar.showFilters && toolbar.filters.length > 0 ? (
            <div className={cn("flex min-w-0 flex-wrap items-center", ui.surfaceGap.xs)}>
              {toolbar.filters.map((filter) => (
                <Badge
                  key={filter.key}
                  variant={filter.locked ? "secondary" : "outline"}
                  className="h-7 rounded-control px-2.5"
                >
                  {filter.label}
                </Badge>
              ))}
            </div>
          ) : null}
          {toolbar.showSavedViews && toolbar.savedViews.length > 0 ? (
            <div className={cn("flex min-w-0 flex-wrap items-center", ui.surfaceGap.xs)}>
              {toolbar.savedViews.map((savedView) =>
                savedView.href ? (
                  <Button
                    key={savedView.key}
                    asChild
                    type="button"
                    variant={savedView.active ? "secondary" : "outline"}
                    size="sm"
                  >
                    <a href={savedView.href}>{savedView.label}</a>
                  </Button>
                ) : (
                  <Badge
                    key={savedView.key}
                    variant={savedView.active ? "secondary" : "outline"}
                    className="h-7 rounded-control px-2.5"
                  >
                    {savedView.label}
                  </Badge>
                ),
              )}
            </div>
          ) : null}
        </div>
        <div className={cn("flex flex-wrap items-center xl:justify-end", ui.surfaceGap.xs)}>
          {toolbar.showSort && toolbar.sortOptions.length > 0 ? (
            <Select
              value={sortValue || "metadata-ui-default-sort"}
              onValueChange={(value) => {
                onSortChange(isMetadataUiSortValue(value) ? value : "");
              }}
            >
              <SelectTrigger
                aria-label="Sort current window"
                size="sm"
                className="w-44 bg-background"
              >
                <SelectValue placeholder="Default sort" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="metadata-ui-default-sort">Default sort</SelectItem>
                {toolbar.sortOptions.map((option) => (
                  <SelectItem
                    key={createMetadataUiSortValue(option)}
                    value={createMetadataUiSortValue(option)}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
          {toolbar.showDensity ? (
            <Select
              value={density}
              onValueChange={(value) => {
                if (isMetadataUiDensity(value)) {
                  onDensityChange(value);
                }
              }}
            >
              <SelectTrigger
                aria-label="Table density"
                size="sm"
                className="w-36 bg-background"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {METADATA_UI_DENSITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
        </div>
      </div>
      <div
        className={cn(
          "flex flex-wrap items-center justify-between border-t border-border/60 pt-surface-sm",
          ui.surfaceGap.xs,
        )}
        aria-live="polite"
        aria-atomic="true"
        data-metadata-ui-list-toolbar-summary="true"
      >
        <div className={cn("flex flex-wrap items-center", ui.surfaceGap.xs)}>
          <Badge variant={selectedRowCount > 0 ? "default" : "outline"}>
            {selectedRowCount} selected
          </Badge>
          <Badge variant="outline">{rowCount} rows</Badge>
        </div>
        <div className={cn("flex flex-wrap items-center justify-end", ui.surfaceGap.xs)}>
          {toolbar.showExport && toolbar.exportAction ? (
            toolbar.exportAction.href ? (
              <Button type="button" variant="outline" size="sm" asChild>
                <a href={toolbar.exportAction.href}>
                  {toolbar.exportAction.label}
                </a>
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled
                title={toolbar.exportAction.disabledReason}
                aria-label={toolbar.exportAction.disabledReason ?? toolbar.exportAction.label}
              >
                {toolbar.exportAction.label}
              </Button>
            )
          ) : null}
          {toolbar.bulkActions.map((action) => (
            <Button
              key={action.id}
              type="button"
              variant="outline"
              size="sm"
              disabled={action.requiresSelection && selectedRowCount === 0}
              title={action.disabledReason}
              aria-label={action.disabledReason ?? action.label}
            >
              {action.label}
            </Button>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onReset}
            aria-label="Reset list toolbar"
          >
            {toolbar.resetLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
