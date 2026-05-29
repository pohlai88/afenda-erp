import type { EmptyState } from "@afenda/governed-surface"

export type EngagementLoadError = {
  title: string
  description?: string
  variant?: EmptyState["variant"]
}

export function toEngagementListLoadError(
  loadError: EngagementLoadError | undefined
): EmptyState | undefined {
  if (!loadError) return undefined
  return {
    variant: loadError.variant ?? "error",
    title: loadError.title,
    description: loadError.description,
  }
}
