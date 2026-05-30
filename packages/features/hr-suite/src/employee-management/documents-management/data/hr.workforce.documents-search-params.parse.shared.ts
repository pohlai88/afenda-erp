import {
  HR_DOCUMENTS_LIST_SEARCH_PARAM_MODEL_FIELDS,
  HR_DOCUMENTS_LIST_SEARCH_PARAMS_BY_KEY,
  HR_DOCUMENTS_LIST_SURFACE_KEYS,
  hrDocumentsAcknowledgmentsSearchParam,
  hrDocumentsAuditTrailSearchParam,
  hrDocumentsExpiringSearchParam,
  hrDocumentsMissingSearchParam,
  hrDocumentsRepositorySearchParam,
  hrDocumentsRequirementsSearchParam,
  hrDocumentsRetentionSearchParam,
} from "../surface/hr.workforce.documents-surface-metadata.shared";

export {
  HR_DOCUMENTS_LIST_SEARCH_PARAMS_BY_KEY,
  hrDocumentsRepositorySearchParam,
  hrDocumentsRequirementsSearchParam,
  hrDocumentsMissingSearchParam,
  hrDocumentsExpiringSearchParam,
  hrDocumentsRetentionSearchParam,
  hrDocumentsAuditTrailSearchParam,
  hrDocumentsAcknowledgmentsSearchParam,
};

export type HrDocumentsSearchParams = {
  repositorySearch?: string;
  requirementsSearch?: string;
  missingSearch?: string;
  expiringSearch?: string;
  retentionSearch?: string;
  auditTrailSearch?: string;
  acknowledgmentsSearch?: string;
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

export function parseHrDocumentsSearchParams(
  searchParams: Record<string, string | string[] | undefined> | undefined,
): HrDocumentsSearchParams {
  if (!searchParams) {
    return {};
  }

  const parsed: HrDocumentsSearchParams = {};
  for (const surfaceKey of HR_DOCUMENTS_LIST_SURFACE_KEYS) {
    const paramKey = HR_DOCUMENTS_LIST_SEARCH_PARAMS_BY_KEY[surfaceKey];
    const modelField =
      HR_DOCUMENTS_LIST_SEARCH_PARAM_MODEL_FIELDS[
        paramKey as keyof typeof HR_DOCUMENTS_LIST_SEARCH_PARAM_MODEL_FIELDS
      ];
    if (modelField) {
      parsed[modelField as keyof HrDocumentsSearchParams] = readSearchParam(
        searchParams,
        paramKey,
      );
    }
  }
  return parsed;
}

export function toHrDocumentsPageModelInput(input: {
  organizationId: string;
  canWrite: boolean;
  canViewSensitive: boolean;
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  return {
    organizationId: input.organizationId,
    canWrite: input.canWrite,
    canViewSensitive: input.canViewSensitive,
    ...parseHrDocumentsSearchParams(input.searchParams),
  };
}
