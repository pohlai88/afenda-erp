import {
  hrRecordsAssignmentsSearchParam,
  hrRecordsAssignmentsSurfaceKey,
} from "./hr.workforce.records-assignments-list.surface";
import {
  hrRecordsAuditTrailSearchParam,
  hrRecordsAuditTrailSurfaceKey,
} from "./hr.workforce.records-audit-trail-list.surface";
import {
  hrRecordsDirectorySearchParam,
  hrRecordsDirectorySurfaceKey,
  hrRecordsEmploymentStatusFilterParam,
} from "./hr.workforce.records-directory-list.surface";
import {
  hrRecordsDocumentReferencesSearchParam,
  hrRecordsDocumentReferencesSurfaceKey,
} from "./hr.workforce.records-document-references-list.surface";
import {
  hrRecordsIncompleteSearchParam,
  hrRecordsIncompleteSurfaceKey,
} from "./hr.workforce.records-incomplete-list.surface";
import {
  hrRecordsSeparatedSearchParam,
  hrRecordsSeparatedSurfaceKey,
} from "./hr.workforce.records-separated-list.surface";
import {
  hrRecordsStatusHistorySearchParam,
  hrRecordsStatusHistorySurfaceKey,
} from "./hr.workforce.records-status-history-list.surface";
import {
  hrRecordsAssignmentsColumnsId,
  hrRecordsAuditTrailColumnsId,
  hrRecordsDirectoryColumnsId,
  hrRecordsDocumentReferencesColumnsId,
  hrRecordsIncompleteColumnsId,
  hrRecordsSeparatedColumnsId,
  hrRecordsStatusHistoryColumnsId,
} from "./hr.workforce.records-surface-columns.shared";

/** Canonical Pattern C list surface keys (ARCH-1003 registry). */
export const HR_RECORDS_LIST_SURFACE_KEYS = [
  hrRecordsIncompleteSurfaceKey,
  hrRecordsDirectorySurfaceKey,
  hrRecordsAssignmentsSurfaceKey,
  hrRecordsAuditTrailSurfaceKey,
  hrRecordsStatusHistorySurfaceKey,
  hrRecordsDocumentReferencesSurfaceKey,
  hrRecordsSeparatedSurfaceKey,
] as const;

export type HrRecordsListSurfaceKey =
  (typeof HR_RECORDS_LIST_SURFACE_KEYS)[number];

export function getHrRecordsListSurfaceKeys(): readonly HrRecordsListSurfaceKey[] {
  return HR_RECORDS_LIST_SURFACE_KEYS;
}

export const HR_RECORDS_LIST_SURFACE_COLUMNS_BY_KEY = {
  [hrRecordsIncompleteSurfaceKey]: hrRecordsIncompleteColumnsId,
  [hrRecordsDirectorySurfaceKey]: hrRecordsDirectoryColumnsId,
  [hrRecordsAssignmentsSurfaceKey]: hrRecordsAssignmentsColumnsId,
  [hrRecordsAuditTrailSurfaceKey]: hrRecordsAuditTrailColumnsId,
  [hrRecordsStatusHistorySurfaceKey]: hrRecordsStatusHistoryColumnsId,
  [hrRecordsDocumentReferencesSurfaceKey]: hrRecordsDocumentReferencesColumnsId,
  [hrRecordsSeparatedSurfaceKey]: hrRecordsSeparatedColumnsId,
} as const;

export const HR_RECORDS_LIST_SEARCH_PARAMS_BY_KEY = {
  [hrRecordsIncompleteSurfaceKey]: hrRecordsIncompleteSearchParam,
  [hrRecordsDirectorySurfaceKey]: hrRecordsDirectorySearchParam,
  [hrRecordsAssignmentsSurfaceKey]: hrRecordsAssignmentsSearchParam,
  [hrRecordsAuditTrailSurfaceKey]: hrRecordsAuditTrailSearchParam,
  [hrRecordsStatusHistorySurfaceKey]: hrRecordsStatusHistorySearchParam,
  [hrRecordsDocumentReferencesSurfaceKey]: hrRecordsDocumentReferencesSearchParam,
  [hrRecordsSeparatedSurfaceKey]: hrRecordsSeparatedSearchParam,
} as const;

export const HR_RECORDS_LIST_SEARCH_PARAM_MODEL_FIELDS = {
  [hrRecordsIncompleteSearchParam]: "incompleteSearch",
  [hrRecordsDirectorySearchParam]: "directorySearch",
  [hrRecordsAssignmentsSearchParam]: "assignmentsSearch",
  [hrRecordsAuditTrailSearchParam]: "auditTrailSearch",
  [hrRecordsStatusHistorySearchParam]: "statusHistorySearch",
  [hrRecordsDocumentReferencesSearchParam]: "documentReferencesSearch",
  [hrRecordsSeparatedSearchParam]: "separatedSearch",
  [hrRecordsEmploymentStatusFilterParam]: "employmentStatusFilter",
} as const;

export const HR_RECORDS_WORKBENCH_READ_ONLY_SURFACE_KEYS = new Set<
  HrRecordsListSurfaceKey
>([
  hrRecordsAssignmentsSurfaceKey,
  hrRecordsAuditTrailSurfaceKey,
  hrRecordsStatusHistorySurfaceKey,
  hrRecordsDocumentReferencesSurfaceKey,
]);
