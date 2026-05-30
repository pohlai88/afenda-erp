import type { EmptyState } from "@afenda/governed-surface/schemas";

export function buildOrgEmbeddedListLoadError(sectionTitle: string): EmptyState {
  return {
    variant: "error",
    title: `${sectionTitle} unavailable`,
    description:
      "This register could not be loaded. Refresh the page or try again later.",
  };
}

export async function settleOrgListLoad<T>(input: {
  sectionTitle: string;
  load: () => Promise<T>;
}): Promise<{ value?: T; loadError?: EmptyState }> {
  try {
    return { value: await input.load() };
  } catch {
    return {
      loadError: buildOrgEmbeddedListLoadError(input.sectionTitle),
    };
  }
}
