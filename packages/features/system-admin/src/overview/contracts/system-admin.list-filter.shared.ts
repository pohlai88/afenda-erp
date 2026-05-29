export function filterSystemAdminListRows<TRow extends Record<string, unknown>>(
  rows: readonly TRow[],
  searchValue: string | undefined,
  fields: readonly (keyof TRow)[],
) {
  const needle = searchValue?.trim().toLowerCase();
  if (!needle) {
    return rows;
  }

  return rows.filter((row) =>
    fields.some((field) => {
      const value = row[field];
      return (
        typeof value === "string" && value.toLowerCase().includes(needle)
      );
    }),
  );
}
