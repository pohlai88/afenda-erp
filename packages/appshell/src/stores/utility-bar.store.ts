"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  RIGHT_UTILITY_BAR_CATALOG,
  UTILITY_BAR_MAX_VISIBLE,
  type UtilityBarItemId,
} from "../app-shell/top-utils-bar/metadata/utility-bar-items.shared";

export type UtilityBarItemState = {
  id: UtilityBarItemId;
  visible: boolean;
  order: number;
};

type UtilityBarState = {
  items: UtilityBarItemState[];
};

type UtilityBarActions = {
  toggleItem: (id: UtilityBarItemId) => void;
  reorderFullCatalog: (orderedIds: UtilityBarItemId[]) => void;
  reorderVisibleInRail: (newVisibleOrder: UtilityBarItemId[]) => void;
  reset: () => void;
  hydrateOrderFromPreference: (orderedIds: readonly string[]) => void;
};

export type UtilityBarStore = UtilityBarState & UtilityBarActions;

const INITIAL_ITEMS: UtilityBarItemState[] = RIGHT_UTILITY_BAR_CATALOG.map((def) => ({
  id: def.id,
  visible: def.defaultVisible,
  order: def.defaultOrder,
}));

const UTILITY_BAR_VISIBLE_ICON_CAP = UTILITY_BAR_MAX_VISIBLE - 1;

const CATALOG_IDS: UtilityBarItemId[] = RIGHT_UTILITY_BAR_CATALOG.map((def) => def.id);

function countVisible(items: UtilityBarItemState[]) {
  return items.filter((item) => item.visible).length;
}

export function enforceVisibleUtilityCap(items: UtilityBarItemState[]) {
  const allowedVisibleIds = new Set(
    [...items]
      .filter((item) => item.visible)
      .sort((left, right) => left.order - right.order)
      .slice(0, UTILITY_BAR_VISIBLE_ICON_CAP)
      .map((item) => item.id),
  );

  return items.map((item) =>
    item.visible && !allowedVisibleIds.has(item.id)
      ? { ...item, visible: false }
      : item,
  );
}

function isCompleteCatalogPermutation(orderedIds: UtilityBarItemId[]) {
  if (orderedIds.length !== CATALOG_IDS.length) {
    return false;
  }

  const seen = new Set(orderedIds);
  return CATALOG_IDS.every((id) => seen.has(id));
}

function mergeCatalogWithPersistedItems(persisted: unknown[]): UtilityBarItemState[] {
  const prevById = new Map(
    persisted
      .filter((row): row is UtilityBarItemState => {
        if (!row || typeof row !== "object") {
          return false;
        }

        const record = row as Record<string, unknown>;
        return (
          typeof record.id === "string" &&
          typeof record.visible === "boolean" &&
          typeof record.order === "number"
        );
      })
      .map((row) => [row.id, row]),
  );

  return RIGHT_UTILITY_BAR_CATALOG.map((def) => {
    const prev = prevById.get(def.id);
    if (prev) {
      return {
        id: def.id,
        visible: prev.visible,
        order: prev.order,
      };
    }

    return {
      id: def.id,
      visible: def.defaultVisible,
      order: def.defaultOrder,
    };
  });
}

function normalizeOrders(items: UtilityBarItemState[]) {
  const sorted = [...items].sort((left, right) => left.order - right.order);
  return sorted.map((item, index) => ({ ...item, order: index }));
}

function mergeVisibleSequenceIntoGlobalOrder(
  items: UtilityBarItemState[],
  newVisibleOrder: UtilityBarItemId[],
) {
  const sorted = [...items].sort((left, right) => left.order - right.order);
  const mergedIds: UtilityBarItemId[] = [];
  let inserted = false;

  for (const row of sorted) {
    if (!row.visible) {
      mergedIds.push(row.id);
      continue;
    }

    if (!inserted) {
      mergedIds.push(...newVisibleOrder);
      inserted = true;
    }
  }

  return mergedIds;
}

export const useUtilityBarStore = create<UtilityBarStore>()(
  persist(
    (set, get) => ({
      items: INITIAL_ITEMS,

      toggleItem: (id) => {
        const items = get().items;
        const target = items.find((item) => item.id === id);
        if (!target) {
          return;
        }

        if (!target.visible && countVisible(items) >= UTILITY_BAR_VISIBLE_ICON_CAP) {
          return;
        }

        set({
          items: items.map((item) =>
            item.id === id ? { ...item, visible: !item.visible } : item,
          ),
        });
      },

      reorderFullCatalog: (orderedIds) => {
        if (!isCompleteCatalogPermutation(orderedIds)) {
          return;
        }

        const items = get().items;
        set({
          items: items.map((item) => ({
            ...item,
            order: orderedIds.indexOf(item.id),
          })),
        });
      },

      reorderVisibleInRail: (newVisibleOrder) => {
        const items = get().items;
        const visibleIds = items.filter((item) => item.visible).map((item) => item.id);
        if (visibleIds.length === 0) {
          return;
        }

        const nextSet = new Set(newVisibleOrder);
        if (
          newVisibleOrder.length !== visibleIds.length ||
          visibleIds.some((id) => !nextSet.has(id)) ||
          newVisibleOrder.some((id) => !visibleIds.includes(id))
        ) {
          return;
        }

        const mergedIds = mergeVisibleSequenceIntoGlobalOrder(items, newVisibleOrder);
        set({
          items: items.map((item) => ({
            ...item,
            order: mergedIds.indexOf(item.id),
          })),
        });
      },

      reset: () => set({ items: INITIAL_ITEMS }),

      hydrateOrderFromPreference: (orderedIds) => {
        const preferred = orderedIds.filter((id): id is UtilityBarItemId =>
          CATALOG_IDS.includes(id as UtilityBarItemId),
        );
        const orderedSet = new Set(preferred);
        const mergedIds = [
          ...preferred,
          ...CATALOG_IDS.filter((id) => !orderedSet.has(id)),
        ];
        const items = get().items.map((item) => ({
          ...item,
          order: mergedIds.indexOf(item.id),
        }));

        set({
          items: enforceVisibleUtilityCap(items),
        });
      },
    }),
    {
      name: "afenda-utility-bar-v2",
      partialize: (state) => ({ items: state.items }),
      merge: (persistedState, currentState) => {
        const base = currentState as UtilityBarStore;
        let raw: unknown[] | undefined;

        if (persistedState && typeof persistedState === "object") {
          const record = persistedState as Record<string, unknown>;
          if (Array.isArray(record.items)) {
            raw = record.items as unknown[];
          } else if (
            record.state &&
            typeof record.state === "object" &&
            Array.isArray((record.state as { items?: unknown }).items)
          ) {
            raw = (record.state as { items: unknown[] }).items;
          }
        }

        if (raw) {
          const merged = enforceVisibleUtilityCap(
            normalizeOrders(mergeCatalogWithPersistedItems(raw)),
          );
          return { ...base, items: merged };
        }

        return base;
      },
    },
  ),
);

export function selectVisibleItems(items: UtilityBarItemState[]) {
  return items.filter((item) => item.visible).sort((left, right) => left.order - right.order);
}

export function selectAllItemsOrdered(items: UtilityBarItemState[]) {
  return [...items].sort((left, right) => left.order - right.order);
}
