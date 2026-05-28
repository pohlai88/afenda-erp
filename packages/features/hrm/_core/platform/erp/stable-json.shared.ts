/**
 * Stable JSON utilities — deterministic serialization for audit/diff purposes.
 */

/**
 * Returns a JSON string with keys sorted recursively, so structurally identical
 * objects always produce the same serialized form.
 */
export function stableJson(value: unknown): string {
  return JSON.stringify(value, (_, v) => {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      return Object.keys(v)
        .sort()
        .reduce<Record<string, unknown>>((acc, k) => {
          acc[k] = (v as Record<string, unknown>)[k]
          return acc
        }, {})
    }
    return v
  })
}

/**
 * Returns true when `a` and `b` have identical stable JSON representations.
 */
export function stableJsonEqual(a: unknown, b: unknown): boolean {
  return stableJson(a) === stableJson(b)
}
