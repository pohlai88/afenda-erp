"use client";

import { useMemo, useState, type DragEvent, type ReactNode } from "react";
import { GripVertical } from "lucide-react";

import { cn } from "@afenda/ui/utils";

import {
  selectVisibleItems,
  useUtilityBarStore,
  type UtilityBarItemState,
} from "./app-utility-bar-store";
import {
  UTILITY_BAR_MOBILE_VISIBLE_ICON_CAP,
  type UtilityBarItemId,
} from "./app-utility-bar-items-shared";
import type { AppShellUtilityItemMetadata } from "./app-utility-bar-metadata-shared";
import {
  useAppShellUtilityRuntimeContext,
} from "./app-utility-runtime-core-client";
import { renderAppShellUtilityRuntimeItem } from "./app-utility-runtime-adapters-client";

function DraggableRailItem({
  id,
  index,
  isDragging,
  isDropTarget,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isMobileOverflow,
  children,
}: {
  id: UtilityBarItemId;
  index: number;
  isDragging: boolean;
  isDropTarget: boolean;
  onDragStart: (id: UtilityBarItemId) => void;
  onDragOver: (event: DragEvent, index: number) => void;
  onDrop: (event: DragEvent) => void;
  onDragEnd: () => void;
  isMobileOverflow: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "group/utility-rail-item relative flex items-center select-none",
        isMobileOverflow && "max-sm:hidden",
        isDragging && "opacity-30",
        isDropTarget &&
          "before:absolute before:top-1 before:bottom-1 before:-left-[3px] before:w-0.5 before:rounded-full before:bg-ring",
      )}
      onDragEnd={onDragEnd}
      onDragOver={(event) => onDragOver(event, index)}
      onDrop={onDrop}
    >
      <span
        aria-hidden
        className={cn(
          "hidden h-7 w-1.5 shrink-0 cursor-grab items-center justify-center text-muted-foreground/40 opacity-0 transition-opacity active:cursor-grabbing md:flex",
          "group-focus-within/utility-rail-item:opacity-100 group-hover/utility-rail-item:opacity-100",
        )}
        data-app-shell-utility-drag-handle
        draggable
        onDragStart={(event) => {
          onDragStart(id);
          try {
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", id);
          } catch {
            // Optional drag metadata — ignore in constrained environments.
          }
        }}
      >
        <GripVertical aria-hidden="true" size={12} strokeWidth={2} />
      </span>
      {children}
    </div>
  );
}

function metadataForStoreItem(
  storeItem: UtilityBarItemState,
  metadataByAdapterKey: ReadonlyMap<string, AppShellUtilityItemMetadata>,
) {
  return metadataByAdapterKey.get(storeItem.id) ?? null;
}

export function AppShellRightUtilityRail() {
  const context = useAppShellUtilityRuntimeContext();
  const storeItems = useUtilityBarStore((state) => state.items);
  const reorderVisibleInRail = useUtilityBarStore((state) => state.reorderVisibleInRail);

  const metadataItems = useMemo(
    () =>
      context.utilityBar.metadata.zones
        .find((zone) => zone.id === "right")
        ?.items.filter((item) => item.visible !== false) ?? [],
    [context.utilityBar.metadata.zones],
  );

  const metadataByAdapterKey = useMemo(
    () => new Map(metadataItems.map((item) => [item.adapterKey, item])),
    [metadataItems],
  );

  const visibleItems = selectVisibleItems(storeItems).filter((item) =>
    metadataByAdapterKey.has(item.id),
  );

  const [dragId, setDragId] = useState<UtilityBarItemId | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  function handleDragStart(id: UtilityBarItemId) {
    setDragId(id);
    setOverIndex(null);
  }

  function handleDragOver(event: DragEvent, index: number) {
    event.preventDefault();
    setOverIndex(index);
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    if (dragId === null || overIndex === null) {
      setDragId(null);
      setOverIndex(null);
      return;
    }

    const ids = visibleItems.map((item) => item.id);
    const from = ids.indexOf(dragId);
    if (from !== -1) {
      ids.splice(from, 1);
      ids.splice(overIndex, 0, dragId);
      reorderVisibleInRail(ids);
    }

    setDragId(null);
    setOverIndex(null);
  }

  function handleDragEnd() {
    setDragId(null);
    setOverIndex(null);
  }

  return (
    <>
      {visibleItems.map((storeItem, index) => {
        const metadata = metadataForStoreItem(storeItem, metadataByAdapterKey);
        if (!metadata) {
          return null;
        }

        return (
          <DraggableRailItem
            id={storeItem.id}
            index={index}
            isDragging={dragId === storeItem.id}
            isDropTarget={overIndex === index && dragId !== storeItem.id}
            isMobileOverflow={index >= UTILITY_BAR_MOBILE_VISIBLE_ICON_CAP}
            key={storeItem.id}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
          >
            {renderAppShellUtilityRuntimeItem(metadata, context)}
          </DraggableRailItem>
        );
      })}
    </>
  );
}
