import { beforeEach, describe, expect, it } from "vitest";

import {
  enforceVisibleUtilityCap,
  selectAllItemsOrdered,
  selectVisibleItems,
  useUtilityBarStore,
} from "../src/app-utility-bar-store";

describe("utility bar store", () => {
  beforeEach(() => {
    useUtilityBarStore.getState().reset();
  });

  it("defaults to six visible right-rail utilities", () => {
    expect(selectVisibleItems(useUtilityBarStore.getState().items)).toHaveLength(6);
  });

  it("blocks enabling a seventh visible utility", () => {
    useUtilityBarStore.getState().toggleItem("system-admin");
    expect(selectVisibleItems(useUtilityBarStore.getState().items)).toHaveLength(6);
  });

  it("reorders visible rail items without dropping hidden order", () => {
    useUtilityBarStore.getState().reorderVisibleInRail([
      "feedback",
      "quick-create",
      "notifications",
      "messenger",
      "coordination",
      "lynx",
    ]);

    expect(selectVisibleItems(useUtilityBarStore.getState().items).map((item) => item.id)).toEqual([
      "feedback",
      "quick-create",
      "notifications",
      "messenger",
      "coordination",
      "lynx",
    ]);
  });

  it("enforces the visible cap after hydration", () => {
    const items = useUtilityBarStore.getState().items.map((item) => ({
      ...item,
      visible: true,
    }));

    const capped = enforceVisibleUtilityCap(items);
    expect(selectVisibleItems(capped)).toHaveLength(6);
  });

  it("hydrates server order while preserving visibility", () => {
    useUtilityBarStore.getState().hydrateOrderFromPreference([
      "lynx",
      "feedback",
      "quick-create",
      "notifications",
      "messenger",
      "coordination",
      "system-admin",
    ]);

    expect(selectAllItemsOrdered(useUtilityBarStore.getState().items).map((item) => item.id)).toEqual([
      "lynx",
      "feedback",
      "quick-create",
      "notifications",
      "messenger",
      "coordination",
      "system-admin",
      "help",
      "settings",
      "density",
      "shortcuts",
      "connectivity",
      "storage",
      "upload",
      "screenshot",
      "diagnosis",
    ]);
  });
});
