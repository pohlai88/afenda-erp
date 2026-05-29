export function formatSuccessionDateOnly(
  value: Date | string | null | undefined
): string | null {
  if (!value) return null
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10)
  }
  return value
}

export function parseSuccessionDateOnly(value: string | null): Date | null {
  if (!value) return null
  return new Date(`${value}T00:00:00.000Z`)
}
