import {
  listHrDocumentAcknowledgmentsWindow,
  listHrDocumentAuditTrailWindow,
  listHrDocumentMissingMandatoryWindow,
  listHrDocumentRequirements,
  listHrDocumentRetentionPolicies,
  listHrEmployeeDirectoryWindow,
  listHrEmployeeDocumentsWindow,
  loadHrDocumentsOverviewSnapshot,
  type HrEmployeeDocumentWindow,
} from "@afenda/db";
import type { EmptyState } from "@afenda/governed-surface/schemas";

import {
  buildDocumentsListLoadErrorPlaceholder,
  settleDocumentsListLoad,
} from "./hr.workforce.documents-list-load.shared";
import { deriveHrDocumentExpiryPosture } from "./hr.workforce.documents-status.shared";
import {
  HR_DOCUMENTS_LIST_SURFACE_COLUMNS_BY_KEY,
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
} from "../surface/hr.workforce.documents-surface-metadata.shared";
import { buildHrDocumentsOverviewStatGroups } from "../surface/hr.workforce.documents-overview-stat.surface";
import { buildHrDocumentsRepositoryListSurface } from "../surface/hr.workforce.documents-repository-list.surface";
import {
  buildHrDocumentsRequirementsListSurface,
  type HrDocumentRequirementWindow,
} from "../surface/hr.workforce.documents-requirements-list.surface";
import { buildHrDocumentsMissingListSurface } from "../surface/hr.workforce.documents-missing-list.surface";
import { buildHrDocumentsExpiringListSurface } from "../surface/hr.workforce.documents-expiring-list.surface";
import {
  buildHrDocumentsRetentionListSurface,
  type HrDocumentRetentionPolicyWindow,
} from "../surface/hr.workforce.documents-retention-list.surface";
import {
  buildHrDocumentsAuditTrailListSurface,
  type HrDocumentAuditTrailWindow,
} from "../surface/hr.workforce.documents-audit-trail-list.surface";
import { buildHrDocumentsAcknowledgmentsListSurface } from "../surface/hr.workforce.documents-acknowledgments-list.surface";
import type { HrDocumentAcknowledgmentWindow } from "../surface/hr.workforce.documents-acknowledgments-list.surface";
import { hrDocumentsUiCopy } from "../surface/hr.workforce.documents-ui.copy.shared";

export type HrDocumentsPageModelInput = {
  organizationId: string;
  canWrite: boolean;
  canViewSensitive: boolean;
  repositorySearch?: string;
  requirementsSearch?: string;
  missingSearch?: string;
  expiringSearch?: string;
  retentionSearch?: string;
  auditTrailSearch?: string;
  acknowledgmentsSearch?: string;
};

const DOCUMENTS_EMPLOYEE_PICKER_LIMIT = 200;
const DOCUMENTS_DEFAULT_PAGE_SIZE = 25;

async function loadDocumentsEmployeePickerOptions(organizationId: string) {
  try {
    const directory = await listHrEmployeeDirectoryWindow({
      organizationId,
      limit: DOCUMENTS_EMPLOYEE_PICKER_LIMIT,
    });
    return directory.rows
      .filter((employee) => employee.employmentStatus === "active")
      .map((employee) => ({
        value: employee.id,
        label: `${employee.displayName} (${employee.employeeNumber})`,
      }));
  } catch {
    return [] as Array<{ value: string; label: string }>;
  }
}

async function loadHrDocumentsExpiringWindow(input: {
  organizationId: string;
  search?: string;
  pageSize: number;
}): Promise<HrEmployeeDocumentWindow> {
  const searchToken = input.search?.trim().toLowerCase();

  if (searchToken === "expiring" || searchToken === "expired") {
    return listHrEmployeeDocumentsWindow({
      organizationId: input.organizationId,
      limit: input.pageSize,
      search: searchToken,
      latestOnly: true,
    });
  }

  if (searchToken) {
    const result = await listHrEmployeeDocumentsWindow({
      organizationId: input.organizationId,
      limit: input.pageSize,
      search: input.search,
      latestOnly: true,
    });
    const filtered = result.rows.filter(
      (row) =>
        deriveHrDocumentExpiryPosture({ effectiveTo: row.effectiveTo }) !==
        "current",
    );
    return {
      rows: filtered,
      pageSize: input.pageSize,
      totalCount: filtered.length,
      hasNextPage: false,
    };
  }

  const [expiring, expired] = await Promise.all([
    listHrEmployeeDocumentsWindow({
      organizationId: input.organizationId,
      limit: input.pageSize,
      search: "expiring",
      latestOnly: true,
    }),
    listHrEmployeeDocumentsWindow({
      organizationId: input.organizationId,
      limit: input.pageSize,
      search: "expired",
      latestOnly: true,
    }),
  ]);
  const merged = [...expiring.rows, ...expired.rows].slice(0, input.pageSize);
  const totalCount = expiring.totalCount + expired.totalCount;

  return {
    rows: merged,
    pageSize: input.pageSize,
    totalCount,
    hasNextPage: totalCount > input.pageSize,
  };
}

function filterRequirementsWindow(
  rows: Awaited<ReturnType<typeof listHrDocumentRequirements>>,
  search: string | undefined,
  pageSize: number,
): HrDocumentRequirementWindow {
  const trimmed = search?.trim().toLowerCase();
  const filtered = trimmed
    ? rows.filter(
        (row) =>
          row.documentType.toLowerCase().includes(trimmed) ||
          row.title.toLowerCase().includes(trimmed),
      )
    : rows;

  return {
    rows: filtered.map((row) => ({
      id: row.id,
      documentType: row.documentType,
      title: row.title,
      requiredForStatus: row.requiredForStatus,
      graceDaysBeforeDue: row.graceDaysBeforeDue,
    })),
    pageSize,
    totalCount: filtered.length,
    hasNextPage: false,
  };
}

function filterRetentionWindow(
  rows: Awaited<ReturnType<typeof listHrDocumentRetentionPolicies>>,
  search: string | undefined,
  pageSize: number,
): HrDocumentRetentionPolicyWindow {
  const trimmed = search?.trim().toLowerCase();
  const filtered = trimmed
    ? rows.filter(
        (row) =>
          (row.documentType ?? "").toLowerCase().includes(trimmed) ||
          (row.documentGroup ?? "").toLowerCase().includes(trimmed),
      )
    : rows;

  return {
    rows: filtered.map((row) => ({
      id: row.id,
      documentType: row.documentType,
      documentGroup: row.documentGroup,
      retentionDays: row.retentionDays,
      archiveOnSeparation: row.archiveOnSeparation,
    })),
    pageSize,
    totalCount: filtered.length,
    hasNextPage: false,
  };
}

export type HrDocumentsPageModel = {
  organizationId: string;
  canWrite: boolean;
  canViewSensitive: boolean;
  employeePickerOptions: readonly { value: string; label: string }[];
  overviewStatGroups: ReturnType<typeof buildHrDocumentsOverviewStatGroups>;
  overviewLoadError?: EmptyState;
  repositoryList: ReturnType<typeof buildHrDocumentsRepositoryListSurface>;
  repositoryLoadError?: EmptyState;
  requirementsList: ReturnType<typeof buildHrDocumentsRequirementsListSurface>;
  requirementsLoadError?: EmptyState;
  missingList: ReturnType<typeof buildHrDocumentsMissingListSurface>;
  missingLoadError?: EmptyState;
  expiringList: ReturnType<typeof buildHrDocumentsExpiringListSurface>;
  expiringLoadError?: EmptyState;
  retentionList: ReturnType<typeof buildHrDocumentsRetentionListSurface>;
  retentionLoadError?: EmptyState;
  auditTrailList: ReturnType<typeof buildHrDocumentsAuditTrailListSurface>;
  auditTrailLoadError?: EmptyState;
  acknowledgmentsList: ReturnType<
    typeof buildHrDocumentsAcknowledgmentsListSurface
  >;
  acknowledgmentsLoadError?: EmptyState;
};

export async function buildHrDocumentsPageModel(
  input: HrDocumentsPageModelInput,
): Promise<HrDocumentsPageModel> {
  const copy = hrDocumentsUiCopy;

  const employeePickerOptions = await loadDocumentsEmployeePickerOptions(
    input.organizationId,
  );

  const [
    overviewResult,
    repositoryResult,
    requirementsResult,
    missingResult,
    expiringResult,
    retentionResult,
    auditTrailResult,
    acknowledgmentsResult,
  ] = await Promise.all([
    settleDocumentsListLoad({
      sectionTitle: copy.overview.sectionTitle,
      load: () =>
        loadHrDocumentsOverviewSnapshot({
          organizationId: input.organizationId,
        }),
    }),
    settleDocumentsListLoad({
      sectionTitle: copy.repository.sectionTitle,
      load: () =>
        listHrEmployeeDocumentsWindow({
          organizationId: input.organizationId,
          limit: DOCUMENTS_DEFAULT_PAGE_SIZE,
          search: input.repositorySearch,
          latestOnly: true,
        }),
    }),
    settleDocumentsListLoad({
      sectionTitle: copy.requirements.sectionTitle,
      load: () =>
        listHrDocumentRequirements({ organizationId: input.organizationId }),
    }),
    settleDocumentsListLoad({
      sectionTitle: copy.missing.sectionTitle,
      load: () =>
        listHrDocumentMissingMandatoryWindow({
          organizationId: input.organizationId,
          limit: DOCUMENTS_DEFAULT_PAGE_SIZE,
          search: input.missingSearch,
        }),
    }),
    settleDocumentsListLoad({
      sectionTitle: copy.expiring.sectionTitle,
      load: () =>
        loadHrDocumentsExpiringWindow({
          organizationId: input.organizationId,
          search: input.expiringSearch,
          pageSize: DOCUMENTS_DEFAULT_PAGE_SIZE,
        }),
    }),
    settleDocumentsListLoad({
      sectionTitle: copy.retention.sectionTitle,
      load: () =>
        listHrDocumentRetentionPolicies({
          organizationId: input.organizationId,
        }),
    }),
    settleDocumentsListLoad({
      sectionTitle: copy.auditTrail.sectionTitle,
      load: () =>
        listHrDocumentAuditTrailWindow({
          organizationId: input.organizationId,
          limit: DOCUMENTS_DEFAULT_PAGE_SIZE,
          search: input.auditTrailSearch,
        }),
    }),
    settleDocumentsListLoad({
      sectionTitle: copy.acknowledgments.sectionTitle,
      load: () =>
        listHrDocumentAcknowledgmentsWindow({
          organizationId: input.organizationId,
          limit: DOCUMENTS_DEFAULT_PAGE_SIZE,
          search: input.acknowledgmentsSearch,
        }),
    }),
  ]);

  const overviewSnapshot = overviewResult.value ?? {
    activeDocumentCount: 0,
    pendingVerificationCount: 0,
    expiringSoonCount: 0,
    expiredActiveCount: 0,
  };

  const requirementsWindow = filterRequirementsWindow(
    requirementsResult.value ?? [],
    input.requirementsSearch,
    DOCUMENTS_DEFAULT_PAGE_SIZE,
  );

  const retentionWindow = filterRetentionWindow(
    retentionResult.value ?? [],
    input.retentionSearch,
    DOCUMENTS_DEFAULT_PAGE_SIZE,
  );

  const auditTrailWindow: HrDocumentAuditTrailWindow = auditTrailResult.value
    ? {
        rows: auditTrailResult.value.rows.map((row) => ({
          id: row.id,
          occurredAt: row.occurredAt,
          action: row.action,
          actorUserId: row.actorUserId,
          summary: row.summary,
          documentId: row.documentId,
          employeeId: row.employeeId,
        })),
        pageSize: auditTrailResult.value.pageSize,
        totalCount: auditTrailResult.value.totalCount,
        hasNextPage: auditTrailResult.value.hasNextPage,
      }
    : {
        rows: [],
        pageSize: DOCUMENTS_DEFAULT_PAGE_SIZE,
        totalCount: 0,
        hasNextPage: false,
      };

  const acknowledgmentsWindow: HrDocumentAcknowledgmentWindow =
    acknowledgmentsResult.value ?? {
      rows: [],
      pageSize: DOCUMENTS_DEFAULT_PAGE_SIZE,
      totalCount: 0,
      hasNextPage: false,
    };

  const repositoryWindow = repositoryResult.value ?? {
    rows: [],
    pageSize: DOCUMENTS_DEFAULT_PAGE_SIZE,
    totalCount: 0,
    hasNextPage: false,
  };

  const missingWindow = missingResult.value ?? {
    rows: [],
    pageSize: DOCUMENTS_DEFAULT_PAGE_SIZE,
    totalCount: 0,
    hasNextPage: false,
  };

  const expiringWindow = expiringResult.value ?? {
    rows: [],
    pageSize: DOCUMENTS_DEFAULT_PAGE_SIZE,
    totalCount: 0,
    hasNextPage: false,
  };

  return {
    organizationId: input.organizationId,
    canWrite: input.canWrite,
    canViewSensitive: input.canViewSensitive,
    employeePickerOptions,
    overviewStatGroups: buildHrDocumentsOverviewStatGroups({
      snapshot: overviewSnapshot,
    }),
    overviewLoadError: overviewResult.loadError,
    repositoryList: repositoryResult.value
      ? buildHrDocumentsRepositoryListSurface({
          window: repositoryWindow,
          searchValue: input.repositorySearch,
          canWrite: input.canWrite,
          canViewSensitive: input.canViewSensitive,
        })
      : buildDocumentsListLoadErrorPlaceholder({
          columnsId:
            HR_DOCUMENTS_LIST_SURFACE_COLUMNS_BY_KEY[
              hrDocumentsRepositorySurfaceKey
            ],
          searchParam: hrDocumentsRepositorySearchParam,
          searchLabel: copy.repository.searchLabel,
          searchPlaceholder: copy.repository.searchPlaceholder,
          surfaceHeaderTitle: copy.repository.surfaceHeaderTitle,
        }),
    repositoryLoadError: repositoryResult.loadError,
    requirementsList: requirementsResult.value
      ? buildHrDocumentsRequirementsListSurface({
          window: requirementsWindow,
          searchValue: input.requirementsSearch,
          canWrite: input.canWrite,
        })
      : buildDocumentsListLoadErrorPlaceholder({
          columnsId:
            HR_DOCUMENTS_LIST_SURFACE_COLUMNS_BY_KEY[
              hrDocumentsRequirementsSurfaceKey
            ],
          searchParam: hrDocumentsRequirementsSearchParam,
          searchLabel: copy.requirements.searchLabel,
          searchPlaceholder: copy.requirements.searchPlaceholder,
          surfaceHeaderTitle: copy.requirements.surfaceHeaderTitle,
        }),
    requirementsLoadError: requirementsResult.loadError,
    missingList: missingResult.value
      ? buildHrDocumentsMissingListSurface({
          window: missingWindow,
          searchValue: input.missingSearch,
        })
      : buildDocumentsListLoadErrorPlaceholder({
          columnsId:
            HR_DOCUMENTS_LIST_SURFACE_COLUMNS_BY_KEY[hrDocumentsMissingSurfaceKey],
          searchParam: hrDocumentsMissingSearchParam,
          searchLabel: copy.missing.searchLabel,
          searchPlaceholder: copy.missing.searchPlaceholder,
          surfaceHeaderTitle: copy.missing.surfaceHeaderTitle,
        }),
    missingLoadError: missingResult.loadError,
    expiringList: expiringResult.value
      ? buildHrDocumentsExpiringListSurface({
          window: expiringWindow,
          searchValue: input.expiringSearch,
          canViewSensitive: input.canViewSensitive,
        })
      : buildDocumentsListLoadErrorPlaceholder({
          columnsId:
            HR_DOCUMENTS_LIST_SURFACE_COLUMNS_BY_KEY[hrDocumentsExpiringSurfaceKey],
          searchParam: hrDocumentsExpiringSearchParam,
          searchLabel: copy.expiring.searchLabel,
          searchPlaceholder: copy.expiring.searchPlaceholder,
          surfaceHeaderTitle: copy.expiring.surfaceHeaderTitle,
        }),
    expiringLoadError: expiringResult.loadError,
    retentionList: retentionResult.value
      ? buildHrDocumentsRetentionListSurface({
          window: retentionWindow,
          searchValue: input.retentionSearch,
          canWrite: input.canWrite,
        })
      : buildDocumentsListLoadErrorPlaceholder({
          columnsId:
            HR_DOCUMENTS_LIST_SURFACE_COLUMNS_BY_KEY[
              hrDocumentsRetentionSurfaceKey
            ],
          searchParam: hrDocumentsRetentionSearchParam,
          searchLabel: copy.retention.searchLabel,
          searchPlaceholder: copy.retention.searchPlaceholder,
          surfaceHeaderTitle: copy.retention.surfaceHeaderTitle,
        }),
    retentionLoadError: retentionResult.loadError,
    auditTrailList: auditTrailResult.value
      ? buildHrDocumentsAuditTrailListSurface({
          window: auditTrailWindow,
          searchValue: input.auditTrailSearch,
        })
      : buildDocumentsListLoadErrorPlaceholder({
          columnsId:
            HR_DOCUMENTS_LIST_SURFACE_COLUMNS_BY_KEY[
              hrDocumentsAuditTrailSurfaceKey
            ],
          searchParam: hrDocumentsAuditTrailSearchParam,
          searchLabel: copy.auditTrail.searchLabel,
          searchPlaceholder: copy.auditTrail.searchPlaceholder,
          surfaceHeaderTitle: copy.auditTrail.surfaceHeaderTitle,
        }),
    auditTrailLoadError: auditTrailResult.loadError,
    acknowledgmentsList: acknowledgmentsResult.value
      ? buildHrDocumentsAcknowledgmentsListSurface({
          window: acknowledgmentsWindow,
          searchValue: input.acknowledgmentsSearch,
        })
      : buildDocumentsListLoadErrorPlaceholder({
          columnsId:
            HR_DOCUMENTS_LIST_SURFACE_COLUMNS_BY_KEY[
              hrDocumentsAcknowledgmentsSurfaceKey
            ],
          searchParam: hrDocumentsAcknowledgmentsSearchParam,
          searchLabel: copy.acknowledgments.searchLabel,
          searchPlaceholder: copy.acknowledgments.searchPlaceholder,
          surfaceHeaderTitle: copy.acknowledgments.surfaceHeaderTitle,
        }),
    acknowledgmentsLoadError: acknowledgmentsResult.loadError,
  };
}

export {
  hrDocumentsRepositorySurfaceKey,
  hrDocumentsRequirementsSurfaceKey,
  hrDocumentsMissingSurfaceKey,
  hrDocumentsExpiringSurfaceKey,
  hrDocumentsRetentionSurfaceKey,
  hrDocumentsAuditTrailSurfaceKey,
  hrDocumentsAcknowledgmentsSurfaceKey,
};
