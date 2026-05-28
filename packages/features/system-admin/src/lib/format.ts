export function formatSystemAdminDateTime(
  value: Date | string | null | undefined,
  fallback = "Not recorded",
) {
  if (!value) {
    return fallback;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return fallback;
  }

  return `${date.toISOString().slice(0, 19).replace("T", " ")} UTC`;
}
