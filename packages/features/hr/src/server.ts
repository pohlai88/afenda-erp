import "@afenda/kernel/server";

/**
 * Server-only exports for @afenda/feature-hr.
 * Query/command services export here as TRACK-004 slices land.
 */
export * from "./metadata";
export * from "./contracts";
export * from "./workforce/server";
export * from "./time-attendance/server";
