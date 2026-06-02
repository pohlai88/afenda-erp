"use client";

import {
  useMemo,
  useState,
  type DragEvent,
  type ElementType,
} from "react";
import {
  Bell,
  Briefcase,
  Camera,
  CircleHelp,
  Database,
  FileUp,
  GripVertical,
  Keyboard,
  LayoutGrid,
  MessageCircle,
  MessageSquare,
  PenLine,
  RotateCcw,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Store,
  Wifi,
} from "lucide-react";

import {
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Switch,
} from "@afenda/ui";
import { cn } from "@afenda/ui/utils";

import {
  selectAllItemsOrdered,
  useUtilityBarStore,
  type UtilityBarItemState,
} from "../../../stores/utility-bar.store";
import {
  RIGHT_UTILITY_BAR_CATALOG,
  UTILITY_BAR_INTENT_ORDER,
  UTILITY_BAR_MAX_VISIBLE,
  type UtilityBarItemId,
} from "../metadata/utility-bar-items.shared";
import { APP_SHELL_UTILITY_DROPDOWN_CONTENT_WIDE_CLASS, APP_SHELL_UTILITY_L2_MENU_TRIGGER_OPEN_STATE_CLASS } from "../template/utility-dropdown-chrome.shared";
import { APP_SHELL_UTILITY_ICON_BUTTON_SM_CLASS } from "../template/utility-chrome.shared";
import { AppShellUtilityTriggerTooltip } from "../template/utility-trigger-tooltip.client";

const CATALOG_ICON: Record<string, ElementType> = {
  Bell,
  Briefcase,
  Camera,
  "circle-help": CircleHelp,
  CircleHelp,
  Database,
  "file-up": FileUp,
  FileUp,
  Keyboard,
  "layout-grid": LayoutGrid,
  LayoutGrid,
  "message-circle": MessageCircle,
  MessageCircle,
  "message-square": MessageSquare,
  MessageSquare,
  PenLine,
  ScanSearch,
  "shield-check": ShieldCheck,
  ShieldCheck,
  Sparkles,
  Wifi,
};

type DragState = {
  dragId: UtilityBarItemId | null;
  overIndex: number | null;
};

function utilityDefinitionForItem(item: UtilityBarItemState) {
  return RIGHT_UTILITY_BAR_CATALOG.find((def) => def.id === item.id) ?? null;
}

function catalogRowMatchesFilter(item: UtilityBarItemState, query: string) {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return true;
  }

  const def = utilityDefinitionForItem(item);
  if (!def) {
    return false;
  }

  const haystack = [def.label, def.description, def.id.replace(/-/g, " ")]
    .join(" ")
    .toLowerCase();
  const tokens = trimmed.split(/\s+/).filter(Boolean);
  return tokens.every((token) => haystack.includes(token));
}

function CatalogItemRow({
  item,
  index,
  visibleCount,
  isDragging,
  isOver,
  allowReorder,
  onToggle,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  item: UtilityBarItemState;
  index: number;
  visibleCount: number;
  isDragging: boolean;
  isOver: boolean;
  allowReorder: boolean;
  onToggle: (id: UtilityBarItemId) => void;
  onDragStart: (id: UtilityBarItemId) => void;
  onDragOver: (event: DragEvent, index: number) => void;
  onDrop: (event: DragEvent) => void;
  onDragEnd: () => void;
}) {
  const def = utilityDefinitionForItem(item);
  if (!def) {
    return null;
  }

  const IconEl = CATALOG_ICON[def.iconKey] ?? Store;
  const atCap = !item.visible && visibleCount >= UTILITY_BAR_MAX_VISIBLE - 1;

  return (
    <div
      className={cn(
        "group/row flex items-center gap-2.5 px-4 py-2.5 transition-colors select-none",
        allowReorder && "cursor-grab active:cursor-grabbing",
        !allowReorder && "cursor-default",
        isDragging && allowReorder && "opacity-40",
        isOver && allowReorder && "bg-muted/60",
        !(isOver && allowReorder) && "hover:bg-muted/30",
      )}
      draggable={allowReorder}
      onDragEnd={() => {
        if (!allowReorder) {
          return;
        }
        onDragEnd();
      }}
      onDragOver={(event) => {
        if (!allowReorder) {
          return;
        }
        onDragOver(event, index);
      }}
      onDragStart={(event) => {
        if (!allowReorder) {
          return;
        }
        onDragStart(item.id);
        try {
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData("text/plain", item.id);
        } catch {
          // Optional drag metadata — ignore in constrained environments.
        }
      }}
      onDrop={(event) => {
        if (!allowReorder) {
          return;
        }
        onDrop(event);
      }}
    >
      <GripVertical
        aria-hidden
        className="size-3.5 shrink-0 text-muted-foreground/40 group-hover/row:text-muted-foreground"
      />

      <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted/50">
        <IconEl aria-hidden className="size-3.5 text-muted-foreground" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-foreground">{def.label}</p>
        <p className="truncate text-[10px] text-muted-foreground">{def.description}</p>
      </div>

      <Switch
        aria-label={item.visible ? `Hide ${def.label}` : `Show ${def.label}`}
        checked={item.visible}
        className="shrink-0 scale-90"
        disabled={atCap}
        onCheckedChange={() => onToggle(item.id)}
      />
    </div>
  );
}

function UtilitiesConfigurationBody() {
  const { items, toggleItem, reorderFullCatalog, reset } = useUtilityBarStore();
  const orderedItems = selectAllItemsOrdered(items);
  const visibleCount = items.filter((item) => item.visible).length;
  const [filterQuery, setFilterQuery] = useState("");
  const filteredItems = useMemo(
    () => orderedItems.filter((item) => catalogRowMatchesFilter(item, filterQuery)),
    [filterQuery, orderedItems],
  );
  const groupedItems = useMemo(
    () =>
      UTILITY_BAR_INTENT_ORDER.map((intent) => ({
        intent,
        entries: filteredItems
          .map((item, filteredIndex) => ({ item, filteredIndex }))
          .filter(
            ({ item }) => utilityDefinitionForItem(item)?.intent === intent,
          ),
      })).filter((group) => group.entries.length > 0),
    [filteredItems],
  );
  const allowReorder = filterQuery.trim() === "";
  const [drag, setDrag] = useState<DragState>({
    dragId: null,
    overIndex: null,
  });

  function handleDragStart(id: UtilityBarItemId) {
    setDrag({ dragId: id, overIndex: null });
  }

  function handleDragOver(event: DragEvent, index: number) {
    event.preventDefault();
    setDrag((current) => ({ ...current, overIndex: index }));
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    const { dragId, overIndex } = drag;
    if (dragId === null || overIndex === null) {
      setDrag({ dragId: null, overIndex: null });
      return;
    }

    const ids = selectAllItemsOrdered(useUtilityBarStore.getState().items).map(
      (item) => item.id,
    );
    const from = ids.indexOf(dragId);
    if (from === -1) {
      setDrag({ dragId: null, overIndex: null });
      return;
    }

    ids.splice(from, 1);
    ids.splice(overIndex, 0, dragId);
    reorderFullCatalog(ids);
    setDrag({ dragId: null, overIndex: null });
  }

  function handleDragEnd() {
    setDrag({ dragId: null, overIndex: null });
  }

  const maxVisible = UTILITY_BAR_MAX_VISIBLE - 1;

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b border-border/30 px-4 py-2">
        <span className="text-[10px] text-muted-foreground">
          {visibleCount} of {maxVisible} shown
        </span>
        <button
          className="flex items-center gap-1 text-[10px] text-muted-foreground transition-colors hover:text-foreground"
          onClick={reset}
          type="button"
        >
          <RotateCcw aria-hidden className="size-3" />
          Reset
        </button>
      </div>

      <div className="border-b border-border/30 px-4 py-2">
        <Input
          aria-label="Filter utilities"
          className="h-8 text-xs"
          onChange={(event) => setFilterQuery(event.target.value)}
          placeholder="Filter utilities"
          value={filterQuery}
        />
        {!allowReorder ? (
          <p className="mt-1.5 text-[10px] text-muted-foreground">
            Clear the filter to drag and reorder utilities.
          </p>
        ) : null}
      </div>

      {filteredItems.length === 0 ? (
        <p className="px-4 py-6 text-center text-xs text-muted-foreground">
          No utilities match &ldquo;{filterQuery.trim()}&rdquo;.
        </p>
      ) : (
        groupedItems.map((group) => (
          <section
            aria-labelledby={`utility-intent-${group.intent}`}
            className="border-b border-border/20 last:border-b-0"
            key={group.intent}
          >
            <h3
              className="px-4 pt-3 pb-1 text-[10px] font-medium tracking-normal text-muted-foreground capitalize"
              id={`utility-intent-${group.intent}`}
            >
              {group.intent}
            </h3>
            {group.entries.map(({ item, filteredIndex }) => (
              <CatalogItemRow
                allowReorder={allowReorder}
                index={filteredIndex}
                isDragging={drag.dragId === item.id}
                isOver={
                  allowReorder &&
                  drag.overIndex === filteredIndex &&
                  drag.dragId !== item.id
                }
                item={item}
                key={item.id}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDragStart={handleDragStart}
                onDrop={handleDrop}
                onToggle={toggleItem}
                visibleCount={visibleCount}
              />
            ))}
          </section>
        ))
      )}
    </div>
  );
}

export function AppShellUtilityBarConfigPopover() {
  const [open, setOpen] = useState(false);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <AppShellUtilityTriggerTooltip label="Configure utility layout">
        <PopoverTrigger asChild>
          <button
            aria-label="Configure utility layout"
            className={cn(
              APP_SHELL_UTILITY_ICON_BUTTON_SM_CLASS,
              APP_SHELL_UTILITY_L2_MENU_TRIGGER_OPEN_STATE_CLASS,
            )}
            type="button"
          >
            <Store aria-hidden="true" size={15} strokeWidth={2} />
          </button>
        </PopoverTrigger>
      </AppShellUtilityTriggerTooltip>

      <PopoverContent
        align="end"
        className={cn(
          APP_SHELL_UTILITY_DROPDOWN_CONTENT_WIDE_CLASS,
          "max-h-[min(82vh,36rem)] w-[min(24rem,calc(100vw-2rem))] p-0",
        )}
        sideOffset={8}
      >
        <div className="shrink-0 border-b border-border/50 px-4 py-3">
          <div className="flex items-start gap-2.5">
            <LayoutGrid aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-tight text-card-foreground">
                Utility layout
              </p>
              <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                Choose up to six utilities for the right rail and drag to reorder them.
              </p>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <UtilitiesConfigurationBody />
        </div>
      </PopoverContent>
    </Popover>
  );
}
