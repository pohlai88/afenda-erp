import type { EmptyState } from "@afenda/governed-surface/schemas";

export async function settleHrLamListLoad<T>(input: {
  sectionTitle: string;
  load: () => Promise<T>;
}): Promise<{ data: T; loadError?: undefined } | { data?: undefined; loadError: EmptyState }> {
  try {
    const data = await input.load();
    return { data };
  } catch {
    return {
      loadError: {
        variant: "error",
        title: `${input.sectionTitle} unavailable`,
        description: "Could not load this list right now.",
      },
    };
  }
}
