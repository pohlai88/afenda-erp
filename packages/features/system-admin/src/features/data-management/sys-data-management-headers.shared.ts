export function findMissingCsvHeaders(
  actualHeaders: readonly string[],
  requiredHeaders: readonly string[],
): string[] {
  const actual = new Set(actualHeaders.map((header) => header.toLowerCase()));
  return requiredHeaders.filter((header) => !actual.has(header.toLowerCase()));
}
