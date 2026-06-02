/**
 * Opts workspace routes into Next.js 16 instant-navigation validation.
 * Route segment config must be an inline literal in each page/layout — Next.js
 * cannot analyze `export const unstable_instant = importedValue` or `satisfies`.
 * While slices add `prefetch: "runtime"` samples, use `unstable_disableValidation: true`.
 * @see https://nextjs.org/docs/app/guides/instant-navigation
 */
export type WorkspaceRouteInstant = {
  readonly prefetch: "static";
};

/** Reference shape only — do not re-export from route files (Next.js static analysis). */
export const workspaceRouteInstantSegment = {
  prefetch: "static",
} as const satisfies WorkspaceRouteInstant;
