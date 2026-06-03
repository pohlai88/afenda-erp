import type { EmptyState } from "@afenda/governed-surface/schemas";

export function buildCareerPathingEmbeddedListSurfaceErrorConfiguration(input: {
  sectionTitle: string;
}): EmptyState {
  return {
    variant: "error",
    title: `${input.sectionTitle} unavailable`,
    description: "Could not load this section right now.",
  };
}

export async function settleCareerPathingListLoad<T>(input: {
  sectionTitle: string;
  load: () => Promise<T>;
}): Promise<
  { data: T; loadError?: undefined } | { data?: undefined; loadError: EmptyState }
> {
  try {
    const data = await input.load();
    return { data };
  } catch {
    return {
      loadError: buildCareerPathingEmbeddedListSurfaceErrorConfiguration({
        sectionTitle: input.sectionTitle,
      }),
    };
  }
}
