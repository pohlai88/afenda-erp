export function resolveSystemAdminListSearch(
  searchParams:
    | Record<string, string | string[] | undefined>
    | undefined,
  scope: string,
) {
  const key = `${scope}Q`;
  const value = searchParams?.[key];

  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value[0];
  }

  return undefined;
}

export function resolveSystemAdminListStatusFilter(
  searchParams:
    | Record<string, string | string[] | undefined>
    | undefined,
  scope: string,
) {
  const key = `${scope}Status`;
  const value = searchParams?.[key];

  if (typeof value === "string" && value.length > 0) {
    return value;
  }

  if (Array.isArray(value)) {
    return value[0];
  }

  return undefined;
}
