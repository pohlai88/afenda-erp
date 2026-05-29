import { clampHrPageSize } from "../../../contracts/pagination";
import type { HrComplianceExceptionRow } from "../contracts/hr-compliance.contract";
import {
  listHrComplianceExceptions,
  listHrComplianceObligations,
} from "./hr-compliance.query.server";

export async function buildHrCompliancePageModel(input: {
  organizationId: string;
  searchParams?: Record<string, string | string[] | undefined>;
  limit?: number;
}) {
  const obligationsSearch =
    typeof input.searchParams?.obligationsQ === "string"
      ? input.searchParams.obligationsQ
      : undefined;
  const exceptionsSearch =
    typeof input.searchParams?.exceptionsQ === "string"
      ? input.searchParams.exceptionsQ
      : undefined;
  const exceptionStatus =
    typeof input.searchParams?.exceptionStatus === "string"
      ? (input.searchParams.exceptionStatus as HrComplianceExceptionRow["status"])
      : undefined;

  const pageSize = clampHrPageSize(input.limit ?? 25);

  const [obligationsWindow, exceptionsWindow] = await Promise.all([
    listHrComplianceObligations({
      organizationId: input.organizationId,
      limit: pageSize,
      search: obligationsSearch,
      status: "active",
    }),
    listHrComplianceExceptions({
      organizationId: input.organizationId,
      limit: pageSize,
      search: exceptionsSearch,
      status: exceptionStatus,
      openOnly: exceptionStatus ? false : true,
    }),
  ]);

  return {
    obligationsWindow,
    exceptionsWindow,
    obligationsSearch,
    exceptionsSearch,
    exceptionStatus,
  };
}
