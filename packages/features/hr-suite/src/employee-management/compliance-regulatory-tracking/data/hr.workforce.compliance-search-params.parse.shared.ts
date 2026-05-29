import { hrComplianceExceptionSearchParam } from "../surface/hr.workforce.compliance-exceptions-list.surface";
import { hrComplianceLaborLawSearchParam } from "../surface/hr.workforce.compliance-labor-law-requirements-list.surface";
import { hrComplianceObligationSearchParam } from "../surface/hr.workforce.compliance-obligations-list.surface";

export {
  hrComplianceExceptionSearchParam,
  hrComplianceLaborLawSearchParam,
  hrComplianceObligationSearchParam,
};

function readSearchParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const value = searchParams[key];
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  if (Array.isArray(value)) {
    const first = value.find((entry) => entry.trim().length > 0);
    return first?.trim();
  }
  return undefined;
}

export type HrComplianceSearchParams = {
  obligationSearch?: string;
  exceptionSearch?: string;
  laborLawSearch?: string;
};

export function parseHrComplianceSearchParams(
  searchParams: Record<string, string | string[] | undefined> | undefined,
): HrComplianceSearchParams {
  if (!searchParams) {
    return {};
  }

  const legacySearch = readSearchParam(searchParams, "complianceSearch");
  const obligationSearch =
    readSearchParam(searchParams, hrComplianceObligationSearchParam) ??
    legacySearch;
  const exceptionSearch =
    readSearchParam(searchParams, hrComplianceExceptionSearchParam) ??
    legacySearch;
  const laborLawSearch =
    readSearchParam(searchParams, hrComplianceLaborLawSearchParam) ??
    legacySearch;

  return { obligationSearch, exceptionSearch, laborLawSearch };
}
