import {
  listHrEmployeeAssignmentHistoryWindow,
  listHrEmployeeDirectoryWindow,
  listHrEmployeeDocumentReferencesWindow,
  listHrEmployeeIncompleteProfilesWindow,
  listHrEmployeeRecordEventsWindow,
  listHrEmployeeSeparatedWindow,
  listHrEmployeeStatusHistoryWindow,
  type HrEmploymentStatus,
} from "@afenda/db";

import {
  buildRecordsListLoadErrorPlaceholder,
  settleRecordsListLoad,
} from "./hr.workforce.records-list-load.shared";
import { loadHrRecordsOverviewSnapshot } from "./hr.workforce.records-overview.shared";
import {
  buildHrRecordsAssignmentsListSurface,
  hrRecordsAssignmentsSearchParam,
  hrRecordsAssignmentsSurfaceKey,
} from "../surface/hr.workforce.records-assignments-list.surface";
import {
  buildHrRecordsAuditTrailListSurface,
  hrRecordsAuditTrailSearchParam,
  hrRecordsAuditTrailSurfaceKey,
} from "../surface/hr.workforce.records-audit-trail-list.surface";
import {
  buildHrRecordsDirectoryListSurface,
  hrRecordsDirectorySearchParam,
  hrRecordsDirectorySurfaceKey,
} from "../surface/hr.workforce.records-directory-list.surface";
import {
  buildHrRecordsDocumentReferencesListSurface,
  hrRecordsDocumentReferencesSearchParam,
  hrRecordsDocumentReferencesSurfaceKey,
} from "../surface/hr.workforce.records-document-references-list.surface";
import {
  buildHrRecordsIncompleteListSurface,
  hrRecordsIncompleteSearchParam,
  hrRecordsIncompleteSurfaceKey,
} from "../surface/hr.workforce.records-incomplete-list.surface";
import {
  buildHrRecordsSeparatedListSurface,
  hrRecordsSeparatedSearchParam,
  hrRecordsSeparatedSurfaceKey,
} from "../surface/hr.workforce.records-separated-list.surface";
import {
  buildHrRecordsStatusHistoryListSurface,
  hrRecordsStatusHistorySearchParam,
  hrRecordsStatusHistorySurfaceKey,
} from "../surface/hr.workforce.records-status-history-list.surface";
import { buildHrRecordsOverviewStatGroups } from "../surface/hr.workforce.records-overview-stat.surface";
import { HR_RECORDS_LIST_SURFACE_COLUMNS_BY_KEY } from "../surface/hr.workforce.records-surface-metadata.shared";
import { hrRecordsUiCopy } from "../surface/hr.workforce.records-ui.copy.shared";
import { hrRecordsEmploymentStatusSchema } from "../schemas/hr.workforce.records-employment-status.schema";

export type HrRecordsPageModelInput = {
  organizationId: string;
  canWrite: boolean;
  canViewSensitive: boolean;
  incompleteSearch?: string;
  directorySearch?: string;
  assignmentsSearch?: string;
  auditTrailSearch?: string;
  statusHistorySearch?: string;
  documentReferencesSearch?: string;
  separatedSearch?: string;
  employmentStatusFilter?: string;
};

function resolveEmploymentStatusFilter(
  raw: string | undefined,
): HrEmploymentStatus | undefined {
  if (!raw) {
    return undefined;
  }
  const parsed = hrRecordsEmploymentStatusSchema.safeParse(raw);
  return parsed.success ? parsed.data : undefined;
}

export async function buildHrRecordsPageModel(input: HrRecordsPageModelInput) {
  const employmentStatus = resolveEmploymentStatusFilter(
    input.employmentStatusFilter,
  );
  const incompleteCopy = hrRecordsUiCopy.incomplete;
  const directoryCopy = hrRecordsUiCopy.directory;
  const assignmentsCopy = hrRecordsUiCopy.assignments;
  const auditCopy = hrRecordsUiCopy.auditTrail;
  const statusCopy = hrRecordsUiCopy.statusHistory;
  const documentsCopy = hrRecordsUiCopy.documentReferences;
  const separatedCopy = hrRecordsUiCopy.separated;

  const [
    snapshot,
    incompleteLoad,
    directoryLoad,
    assignmentsLoad,
    auditLoad,
    statusLoad,
    documentsLoad,
    separatedLoad,
  ] = await Promise.all([
    loadHrRecordsOverviewSnapshot({
      organizationId: input.organizationId,
    }),
    settleRecordsListLoad({
      sectionTitle: incompleteCopy.sectionTitle,
      load: () =>
        listHrEmployeeIncompleteProfilesWindow({
          organizationId: input.organizationId,
          search: input.incompleteSearch,
          limit: 25,
          offset: 0,
        }),
    }),
    settleRecordsListLoad({
      sectionTitle: directoryCopy.sectionTitle,
      load: () =>
        listHrEmployeeDirectoryWindow({
          organizationId: input.organizationId,
          search: input.directorySearch,
          employmentStatus,
          limit: 25,
          offset: 0,
        }),
    }),
    settleRecordsListLoad({
      sectionTitle: assignmentsCopy.sectionTitle,
      load: () =>
        listHrEmployeeAssignmentHistoryWindow({
          organizationId: input.organizationId,
          search: input.assignmentsSearch,
          limit: 25,
          offset: 0,
        }),
    }),
    settleRecordsListLoad({
      sectionTitle: auditCopy.sectionTitle,
      load: () =>
        listHrEmployeeRecordEventsWindow({
          organizationId: input.organizationId,
          search: input.auditTrailSearch,
          limit: 25,
          offset: 0,
        }),
    }),
    settleRecordsListLoad({
      sectionTitle: statusCopy.sectionTitle,
      load: () =>
        listHrEmployeeStatusHistoryWindow({
          organizationId: input.organizationId,
          search: input.statusHistorySearch,
          limit: 25,
          offset: 0,
        }),
    }),
    settleRecordsListLoad({
      sectionTitle: documentsCopy.sectionTitle,
      load: () =>
        listHrEmployeeDocumentReferencesWindow({
          organizationId: input.organizationId,
          search: input.documentReferencesSearch,
          limit: 25,
          offset: 0,
        }),
    }),
    settleRecordsListLoad({
      sectionTitle: separatedCopy.sectionTitle,
      load: () =>
        listHrEmployeeSeparatedWindow({
          organizationId: input.organizationId,
          search: input.separatedSearch,
          limit: 25,
          offset: 0,
        }),
    }),
  ]);

  const incompleteList = incompleteLoad.value
    ? buildHrRecordsIncompleteListSurface({
        window: incompleteLoad.value,
        searchValue: input.incompleteSearch,
      })
    : buildRecordsListLoadErrorPlaceholder({
        columnsId:
          HR_RECORDS_LIST_SURFACE_COLUMNS_BY_KEY[hrRecordsIncompleteSurfaceKey],
        searchParam: hrRecordsIncompleteSearchParam,
        searchLabel: incompleteCopy.searchLabel,
        searchPlaceholder: incompleteCopy.searchPlaceholder,
        surfaceHeaderTitle: incompleteCopy.surfaceHeaderTitle,
        emptyTitle: incompleteCopy.emptyTitle,
        emptyDescription: incompleteCopy.emptyDescription,
      });

  const directoryList = directoryLoad.value
    ? buildHrRecordsDirectoryListSurface({
        window: directoryLoad.value,
        searchValue: input.directorySearch,
        canViewSensitive: input.canViewSensitive,
        canWrite: input.canWrite,
      })
    : buildRecordsListLoadErrorPlaceholder({
        columnsId:
          HR_RECORDS_LIST_SURFACE_COLUMNS_BY_KEY[hrRecordsDirectorySurfaceKey],
        searchParam: hrRecordsDirectorySearchParam,
        searchLabel: directoryCopy.searchLabel,
        searchPlaceholder: directoryCopy.searchPlaceholder,
        surfaceHeaderTitle: directoryCopy.surfaceHeaderTitle,
        emptyTitle: directoryCopy.emptyTitle,
        emptyDescription: directoryCopy.emptyDescription,
      });

  const assignmentsList = assignmentsLoad.value
    ? buildHrRecordsAssignmentsListSurface({
        window: assignmentsLoad.value,
        searchValue: input.assignmentsSearch,
      })
    : buildRecordsListLoadErrorPlaceholder({
        columnsId:
          HR_RECORDS_LIST_SURFACE_COLUMNS_BY_KEY[
            hrRecordsAssignmentsSurfaceKey
          ],
        searchParam: hrRecordsAssignmentsSearchParam,
        searchLabel: assignmentsCopy.searchLabel,
        searchPlaceholder: assignmentsCopy.searchPlaceholder,
        surfaceHeaderTitle: assignmentsCopy.surfaceHeaderTitle,
        emptyTitle: assignmentsCopy.emptyTitle,
        emptyDescription: assignmentsCopy.emptyDescription,
      });

  const auditTrailList = auditLoad.value
    ? buildHrRecordsAuditTrailListSurface({
        window: auditLoad.value,
        searchValue: input.auditTrailSearch,
      })
    : buildRecordsListLoadErrorPlaceholder({
        columnsId:
          HR_RECORDS_LIST_SURFACE_COLUMNS_BY_KEY[hrRecordsAuditTrailSurfaceKey],
        searchParam: hrRecordsAuditTrailSearchParam,
        searchLabel: auditCopy.searchLabel,
        searchPlaceholder: auditCopy.searchPlaceholder,
        surfaceHeaderTitle: auditCopy.surfaceHeaderTitle,
        emptyTitle: auditCopy.emptyTitle,
        emptyDescription: auditCopy.emptyDescription,
      });

  const statusHistoryList = statusLoad.value
    ? buildHrRecordsStatusHistoryListSurface({
        window: statusLoad.value,
        searchValue: input.statusHistorySearch,
      })
    : buildRecordsListLoadErrorPlaceholder({
        columnsId:
          HR_RECORDS_LIST_SURFACE_COLUMNS_BY_KEY[hrRecordsStatusHistorySurfaceKey],
        searchParam: hrRecordsStatusHistorySearchParam,
        searchLabel: statusCopy.searchLabel,
        searchPlaceholder: statusCopy.searchPlaceholder,
        surfaceHeaderTitle: statusCopy.surfaceHeaderTitle,
        emptyTitle: statusCopy.emptyTitle,
        emptyDescription: statusCopy.emptyDescription,
      });

  const documentReferencesList = documentsLoad.value
    ? buildHrRecordsDocumentReferencesListSurface({
        window: documentsLoad.value,
        searchValue: input.documentReferencesSearch,
      })
    : buildRecordsListLoadErrorPlaceholder({
        columnsId:
          HR_RECORDS_LIST_SURFACE_COLUMNS_BY_KEY[
            hrRecordsDocumentReferencesSurfaceKey
          ],
        searchParam: hrRecordsDocumentReferencesSearchParam,
        searchLabel: documentsCopy.searchLabel,
        searchPlaceholder: documentsCopy.searchPlaceholder,
        surfaceHeaderTitle: documentsCopy.surfaceHeaderTitle,
        emptyTitle: documentsCopy.emptyTitle,
        emptyDescription: documentsCopy.emptyDescription,
      });

  const separatedList = separatedLoad.value
    ? buildHrRecordsSeparatedListSurface({
        window: separatedLoad.value,
        searchValue: input.separatedSearch,
        canWrite: input.canWrite,
      })
    : buildRecordsListLoadErrorPlaceholder({
        columnsId:
          HR_RECORDS_LIST_SURFACE_COLUMNS_BY_KEY[hrRecordsSeparatedSurfaceKey],
        searchParam: hrRecordsSeparatedSearchParam,
        searchLabel: separatedCopy.searchLabel,
        searchPlaceholder: separatedCopy.searchPlaceholder,
        surfaceHeaderTitle: separatedCopy.surfaceHeaderTitle,
        emptyTitle: separatedCopy.emptyTitle,
        emptyDescription: separatedCopy.emptyDescription,
      });

  return {
    canWrite: input.canWrite,
    canViewSensitive: input.canViewSensitive,
    copy: hrRecordsUiCopy,
    overviewStatGroups: buildHrRecordsOverviewStatGroups({ snapshot }),
    incompleteList,
    incompleteLoadError: incompleteLoad.loadError,
    directoryList,
    directoryLoadError: directoryLoad.loadError,
    assignmentsList,
    assignmentsLoadError: assignmentsLoad.loadError,
    auditTrailList,
    auditTrailLoadError: auditLoad.loadError,
    statusHistoryList,
    statusHistoryLoadError: statusLoad.loadError,
    documentReferencesList,
    documentReferencesLoadError: documentsLoad.loadError,
    separatedList,
    separatedLoadError: separatedLoad.loadError,
  };
}

export type HrRecordsPageModel = Awaited<
  ReturnType<typeof buildHrRecordsPageModel>
>;
