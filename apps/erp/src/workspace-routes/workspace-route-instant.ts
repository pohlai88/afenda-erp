/**
 * Opts workspace routes into Next.js 16 instant-navigation validation.
 * Route segment config must be an inline literal in each page/layout — Next.js
 * cannot analyze `export const unstable_instant = importedValue`.
 * @see https://nextjs.org/docs/app/guides/instant-navigation
 */
export type WorkspaceRouteInstant = {
  readonly prefetch: "static";
};

export const workspaceRouteInstantSegment = {
  prefetch: "static",
} as const satisfies WorkspaceRouteInstant;
