/**
 * App-level search param helpers — isomorphic.
 */

/**
 * Reads a string search param safely, returning undefined when absent or empty.
 */
export function getStringSearchParam(
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  if (searchParams instanceof URLSearchParams) {
    return searchParams.get(key) ?? undefined
  }
  const v = searchParams[key]
  return typeof v === "string" ? v : Array.isArray(v) ? v[0] : undefined
}

/**
 * Reads a numeric search param safely, returning undefined when absent or invalid.
 */
export function getNumberSearchParam(
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>,
  key: string,
): number | undefined {
  const raw = getStringSearchParam(searchParams, key)
  if (!raw) return undefined
  const n = Number(raw)
  return isNaN(n) ? undefined : n
}
