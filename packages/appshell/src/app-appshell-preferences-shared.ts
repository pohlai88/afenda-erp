import type {
  AppShellPreferenceSnapshot,
  AppShellPreferenceUpdateInput,
} from "./app-appshell-props-shared";

export function areAppShellPreferenceUpdatesEqual(
  left: AppShellPreferenceUpdateInput,
  right: AppShellPreferenceUpdateInput,
) {
  const leftUtilityOrder = left.utilityOrder ?? [];
  const rightUtilityOrder = right.utilityOrder ?? [];
  const leftCommandRecents = left.commandRecents ?? [];
  const rightCommandRecents = right.commandRecents ?? [];

  return (
    left.railMode === right.railMode &&
    left.density === right.density &&
    leftUtilityOrder.length === rightUtilityOrder.length &&
    leftUtilityOrder.every((value, index) => value === rightUtilityOrder[index]) &&
    leftCommandRecents.length === rightCommandRecents.length &&
    leftCommandRecents.every(
      (value, index) => value === rightCommandRecents[index],
    )
  );
}

export function toAppShellPreferenceUpdate(
  preferences: AppShellPreferenceSnapshot,
): AppShellPreferenceUpdateInput {
  return {
    railMode: preferences.railMode,
    density: preferences.density,
    utilityOrder: [...preferences.utilityOrder],
    commandRecents: [...preferences.commandRecents],
  };
}
