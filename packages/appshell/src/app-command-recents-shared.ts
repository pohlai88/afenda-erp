export const APP_SHELL_COMMAND_RECENTS_LIMIT = 16;

export function normalizeCommandRecentIds(
  ids: readonly string[],
  limit = APP_SHELL_COMMAND_RECENTS_LIMIT,
) {
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const rawId of ids) {
    const id = rawId.trim();
    if (!id || seen.has(id)) {
      continue;
    }

    seen.add(id);
    normalized.push(id);

    if (normalized.length >= limit) {
      break;
    }
  }

  return normalized;
}
