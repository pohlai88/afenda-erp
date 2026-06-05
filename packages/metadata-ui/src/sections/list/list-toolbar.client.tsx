"use client";

import { Badge, Button, Input, NativeSelect } from "@afenda/ui";
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
        "metadata-ui-list-toolbar flex flex-wrap items-center justify-between",
        ui.surfaceGap.sm,
      )}
      data-metadata-ui-list-toolbar="client"
    >
      <div className={cn("flex flex-wrap items-center", ui.surfaceGap.xs)}>
        {toolbar.showSearch ? (
          <Input
            type="search"
            value={searchQuery}
            placeholder={toolbar.searchPlaceholder}
            aria-label={toolbar.searchPlaceholder}
            className="h-8 w-64 max-w-full"
            onChange={(event) => onSearchQueryChange(event.currentTarget.value)}
          />
        ) : null}
        {toolbar.showFilters && toolbar.filters.length > 0 ? (
          <div className={cn("flex flex-wrap items-center", ui.surfaceGap.xs)}>
            {toolbar.filters.map((filter) => (
              <Badge
                key={filter.key}
                variant={filter.locked ? "secondary" : "outline"}
              >
                {filter.label}
              </Badge>
            ))}
          </div>
        ) : null}
        {toolbar.showSavedViews && toolbar.savedViews.length > 0 ? (
          <div className={cn("flex flex-wrap items-center", ui.surfaceGap.xs)}>
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
                >
                  {savedView.label}
                </Badge>
              ),
            )}
          </div>
        ) : null}
        {toolbar.showSort && toolbar.sortOptions.length > 0 ? (
          <NativeSelect
            aria-label="Sort current window"
            className="h-8 w-52"
            value={sortValue}
            onChange={(event) => {
              const value = event.currentTarget.value;
              onSortChange(isMetadataUiSortValue(value) ? value : "");
            }}
          >
            <option value="">Default sort</option>
            {toolbar.sortOptions.map((option) => (
              <option
                key={createMetadataUiSortValue(option)}
                value={createMetadataUiSortValue(option)}
              >
                {option.label}
              </option>
            ))}
          </NativeSelect>
        ) : null}
        {toolbar.showDensity ? (
          <NativeSelect
            aria-label="Table density"
            className="h-8 w-36"
            value={density}
            onChange={(event) => {
              const value = event.currentTarget.value;
              if (isMetadataUiDensity(value)) {
                onDensityChange(value);
              }
            }}
          >
            {METADATA_UI_DENSITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </NativeSelect>
        ) : null}
      </div>
      <div className={cn("flex flex-wrap items-center", ui.surfaceGap.xs)}>
        <Badge variant={selectedRowCount > 0 ? "default" : "outline"}>
          {selectedRowCount} selected
        </Badge>
        <Badge variant="outline">{rowCount} rows</Badge>
        {toolbar.showExport && toolbar.exportAction ? (
          toolbar.exportAction.href ? (
            <Button type="button" variant="outline" size="sm" asChild>
              <a href={toolbar.exportAction.href}>{toolbar.exportAction.label}</a>
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled
              title={toolbar.exportAction.disabledReason}
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
          >
            {action.label}
          </Button>
        ))}
        <Button type="button" variant="ghost" size="sm" onClick={onReset}>
          {toolbar.resetLabel}
        </Button>
      </div>
    </div>
  );
}
