import {
  buildHrRonApplicationsListSurface,
  buildHrRonAuditTrailListSurface,
  buildHrRonInterviewsListSurface,
  buildHrRonOffersListSurface,
  buildHrRonOnboardingTasksListSurface,
  buildHrRonPostingsListSurface,
  buildHrRonReadinessListSurface,
  buildHrRonReportsListSurface,
  buildHrRonRequisitionsListSurface,
} from "./hr.talent.ron-lists.surface";
import {
  hrRonApplicationsSurfaceKey,
  hrRonAuditTrailSurfaceKey,
  hrRonInterviewsSurfaceKey,
  hrRonOffersSurfaceKey,
  hrRonOnboardingTasksSurfaceKey,
  hrRonPostingsSurfaceKey,
  hrRonReadinessSurfaceKey,
  hrRonReportsSurfaceKey,
  hrRonRequisitionsSurfaceKey,
  type HrRonSearchParams,
} from "./hr.talent.ron-search-params.parse.shared";
import {
  buildHrRonReportRows,
  filterHrRonRecordsForAccess,
  getHrRonStore,
} from "./hr.talent.ron-store.shared";

const RON_DEFAULT_PAGE_SIZE = 25;

export type HrRonPageModel = {
  canWrite: boolean;
  canApproveRequisitions: boolean;
  canApproveOffers: boolean;
  canReadSensitiveCandidateData: boolean;
  canReadAudit: boolean;
  reportGroupBy: HrRonSearchParams["reportGroupBy"];
  requisitionsList: ReturnType<typeof buildHrRonRequisitionsListSurface>;
  postingsList: ReturnType<typeof buildHrRonPostingsListSurface>;
  applicationsList: ReturnType<typeof buildHrRonApplicationsListSurface>;
  interviewsList: ReturnType<typeof buildHrRonInterviewsListSurface>;
  offersList: ReturnType<typeof buildHrRonOffersListSurface>;
  onboardingTasksList: ReturnType<typeof buildHrRonOnboardingTasksListSurface>;
  readinessList: ReturnType<typeof buildHrRonReadinessListSurface>;
  reportsList: ReturnType<typeof buildHrRonReportsListSurface>;
  auditTrailList: ReturnType<typeof buildHrRonAuditTrailListSurface> | null;
};

type SearchableRecord = {
  readonly id: string;
};

function filterRows<T extends SearchableRecord>(
  rows: readonly T[],
  searchValue?: string,
): T[] {
  if (!searchValue?.trim()) {
    return [...rows].slice(0, RON_DEFAULT_PAGE_SIZE);
  }
  const needle = searchValue.trim().toLowerCase();
  return rows
    .filter((row) => JSON.stringify(row).toLowerCase().includes(needle))
    .slice(0, RON_DEFAULT_PAGE_SIZE);
}

export async function buildHrRonPageModel(input: {
  organizationId: string;
  canWrite: boolean;
  canApproveRequisitions: boolean;
  canApproveOffers: boolean;
  canReadSensitiveCandidateData: boolean;
  canReadFinance: boolean;
  canReadIt: boolean;
  canReadAudit: boolean;
} & HrRonSearchParams): Promise<HrRonPageModel> {
  const store = getHrRonStore(input.organizationId);
  const visibleStore = filterHrRonRecordsForAccess({
    store,
    access: {
      role: "hr",
      canReadSensitiveCandidateData: input.canReadSensitiveCandidateData,
      canReadFinance: input.canReadFinance,
      canReadIt: input.canReadIt,
    },
  });
  const candidateNames = new Map(
    visibleStore.candidates.map((candidate) => [
      candidate.id,
      candidate.displayName,
    ]),
  );
  const reportRows = buildHrRonReportRows({
    store: visibleStore,
    groupBy: input.reportGroupBy,
  });

  return {
    canWrite: input.canWrite,
    canApproveRequisitions: input.canApproveRequisitions,
    canApproveOffers: input.canApproveOffers,
    canReadSensitiveCandidateData: input.canReadSensitiveCandidateData,
    canReadAudit: input.canReadAudit,
    reportGroupBy: input.reportGroupBy,
    requisitionsList: buildHrRonRequisitionsListSurface({
      surfaceKey: hrRonRequisitionsSurfaceKey,
      rows: filterRows(visibleStore.requisitions, input.requisitionsSearch),
      searchValue: input.requisitionsSearch,
    }),
    postingsList: buildHrRonPostingsListSurface({
      surfaceKey: hrRonPostingsSurfaceKey,
      requisitions: visibleStore.requisitions,
      rows: filterRows(visibleStore.postings, input.postingsSearch),
      searchValue: input.postingsSearch,
    }),
    applicationsList: buildHrRonApplicationsListSurface({
      surfaceKey: hrRonApplicationsSurfaceKey,
      requisitions: visibleStore.requisitions,
      rows: filterRows(visibleStore.applications, input.applicationsSearch),
      candidateNames,
      searchValue: input.applicationsSearch,
    }),
    interviewsList: buildHrRonInterviewsListSurface({
      surfaceKey: hrRonInterviewsSurfaceKey,
      rows: filterRows(visibleStore.interviews, input.interviewsSearch),
      candidateNames,
      searchValue: input.interviewsSearch,
    }),
    offersList: buildHrRonOffersListSurface({
      surfaceKey: hrRonOffersSurfaceKey,
      rows: filterRows(visibleStore.offers, input.offersSearch),
      candidateNames,
      searchValue: input.offersSearch,
    }),
    onboardingTasksList: buildHrRonOnboardingTasksListSurface({
      surfaceKey: hrRonOnboardingTasksSurfaceKey,
      rows: filterRows(
        visibleStore.onboardingTasks,
        input.onboardingTasksSearch,
      ),
      searchValue: input.onboardingTasksSearch,
    }),
    readinessList: buildHrRonReadinessListSurface({
      surfaceKey: hrRonReadinessSurfaceKey,
      rows: filterRows(visibleStore.readiness, input.readinessSearch),
      searchValue: input.readinessSearch,
    }),
    reportsList: buildHrRonReportsListSurface({
      surfaceKey: hrRonReportsSurfaceKey,
      rows: filterRows(reportRows, input.reportsSearch),
      searchValue: input.reportsSearch,
    }),
    auditTrailList: input.canReadAudit
      ? buildHrRonAuditTrailListSurface({
          surfaceKey: hrRonAuditTrailSurfaceKey,
          rows: filterRows(visibleStore.auditEvents, input.auditTrailSearch),
          searchValue: input.auditTrailSearch,
        })
      : null,
  };
}
