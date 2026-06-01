import { z } from "zod";

import {
  readHrSuiteSearchParam,
  type HrSuiteSearchParamSource,
} from "../../../hr-suite-integration/metadata";
import {
  __CONSTANT_PREFIX___REPORT_GROUP_BY,
  __CONSTANT_PREFIX___STATUS_FILTERS,
  type __IDENTIFIER__ReportGroupBy,
  type __IDENTIFIER__StatusFilter,
} from "../schemas/__DOMAIN_KEY__-constants.shared";

export const __IDENTIFIER_CAMEL__ReportGroupByParam =
  "__IDENTIFIER_CAMEL__ReportGroupBy";
export const __IDENTIFIER_CAMEL__StatusParam = "__IDENTIFIER_CAMEL__Status";

export type __IDENTIFIER__SearchParams = {
  readonly workbenchSearch?: string;
  readonly auditTrailSearch?: string;
  readonly reportGroupBy: __IDENTIFIER__ReportGroupBy;
  readonly status: __IDENTIFIER__StatusFilter;
};

export type __IDENTIFIER__PageModelInput = {
  readonly organizationId: string;
  readonly canReadAudit: boolean;
} & __IDENTIFIER__SearchParams;

const reportGroupBySchema = z
  .enum(__CONSTANT_PREFIX___REPORT_GROUP_BY)
  .catch("status");
const statusFilterSchema = z
  .enum(__CONSTANT_PREFIX___STATUS_FILTERS)
  .catch("all");

function readOptionalSearch(
  searchParams: HrSuiteSearchParamSource | undefined,
  key: string,
) {
  return readHrSuiteSearchParam(searchParams, key) || undefined;
}

function is__IDENTIFIER__SearchParams(
  value: unknown,
): value is __IDENTIFIER__SearchParams {
  return (
    typeof value === "object" &&
    value !== null &&
    "reportGroupBy" in value &&
    "status" in value
  );
}

export function parse__IDENTIFIER__SearchParams(
  searchParams?: HrSuiteSearchParamSource,
): __IDENTIFIER__SearchParams {
  return {
    workbenchSearch: readOptionalSearch(searchParams, "__SEARCH_PARAM__"),
    auditTrailSearch: readOptionalSearch(
      searchParams,
      "__IDENTIFIER_CAMEL__AuditTrailSearch",
    ),
    reportGroupBy: reportGroupBySchema.parse(
      readHrSuiteSearchParam(searchParams, __IDENTIFIER_CAMEL__ReportGroupByParam),
    ),
    status: statusFilterSchema.parse(
      readHrSuiteSearchParam(searchParams, __IDENTIFIER_CAMEL__StatusParam),
    ),
  };
}

export function to__IDENTIFIER__PageModelInput(input: {
  readonly organizationId: string;
  readonly canReadAudit?: boolean;
  readonly searchParams?: HrSuiteSearchParamSource | __IDENTIFIER__SearchParams;
}): __IDENTIFIER__PageModelInput {
  const parsed: __IDENTIFIER__SearchParams = is__IDENTIFIER__SearchParams(
    input.searchParams,
  )
    ? input.searchParams
    : parse__IDENTIFIER__SearchParams(input.searchParams);

  return {
    organizationId: input.organizationId,
    canReadAudit: input.canReadAudit ?? false,
    ...parsed,
  };
}
