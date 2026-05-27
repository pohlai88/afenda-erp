import { GovernedEmpty } from "../../client"
import { parseEmptyStateData } from "../../schemas/list-surface.schema"

/**
 * governed:empty — standalone empty / error / forbidden state.
 */
export function EmptyRenderer({ configuration }: { configuration: unknown }) {
  const parsed = parseEmptyStateData(configuration)
  if (!parsed.success) {
    return null
  }
  return <GovernedEmpty model={parsed.data} />
}
