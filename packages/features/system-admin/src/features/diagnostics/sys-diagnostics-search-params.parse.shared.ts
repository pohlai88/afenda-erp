import { systemAdminDiagnosticsSearchParamsSchema } from "./sys-diagnostics-filter.schema";

function readSearchParam(
  searchParams: Record<string, string | string[] | undefined> | undefined,
  key: string,
) {
  const value = searchParams?.[key];

  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value[0];
  }

  return undefined;
}

export function parseSystemAdminDiagnosticsSearchParams(
  searchParams?: Record<string, string | string[] | undefined>,
) {
  return systemAdminDiagnosticsSearchParamsSchema.parse({
    diagnosticsCategory: readSearchParam(searchParams, "diagnosticsCategory"),
  });
}
