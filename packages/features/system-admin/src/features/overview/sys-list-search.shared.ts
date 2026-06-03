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

export function resolveSystemAdminApprovalDetailKey(
  searchParams:
    | Record<string, string | string[] | undefined>
    | undefined,
) {
  const value = searchParams?.approvalsKey;

  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }

  if (Array.isArray(value)) {
    const first = value[0];
    return typeof first === "string" && first.trim().length > 0
      ? first.trim()
      : undefined;
  }

  return undefined;
}

export function resolveSystemAdminPolicyDetailKey(
  searchParams:
    | Record<string, string | string[] | undefined>
    | undefined,
) {
  const value = searchParams?.policiesKey;

  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }

  if (Array.isArray(value)) {
    const first = value[0];
    return typeof first === "string" && first.trim().length > 0
      ? first.trim()
      : undefined;
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
