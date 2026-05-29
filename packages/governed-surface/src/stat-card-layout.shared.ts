import type { StatCardDensity } from "./schemas/stat-card.schema";

/** Shared stat-card grid geometry — keep skeletons and renderers in sync. */
export const GOVERNED_STAT_GRID_CLASS: Record<StatCardDensity, string> = {
  comfortable: "grid grid-cols-1 gap-3 @sm:grid-cols-2 @2xl:grid-cols-4",
  compact: "grid grid-cols-1 gap-2 @sm:grid-cols-2 @2xl:grid-cols-4",
};

/** Approximate compact stat-tile height to reduce CLS when streaming replaces skeletons. */
export const GOVERNED_STAT_TILE_SKELETON_CLASS = "min-h-28 w-full rounded-card";
