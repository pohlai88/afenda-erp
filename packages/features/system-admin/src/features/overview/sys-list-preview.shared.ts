export const SYSTEM_ADMIN_LIST_PREVIEW_LIMIT = 12;

export function formatSystemAdminListPreview(
  values: readonly string[],
  input?: {
    limit?: number;
    emptyLabel?: string;
  },
): string {
  const limit = input?.limit ?? SYSTEM_ADMIN_LIST_PREVIEW_LIMIT;
  const emptyLabel = input?.emptyLabel ?? "None";

  if (values.length === 0) {
    return emptyLabel;
  }

  const visible = values.slice(0, limit);
  const remainder = values.length - visible.length;
  const joined = visible.join(", ");

  return remainder > 0 ? `${joined} (+${remainder} more)` : joined;
}
