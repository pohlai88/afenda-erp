import {
  systemAdminAuditSearchParamsSchema,
  type SystemAdminAuditSearchParams,
} from "./sys-audit-filter.schema";

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

export function parseSystemAdminAuditSearchParams(
  searchParams?: Record<string, string | string[] | undefined>,
): SystemAdminAuditSearchParams {
  return systemAdminAuditSearchParamsSchema.parse({
    auditQ: readSearchParam(searchParams, "auditQ"),
    auditActor: readSearchParam(searchParams, "auditActor"),
    auditAction: readSearchParam(searchParams, "auditAction"),
    auditTargetType: readSearchParam(searchParams, "auditTargetType"),
    auditTargetId: readSearchParam(searchParams, "auditTargetId"),
    auditModule: readSearchParam(searchParams, "auditModule"),
    auditOutcome: readSearchParam(searchParams, "auditOutcome"),
    auditFrom: readSearchParam(searchParams, "auditFrom"),
    auditTo: readSearchParam(searchParams, "auditTo"),
    auditSort: readSearchParam(searchParams, "auditSort"),
    auditPage: readSearchParam(searchParams, "auditPage"),
    auditPageSize: readSearchParam(searchParams, "auditPageSize"),
    auditId: readSearchParam(searchParams, "auditId"),
  });
}
