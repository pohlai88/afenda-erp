import {
  listHrLifecycleAuditEventsWindow,
  listHrLifecycleNoticePeriodWindow,
  listHrLifecycleOverviewWindow,
  listHrLifecyclePendingTransitionsWindow,
  listHrLifecycleProbationDueWindow,
  listHrOffboardingCasesWindow,
  listHrOnboardingCasesWindow,
  type HrEmploymentStatus,
} from "@afenda/db";

import {
  buildLifecycleListLoadErrorPlaceholder,
  settleLifecycleListLoad,
} from "./hr.workforce.lifecycle-list-load.shared";
import { loadHrLifecycleOverviewSnapshot } from "./hr.workforce.lifecycle-overview.shared";
import {
  buildHrLifecycleOverviewListSurface,
  hrLifecycleOverviewSearchParam,
} from "../surface/hr.workforce.lifecycle-overview-list.surface";
import {
  buildHrLifecycleAuditTrailListSurface,
  hrLifecycleAuditTrailSearchParam,
} from "../surface/hr.workforce.lifecycle-audit-trail-list.surface";
import { hrLifecycleAuditTrailSurfaceKey } from "../surface/hr.workforce.lifecycle-audit-trail-list.surface";
import {
  buildHrLifecycleProbationDueListSurface,
  hrLifecycleProbationDueSearchParam,
} from "../surface/hr.workforce.lifecycle-probation-due-list.surface";
import { hrLifecycleProbationDueSurfaceKey } from "../surface/hr.workforce.lifecycle-probation-due-list.surface";
import {
  buildHrLifecycleNoticePeriodListSurface,
  hrLifecycleNoticePeriodSearchParam,
} from "../surface/hr.workforce.lifecycle-notice-period-list.surface";
import { hrLifecycleNoticePeriodSurfaceKey } from "../surface/hr.workforce.lifecycle-notice-period-list.surface";
import {
  buildHrLifecycleOffboardingCasesListSurface,
  hrLifecycleOffboardingCasesSearchParam,
} from "../surface/hr.workforce.lifecycle-offboarding-cases-list.surface";
import { hrLifecycleOffboardingCasesSurfaceKey } from "../surface/hr.workforce.lifecycle-offboarding-cases-list.surface";
import {
  buildHrLifecycleOnboardingCasesListSurface,
  hrLifecycleOnboardingCasesSearchParam,
} from "../surface/hr.workforce.lifecycle-onboarding-cases-list.surface";
import { hrLifecycleOnboardingCasesSurfaceKey } from "../surface/hr.workforce.lifecycle-onboarding-cases-list.surface";
import {
  buildHrLifecyclePendingTransitionsListSurface,
  hrLifecyclePendingTransitionsSearchParam,
} from "../surface/hr.workforce.lifecycle-pending-transitions-list.surface";
import { hrLifecyclePendingTransitionsSurfaceKey } from "../surface/hr.workforce.lifecycle-pending-transitions-list.surface";
import { buildHrLifecycleOverviewStatGroups } from "../surface/hr.workforce.lifecycle-overview-stat.surface";
import { HR_LIFECYCLE_LIST_SURFACE_COLUMNS_BY_KEY } from "../surface/hr.workforce.lifecycle-surface-metadata.shared";
import { hrLifecycleOverviewSurfaceKey } from "../surface/hr.workforce.lifecycle-overview-list.surface";
import { hrLifecycleUiCopy } from "../surface/hr.workforce.lifecycle-ui.copy.shared";
import { hrLifecycleEmploymentStatusSchema } from "../schemas/hr.workforce.lifecycle-employment-status.schema";

export type HrLifecyclePageModelInput = {
  organizationId: string;
  canWrite: boolean;
  pendingTransitionsSearch?: string;
  probationDueSearch?: string;
  onboardingCasesSearch?: string;
  noticePeriodSearch?: string;
  offboardingCasesSearch?: string;
  overviewSearch?: string;
  auditTrailSearch?: string;
  employmentStatusFilter?: string;
};

function resolveEmploymentStatusFilter(
  raw: string | undefined,
): HrEmploymentStatus | undefined {
  if (!raw) {
    return undefined;
  }
  const parsed = hrLifecycleEmploymentStatusSchema.safeParse(raw);
  return parsed.success ? parsed.data : undefined;
}

export async function buildHrLifecyclePageModel(
  input: HrLifecyclePageModelInput,
) {
  const employmentStatus = resolveEmploymentStatusFilter(
    input.employmentStatusFilter,
  );
  const overviewCopy = hrLifecycleUiCopy.overview;
  const pendingCopy = hrLifecycleUiCopy.pendingTransitions;
  const probationCopy = hrLifecycleUiCopy.probationDue;
  const onboardingCopy = hrLifecycleUiCopy.onboardingCases;
  const noticeCopy = hrLifecycleUiCopy.noticePeriod;
  const offboardingCopy = hrLifecycleUiCopy.offboardingCases;
  const auditCopy = hrLifecycleUiCopy.auditTrail;

  const [
    snapshot,
    pendingLoad,
    probationLoad,
    onboardingLoad,
    noticeLoad,
    offboardingLoad,
    overviewLoad,
    auditLoad,
  ] = await Promise.all([
    loadHrLifecycleOverviewSnapshot({
      organizationId: input.organizationId,
    }),
    settleLifecycleListLoad({
      sectionTitle: pendingCopy.sectionTitle,
      load: () =>
        listHrLifecyclePendingTransitionsWindow({
          organizationId: input.organizationId,
          search: input.pendingTransitionsSearch,
          limit: 25,
          offset: 0,
        }),
    }),
    settleLifecycleListLoad({
      sectionTitle: probationCopy.sectionTitle,
      load: () =>
        listHrLifecycleProbationDueWindow({
          organizationId: input.organizationId,
          search: input.probationDueSearch,
          limit: 25,
          offset: 0,
        }),
    }),
    settleLifecycleListLoad({
      sectionTitle: onboardingCopy.sectionTitle,
      load: () =>
        listHrOnboardingCasesWindow({
          organizationId: input.organizationId,
          status: "in_progress",
          search: input.onboardingCasesSearch,
          limit: 25,
          offset: 0,
        }),
    }),
    settleLifecycleListLoad({
      sectionTitle: noticeCopy.sectionTitle,
      load: () =>
        listHrLifecycleNoticePeriodWindow({
          organizationId: input.organizationId,
          search: input.noticePeriodSearch,
          limit: 25,
          offset: 0,
        }),
    }),
    settleLifecycleListLoad({
      sectionTitle: offboardingCopy.sectionTitle,
      load: () =>
        listHrOffboardingCasesWindow({
          organizationId: input.organizationId,
          status: "in_progress",
          search: input.offboardingCasesSearch,
          limit: 25,
          offset: 0,
        }),
    }),
    settleLifecycleListLoad({
      sectionTitle: overviewCopy.rosterTitle,
      load: () =>
        listHrLifecycleOverviewWindow({
          organizationId: input.organizationId,
          search: input.overviewSearch,
          employmentStatus,
          limit: 25,
          offset: 0,
        }),
    }),
    settleLifecycleListLoad({
      sectionTitle: auditCopy.sectionTitle,
      load: () =>
        listHrLifecycleAuditEventsWindow({
          organizationId: input.organizationId,
          search: input.auditTrailSearch,
          limit: 25,
          offset: 0,
        }),
    }),
  ]);

  const pendingTransitionsList = pendingLoad.value
    ? buildHrLifecyclePendingTransitionsListSurface({
        window: pendingLoad.value,
        searchValue: input.pendingTransitionsSearch,
        canWrite: input.canWrite,
      })
    : buildLifecycleListLoadErrorPlaceholder({
        columnsId:
          HR_LIFECYCLE_LIST_SURFACE_COLUMNS_BY_KEY[
            hrLifecyclePendingTransitionsSurfaceKey
          ],
        searchParam: hrLifecyclePendingTransitionsSearchParam,
        searchLabel: pendingCopy.searchLabel,
        searchPlaceholder: pendingCopy.searchPlaceholder,
        surfaceHeaderTitle: pendingCopy.surfaceHeaderTitle,
        emptyTitle: pendingCopy.emptyTitle,
        emptyDescription: pendingCopy.emptyDescription,
      });

  const probationDueList = probationLoad.value
    ? buildHrLifecycleProbationDueListSurface({
        window: probationLoad.value,
        searchValue: input.probationDueSearch,
        canWrite: input.canWrite,
      })
    : buildLifecycleListLoadErrorPlaceholder({
        columnsId:
          HR_LIFECYCLE_LIST_SURFACE_COLUMNS_BY_KEY[
            hrLifecycleProbationDueSurfaceKey
          ],
        searchParam: hrLifecycleProbationDueSearchParam,
        searchLabel: probationCopy.searchLabel,
        searchPlaceholder: probationCopy.searchPlaceholder,
        surfaceHeaderTitle: probationCopy.surfaceHeaderTitle,
        emptyTitle: probationCopy.emptyTitle,
        emptyDescription: probationCopy.emptyDescription,
      });

  const onboardingCasesList = onboardingLoad.value
    ? buildHrLifecycleOnboardingCasesListSurface({
        window: onboardingLoad.value,
        searchValue: input.onboardingCasesSearch,
      })
    : buildLifecycleListLoadErrorPlaceholder({
        columnsId:
          HR_LIFECYCLE_LIST_SURFACE_COLUMNS_BY_KEY[
            hrLifecycleOnboardingCasesSurfaceKey
          ],
        searchParam: hrLifecycleOnboardingCasesSearchParam,
        searchLabel: onboardingCopy.searchLabel,
        searchPlaceholder: onboardingCopy.searchPlaceholder,
        surfaceHeaderTitle: onboardingCopy.surfaceHeaderTitle,
        emptyTitle: onboardingCopy.emptyTitle,
        emptyDescription: onboardingCopy.emptyDescription,
      });

  const noticePeriodList = noticeLoad.value
    ? buildHrLifecycleNoticePeriodListSurface({
        window: noticeLoad.value,
        searchValue: input.noticePeriodSearch,
        canWrite: input.canWrite,
      })
    : buildLifecycleListLoadErrorPlaceholder({
        columnsId:
          HR_LIFECYCLE_LIST_SURFACE_COLUMNS_BY_KEY[
            hrLifecycleNoticePeriodSurfaceKey
          ],
        searchParam: hrLifecycleNoticePeriodSearchParam,
        searchLabel: noticeCopy.searchLabel,
        searchPlaceholder: noticeCopy.searchPlaceholder,
        surfaceHeaderTitle: noticeCopy.surfaceHeaderTitle,
        emptyTitle: noticeCopy.emptyTitle,
        emptyDescription: noticeCopy.emptyDescription,
      });

  const offboardingCasesList = offboardingLoad.value
    ? buildHrLifecycleOffboardingCasesListSurface({
        window: offboardingLoad.value,
        searchValue: input.offboardingCasesSearch,
      })
    : buildLifecycleListLoadErrorPlaceholder({
        columnsId:
          HR_LIFECYCLE_LIST_SURFACE_COLUMNS_BY_KEY[
            hrLifecycleOffboardingCasesSurfaceKey
          ],
        searchParam: hrLifecycleOffboardingCasesSearchParam,
        searchLabel: offboardingCopy.searchLabel,
        searchPlaceholder: offboardingCopy.searchPlaceholder,
        surfaceHeaderTitle: offboardingCopy.surfaceHeaderTitle,
        emptyTitle: offboardingCopy.emptyTitle,
        emptyDescription: offboardingCopy.emptyDescription,
      });

  const overviewList = overviewLoad.value
    ? buildHrLifecycleOverviewListSurface({
        window: overviewLoad.value,
        searchValue: input.overviewSearch,
        canWrite: input.canWrite,
      })
    : buildLifecycleListLoadErrorPlaceholder({
        columnsId:
          HR_LIFECYCLE_LIST_SURFACE_COLUMNS_BY_KEY[hrLifecycleOverviewSurfaceKey],
        searchParam: hrLifecycleOverviewSearchParam,
        searchLabel: overviewCopy.searchLabel,
        searchPlaceholder: overviewCopy.searchPlaceholder,
        surfaceHeaderTitle: overviewCopy.surfaceHeaderTitle,
        emptyTitle: overviewCopy.emptyTitle,
        emptyDescription: overviewCopy.emptyDescription,
      });

  const auditTrailList = auditLoad.value
    ? buildHrLifecycleAuditTrailListSurface({
        window: auditLoad.value,
        searchValue: input.auditTrailSearch,
      })
    : buildLifecycleListLoadErrorPlaceholder({
        columnsId:
          HR_LIFECYCLE_LIST_SURFACE_COLUMNS_BY_KEY[hrLifecycleAuditTrailSurfaceKey],
        searchParam: hrLifecycleAuditTrailSearchParam,
        searchLabel: auditCopy.searchLabel,
        searchPlaceholder: auditCopy.searchPlaceholder,
        surfaceHeaderTitle: auditCopy.surfaceHeaderTitle,
        emptyTitle: auditCopy.emptyTitle,
        emptyDescription: auditCopy.emptyDescription,
      });

  return {
    canWrite: input.canWrite,
    overviewStatGroups: buildHrLifecycleOverviewStatGroups({ snapshot }),
    pendingTransitionsList,
    pendingTransitionsLoadError: pendingLoad.loadError,
    probationDueList,
    probationDueLoadError: probationLoad.loadError,
    onboardingCasesList,
    onboardingCasesLoadError: onboardingLoad.loadError,
    noticePeriodList,
    noticePeriodLoadError: noticeLoad.loadError,
    offboardingCasesList,
    offboardingCasesLoadError: offboardingLoad.loadError,
    overviewList,
    overviewLoadError: overviewLoad.loadError,
    auditTrailList,
    auditTrailLoadError: auditLoad.loadError,
    copy: hrLifecycleUiCopy,
  };
}

export type HrLifecyclePageModel = Awaited<
  ReturnType<typeof buildHrLifecyclePageModel>
>;
