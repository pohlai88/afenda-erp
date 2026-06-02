import {
  hrDocumentsAcknowledgmentsSearchParam,
  hrDocumentsAcknowledgmentsSurfaceKey,
} from "./hr.workforce.documents-acknowledgments-list.surface";
import {
  hrDocumentsAuditTrailSearchParam,
  hrDocumentsAuditTrailSurfaceKey,
} from "./hr.workforce.documents-audit-trail-list.surface";
import {
  hrDocumentsExpiringSearchParam,
  hrDocumentsExpiringSurfaceKey,
} from "./hr.workforce.documents-expiring-list.surface";
import {
  hrDocumentsMissingSearchParam,
  hrDocumentsMissingSurfaceKey,
} from "./hr.workforce.documents-missing-list.surface";
import {
  hrDocumentsRepositorySearchParam,
  hrDocumentsRepositorySurfaceKey,
} from "./hr.workforce.documents-repository-list.surface";
import {
  hrDocumentsRequirementsSearchParam,
  hrDocumentsRequirementsSurfaceKey,
} from "./hr.workforce.documents-requirements-list.surface";
import {
  hrDocumentsRetentionSearchParam,
  hrDocumentsRetentionSurfaceKey,
} from "./hr.workforce.documents-retention-list.surface";
import {
  hrDocumentsAcknowledgmentsColumnsId,
  hrDocumentsAuditTrailColumnsId,
  hrDocumentsExpiringColumnsId,
  hrDocumentsMissingColumnsId,
  hrDocumentsRepositoryColumnsId,
  hrDocumentsRequirementsColumnsId,
  hrDocumentsRetentionColumnsId,
} from "./hr.workforce.documents-surface-columns.shared";

/** Canonical Pattern C list surface keys for HR documents (ARCH-1003 registry). */
export const HR_DOCUMENTS_LIST_SURFACE_KEYS = [
  hrDocumentsRepositorySurfaceKey,
  hrDocumentsRequirementsSurfaceKey,
  hrDocumentsMissingSurfaceKey,
  hrDocumentsExpiringSurfaceKey,
  hrDocumentsRetentionSurfaceKey,
  hrDocumentsAuditTrailSurfaceKey,
  hrDocumentsAcknowledgmentsSurfaceKey,
] as const;

export type HrDocumentsListSurfaceKey =
  (typeof HR_DOCUMENTS_LIST_SURFACE_KEYS)[number];

export function getHrDocumentsListSurfaceKeys(): readonly HrDocumentsListSurfaceKey[] {
  return HR_DOCUMENTS_LIST_SURFACE_KEYS;
}

export const HR_DOCUMENTS_LIST_SURFACE_COLUMNS_BY_KEY = {
  [hrDocumentsRepositorySurfaceKey]: hrDocumentsRepositoryColumnsId,
  [hrDocumentsRequirementsSurfaceKey]: hrDocumentsRequirementsColumnsId,
  [hrDocumentsMissingSurfaceKey]: hrDocumentsMissingColumnsId,
  [hrDocumentsExpiringSurfaceKey]: hrDocumentsExpiringColumnsId,
  [hrDocumentsRetentionSurfaceKey]: hrDocumentsRetentionColumnsId,
  [hrDocumentsAuditTrailSurfaceKey]: hrDocumentsAuditTrailColumnsId,
  [hrDocumentsAcknowledgmentsSurfaceKey]: hrDocumentsAcknowledgmentsColumnsId,
} as const;

export const HR_DOCUMENTS_LIST_SEARCH_PARAMS_BY_KEY = {
  [hrDocumentsRepositorySurfaceKey]: hrDocumentsRepositorySearchParam,
  [hrDocumentsRequirementsSurfaceKey]: hrDocumentsRequirementsSearchParam,
  [hrDocumentsMissingSurfaceKey]: hrDocumentsMissingSearchParam,
  [hrDocumentsExpiringSurfaceKey]: hrDocumentsExpiringSearchParam,
  [hrDocumentsRetentionSurfaceKey]: hrDocumentsRetentionSearchParam,
  [hrDocumentsAuditTrailSurfaceKey]: hrDocumentsAuditTrailSearchParam,
  [hrDocumentsAcknowledgmentsSurfaceKey]: hrDocumentsAcknowledgmentsSearchParam,
} as const;

export const HR_DOCUMENTS_LIST_SEARCH_PARAM_MODEL_FIELDS = {
  [hrDocumentsRepositorySearchParam]: "repositorySearch",
  [hrDocumentsRequirementsSearchParam]: "requirementsSearch",
  [hrDocumentsMissingSearchParam]: "missingSearch",
  [hrDocumentsExpiringSearchParam]: "expiringSearch",
  [hrDocumentsRetentionSearchParam]: "retentionSearch",
  [hrDocumentsAuditTrailSearchParam]: "auditTrailSearch",
  [hrDocumentsAcknowledgmentsSearchParam]: "acknowledgmentsSearch",
} as const satisfies Record<
  (typeof HR_DOCUMENTS_LIST_SEARCH_PARAMS_BY_KEY)[HrDocumentsListSurfaceKey],
  string
>;

export const HR_DOCUMENTS_WORKBENCH_READ_ONLY_SURFACE_KEYS = new Set<
  HrDocumentsListSurfaceKey
>([
  hrDocumentsMissingSurfaceKey,
  hrDocumentsExpiringSurfaceKey,
  hrDocumentsAuditTrailSurfaceKey,
]);

export {
  hrDocumentsAcknowledgmentsSearchParam,
  hrDocumentsAcknowledgmentsSurfaceKey,
  hrDocumentsAuditTrailSearchParam,
  hrDocumentsAuditTrailSurfaceKey,
  hrDocumentsExpiringSearchParam,
  hrDocumentsExpiringSurfaceKey,
  hrDocumentsMissingSearchParam,
  hrDocumentsMissingSurfaceKey,
  hrDocumentsRepositorySearchParam,
  hrDocumentsRepositorySurfaceKey,
  hrDocumentsRequirementsSearchParam,
  hrDocumentsRequirementsSurfaceKey,
  hrDocumentsRetentionSearchParam,
  hrDocumentsRetentionSurfaceKey,
};
