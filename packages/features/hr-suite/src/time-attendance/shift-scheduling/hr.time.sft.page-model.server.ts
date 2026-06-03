import type { EmptyState } from "@afenda/governed-surface/schemas";

import { loadHrTimeSftAvailabilityWindow } from "./hr.time.sft-availability.server";
import { listHrSftAttendanceReconcile } from "./hr.time.sft-attendance-reconcile.server";
import { listHrSftAuditTrailWindow } from "./hr.time.sft-audit.server";
import { loadHrTimeSftCoverageCompareWindow } from "./hr.time.sft-coverage.server";
import { listHrSftPayrollReferencesForPeriod } from "./hr.time.sft-payroll-ref.server";
import { listHrSftScheduleNotifications } from "./hr.time.sft-notification.server";
import { listHrSftRosterPublications } from "./hr.time.sft-publication.server";
import { listHrTimeSftRecurrenceRules } from "./hr.time.sft-recurrence.server";
import { listHrSftReportDefinitions } from "./hr.time.sft-report.server";
import { listHrTimeSftShiftRoster } from "./hr.time.sft-roster.server";
import {
  loadHrTimeSftMyScheduleChangesWindow,
  loadHrTimeSftScheduleChangePendingWindow,
} from "./hr.time.sft-schedule-change.server";
import type {
  HrSftPageModelInput,
  HrSftSelfServicePageModelInput,
} from "./hr.time.sft-search-params.parse.shared";
import {
  defaultSftPeriodRange,
} from "./hr.time.sft-search-params.parse.shared";
import {
  loadHrTimeSftMySwapsWindow,
  loadHrTimeSftSwapPendingWindow,
} from "./hr.time.sft-swap.server";
import { listHrTimeSftShiftTemplates } from "./hr.time.sft-template.server";
import { buildHrTimeSftAvailabilityListSurface } from "./hr.time.sft-availability-list.surface";
import { buildHrSftAttendanceReconcileListSurface } from "./hr.time.sft-attendance-reconcile-list.surface";
import { buildHrSftAuditTrailListSurface } from "./hr.time.sft-audit-trail-list.surface";
import { buildHrTimeSftCoverageListSurface } from "./hr.time.sft-coverage-list.surface";
import { buildHrTimeSftMyScheduleChangesListSurface } from "./hr.time.sft-my-schedule-changes-list.surface";
import { buildHrTimeSftMySwapsListSurface } from "./hr.time.sft-my-swaps-list.surface";
import { buildHrSftNotificationsListSurface } from "./hr.time.sft-notifications-list.surface";
import {
  buildHrSftPayrollRefsListSurface,
  type HrSftPayrollRefsWindow,
} from "./hr.time.sft-payroll-refs-list.surface";
import { buildHrSftPublicationsListSurface } from "./hr.time.sft-publications-list.surface";
import { buildHrTimeSftRecurrenceRulesListSurface } from "./hr.time.sft-recurrence-rules-list.surface";
import { buildHrSftReportDefinitionsListSurface } from "./hr.time.sft-report-definitions-list.surface";
import { buildHrTimeSftRosterListSurface } from "./hr.time.sft-roster-list.surface";
import { buildHrTimeSftScheduleChangePendingListSurface } from "./hr.time.sft-schedule-change-pending-list.surface";
import { buildHrTimeSftSwapPendingListSurface } from "./hr.time.sft-swap-pending-list.surface";
import {
  hrSftAttendanceReconcileSurfaceKey,
  hrSftAuditTrailSurfaceKey,
  hrSftNotificationsSurfaceKey,
  hrSftPayrollRefsSurfaceKey,
  hrSftPublicationsSurfaceKey,
  hrSftReportDefinitionsSurfaceKey,
  hrTimeSftAvailabilitySurfaceKey,
  hrTimeSftCoverageSurfaceKey,
  hrTimeSftMyScheduleChangesSurfaceKey,
  hrTimeSftMySwapsSurfaceKey,
  hrTimeSftRecurrenceRulesSurfaceKey,
  hrTimeSftRosterSurfaceKey,
  hrTimeSftScheduleChangePendingSurfaceKey,
  hrTimeSftSwapPendingSurfaceKey,
  hrTimeSftTemplatesSurfaceKey,
} from "./hr.time.sft-surface-metadata.shared";
import { buildHrTimeSftTemplatesListSurface } from "./hr.time.sft-templates-list.surface";

const SFT_DEFAULT_PAGE_SIZE = 25;

const emptyWindow = {
  rows: [],
  pageSize: SFT_DEFAULT_PAGE_SIZE,
  totalCount: 0,
  hasNextPage: false,
} as const;

function loadError(title: string, description: string): EmptyState {
  return { variant: "error", title, description };
}

export type HrSftSelfServicePageModel = {
  mySwaps: ReturnType<typeof buildHrTimeSftMySwapsListSurface>;
  mySwapsLoadError?: EmptyState;
  surfaceKeys: {
    mySwaps: typeof hrTimeSftMySwapsSurfaceKey;
  };
};

export type HrSftPageModel = {
  accessScope: HrSftPageModelInput["accessScope"];
  canManage: boolean;
  canApprove: boolean;
  canViewPayrollRefs: boolean;
  canViewAudit: boolean;
  templates: ReturnType<typeof buildHrTimeSftTemplatesListSurface>;
  templatesLoadError?: EmptyState;
  roster: ReturnType<typeof buildHrTimeSftRosterListSurface>;
  rosterLoadError?: EmptyState;
  recurrenceRules: ReturnType<typeof buildHrTimeSftRecurrenceRulesListSurface>;
  recurrenceRulesLoadError?: EmptyState;
  coverage: ReturnType<typeof buildHrTimeSftCoverageListSurface>;
  coverageLoadError?: EmptyState;
  availability: ReturnType<typeof buildHrTimeSftAvailabilityListSurface>;
  availabilityLoadError?: EmptyState;
  swapPending?: ReturnType<typeof buildHrTimeSftSwapPendingListSurface>;
  swapPendingLoadError?: EmptyState;
  scheduleChangePending?: ReturnType<
    typeof buildHrTimeSftScheduleChangePendingListSurface
  >;
  scheduleChangePendingLoadError?: EmptyState;
  mySwaps?: ReturnType<typeof buildHrTimeSftMySwapsListSurface>;
  mySwapsLoadError?: EmptyState;
  myScheduleChanges?: ReturnType<typeof buildHrTimeSftMyScheduleChangesListSurface>;
  myScheduleChangesLoadError?: EmptyState;
  publications: ReturnType<typeof buildHrSftPublicationsListSurface>;
  publicationsLoadError?: EmptyState;
  notifications: ReturnType<typeof buildHrSftNotificationsListSurface>;
  notificationsLoadError?: EmptyState;
  attendanceReconcile: ReturnType<typeof buildHrSftAttendanceReconcileListSurface>;
  attendanceReconcileLoadError?: EmptyState;
  payrollRefs?: ReturnType<typeof buildHrSftPayrollRefsListSurface>;
  payrollRefsLoadError?: EmptyState;
  reportDefinitions: ReturnType<typeof buildHrSftReportDefinitionsListSurface>;
  reportDefinitionsLoadError?: EmptyState;
  auditTrail?: ReturnType<typeof buildHrSftAuditTrailListSurface>;
  auditTrailLoadError?: EmptyState;
  surfaceKeys: {
    templates: typeof hrTimeSftTemplatesSurfaceKey;
    roster: typeof hrTimeSftRosterSurfaceKey;
    recurrenceRules: typeof hrTimeSftRecurrenceRulesSurfaceKey;
    coverage: typeof hrTimeSftCoverageSurfaceKey;
    availability: typeof hrTimeSftAvailabilitySurfaceKey;
    swapPending: typeof hrTimeSftSwapPendingSurfaceKey;
    scheduleChangePending: typeof hrTimeSftScheduleChangePendingSurfaceKey;
    mySwaps: typeof hrTimeSftMySwapsSurfaceKey;
    myScheduleChanges: typeof hrTimeSftMyScheduleChangesSurfaceKey;
    publications: typeof hrSftPublicationsSurfaceKey;
    notifications: typeof hrSftNotificationsSurfaceKey;
    attendanceReconcile: typeof hrSftAttendanceReconcileSurfaceKey;
    payrollRefs: typeof hrSftPayrollRefsSurfaceKey;
    reportDefinitions: typeof hrSftReportDefinitionsSurfaceKey;
    auditTrail: typeof hrSftAuditTrailSurfaceKey;
  };
};

export async function buildHrSftSelfServicePageModel(
  input: HrSftSelfServicePageModelInput,
): Promise<HrSftSelfServicePageModel> {
  let mySwapsWindow;
  let mySwapsLoadError: EmptyState | undefined;

  try {
    mySwapsWindow = await loadHrTimeSftMySwapsWindow({
      organizationId: input.organizationId,
      requesterEmployeeId: input.actorEmployeeId,
      limit: SFT_DEFAULT_PAGE_SIZE,
    });
  } catch {
    mySwapsWindow = { ...emptyWindow };
    mySwapsLoadError = loadError(
      "My swap requests unavailable",
      "Could not load your shift swap requests.",
    );
  }

  return {
    mySwaps: buildHrTimeSftMySwapsListSurface({
      window: mySwapsWindow,
      searchValue: input.mySwapsSearch,
    }),
    mySwapsLoadError,
    surfaceKeys: {
      mySwaps: hrTimeSftMySwapsSurfaceKey,
    },
  };
}

export async function buildHrSftPageModel(
  input: HrSftPageModelInput,
): Promise<HrSftPageModel> {
  const { periodStart, periodEnd } = defaultSftPeriodRange();
  const actorEmployeeId = input.actorEmployeeId;

  const [
    templatesResult,
    rosterResult,
    recurrenceResult,
    coverageResult,
    availabilityResult,
    swapPendingResult,
    scheduleChangePendingResult,
    mySwapsResult,
    myScheduleChangesResult,
    publicationsResult,
    notificationsResult,
    attendanceReconcileResult,
    payrollRefsResult,
    reportDefinitionsResult,
    auditTrailResult,
  ] = await Promise.all([
    listHrTimeSftShiftTemplates({
      organizationId: input.organizationId,
      limit: SFT_DEFAULT_PAGE_SIZE,
      search: input.templatesSearch,
    }).then((window) => ({ ok: true as const, window })).catch(() => ({
      ok: false as const,
      error: loadError(
        "Shift types unavailable",
        "Could not load the shift type catalog.",
      ),
    })),
    listHrTimeSftShiftRoster({
      organizationId: input.organizationId,
      query: {
        periodStart,
        periodEnd,
        limit: SFT_DEFAULT_PAGE_SIZE,
        search: input.rosterSearch,
      },
    }).then((window) => ({ ok: true as const, window })).catch(() => ({
      ok: false as const,
      error: loadError(
        "Roster unavailable",
        "Could not load the shift roster for this period.",
      ),
    })),
    listHrTimeSftRecurrenceRules({
      organizationId: input.organizationId,
      limit: SFT_DEFAULT_PAGE_SIZE,
      search: input.recurrenceRulesSearch,
    }).then((window) => ({ ok: true as const, window })).catch(() => ({
      ok: false as const,
      error: loadError(
        "Recurrence rules unavailable",
        "Could not load recurring shift rules.",
      ),
    })),
    loadHrTimeSftCoverageCompareWindow({
      organizationId: input.organizationId,
      periodStart,
      periodEnd,
      limit: SFT_DEFAULT_PAGE_SIZE,
    }).then((window) => ({ ok: true as const, window })).catch(() => ({
      ok: false as const,
      error: loadError(
        "Coverage compare unavailable",
        "Could not load staffing coverage for this period.",
      ),
    })),
    loadHrTimeSftAvailabilityWindow({
      organizationId: input.organizationId,
      employeeId: actorEmployeeId,
      periodStart,
      periodEnd,
      limit: SFT_DEFAULT_PAGE_SIZE,
    }).then((window) => ({ ok: true as const, window })).catch(() => ({
      ok: false as const,
      error: loadError(
        "Availability unavailable",
        "Could not load employee availability windows.",
      ),
    })),
    input.canApprove
      ? loadHrTimeSftSwapPendingWindow({
          organizationId: input.organizationId,
          limit: SFT_DEFAULT_PAGE_SIZE,
        })
          .then((window) => ({ ok: true as const, window }))
          .catch(() => ({
            ok: false as const,
            error: loadError(
              "Swap inbox unavailable",
              "Could not load pending swap requests.",
            ),
          }))
      : Promise.resolve(null),
    input.canApprove
      ? loadHrTimeSftScheduleChangePendingWindow({
          organizationId: input.organizationId,
          limit: SFT_DEFAULT_PAGE_SIZE,
        })
          .then((window) => ({ ok: true as const, window }))
          .catch(() => ({
            ok: false as const,
            error: loadError(
              "Schedule change inbox unavailable",
              "Could not load pending schedule changes.",
            ),
          }))
      : Promise.resolve(null),
    actorEmployeeId
      ? loadHrTimeSftMySwapsWindow({
          organizationId: input.organizationId,
          requesterEmployeeId: actorEmployeeId,
          limit: SFT_DEFAULT_PAGE_SIZE,
        })
          .then((window) => ({ ok: true as const, window }))
          .catch(() => ({
            ok: false as const,
            error: loadError(
              "My swap requests unavailable",
              "Could not load your shift swap requests.",
            ),
          }))
      : Promise.resolve(null),
    actorEmployeeId
      ? loadHrTimeSftMyScheduleChangesWindow({
          organizationId: input.organizationId,
          requestingEmployeeId: actorEmployeeId,
          limit: SFT_DEFAULT_PAGE_SIZE,
        })
          .then((window) => ({ ok: true as const, window }))
          .catch(() => ({
            ok: false as const,
            error: loadError(
              "My schedule changes unavailable",
              "Could not load your schedule change requests.",
            ),
          }))
      : Promise.resolve(null),
    listHrSftRosterPublications({
      organizationId: input.organizationId,
      limit: SFT_DEFAULT_PAGE_SIZE,
      search: input.publicationsSearch,
    }).then((window) => ({ ok: true as const, window })).catch(() => ({
      ok: false as const,
      error: loadError(
        "Publications unavailable",
        "Could not load roster publication history.",
      ),
    })),
    listHrSftScheduleNotifications({
      organizationId: input.organizationId,
      limit: SFT_DEFAULT_PAGE_SIZE,
      search: input.notificationsSearch,
    }).then((window) => ({ ok: true as const, window })).catch(() => ({
      ok: false as const,
      error: loadError(
        "Notifications unavailable",
        "Could not load schedule notifications.",
      ),
    })),
    listHrSftAttendanceReconcile({
      organizationId: input.organizationId,
      periodStart,
      periodEnd,
      limit: SFT_DEFAULT_PAGE_SIZE,
      search: input.attendanceReconcileSearch,
      visibleEmployeeIds: input.visibleEmployeeIds,
    }).then((window) => ({ ok: true as const, window })).catch(() => ({
      ok: false as const,
      error: loadError(
        "Attendance reconcile unavailable",
        "Could not compare scheduled shifts with attendance.",
      ),
    })),
    input.canViewPayrollRefs
      ? listHrSftPayrollReferencesForPeriod({
          organizationId: input.organizationId,
          periodStart,
          periodEnd,
          visibleEmployeeIds: input.visibleEmployeeIds,
        })
          .then((result) => ({ ok: true as const, result }))
          .catch(() => ({
            ok: false as const,
            error: loadError(
              "Payroll references unavailable",
              "Could not load shift payroll references.",
            ),
          }))
      : Promise.resolve(null),
    listHrSftReportDefinitions({
      organizationId: input.organizationId,
      limit: SFT_DEFAULT_PAGE_SIZE,
      search: input.reportDefinitionsSearch,
    }).then((window) => ({ ok: true as const, window })).catch(() => ({
      ok: false as const,
      error: loadError(
        "Report definitions unavailable",
        "Could not load saved shift report definitions.",
      ),
    })),
    input.canViewAudit
      ? listHrSftAuditTrailWindow({
          organizationId: input.organizationId,
          limit: SFT_DEFAULT_PAGE_SIZE,
          search: input.auditTrailSearch,
        })
          .then((window) => ({ ok: true as const, window }))
          .catch(() => ({
            ok: false as const,
            error: loadError(
              "Audit trail unavailable",
              "Could not load shift scheduling audit history.",
            ),
          }))
      : Promise.resolve(null),
  ]);

  const templatesWindow = templatesResult.ok
    ? templatesResult.window
    : { ...emptyWindow };
  const rosterWindow = rosterResult.ok ? rosterResult.window : { ...emptyWindow };
  const recurrenceWindow = recurrenceResult.ok
    ? recurrenceResult.window
    : { ...emptyWindow };
  const coverageWindow = coverageResult.ok
    ? coverageResult.window
    : { ...emptyWindow };
  const availabilityWindow = availabilityResult.ok
    ? availabilityResult.window
    : { ...emptyWindow };

  let payrollRefsList: ReturnType<typeof buildHrSftPayrollRefsListSurface> | undefined;
  let payrollRefsLoadError: EmptyState | undefined;

  if (payrollRefsResult) {
    if (payrollRefsResult.ok) {
      const payrollWindow: HrSftPayrollRefsWindow = {
        rows: payrollRefsResult.result.references,
        pageSize: SFT_DEFAULT_PAGE_SIZE,
        totalCount: payrollRefsResult.result.references.length,
        hasNextPage: false,
      };
      payrollRefsList = buildHrSftPayrollRefsListSurface({
        window: payrollWindow,
        searchValue: input.payrollRefsSearch,
      });
    } else {
      payrollRefsLoadError = payrollRefsResult.error;
    }
  }

  let auditTrailList: ReturnType<typeof buildHrSftAuditTrailListSurface> | undefined;
  let auditTrailLoadError: EmptyState | undefined;

  if (auditTrailResult) {
    if (auditTrailResult.ok) {
      auditTrailList = buildHrSftAuditTrailListSurface({
        window: auditTrailResult.window,
        searchValue: input.auditTrailSearch,
      });
    } else {
      auditTrailLoadError = auditTrailResult.error;
    }
  }

  return {
    accessScope: input.accessScope,
    canManage: input.canManage,
    canApprove: input.canApprove,
    canViewPayrollRefs: input.canViewPayrollRefs,
    canViewAudit: input.canViewAudit,
    templates: buildHrTimeSftTemplatesListSurface({
      window: templatesWindow,
      searchValue: input.templatesSearch,
    }),
    templatesLoadError: templatesResult.ok ? undefined : templatesResult.error,
    roster: buildHrTimeSftRosterListSurface({
      window: rosterWindow,
      searchValue: input.rosterSearch,
    }),
    rosterLoadError: rosterResult.ok ? undefined : rosterResult.error,
    recurrenceRules: buildHrTimeSftRecurrenceRulesListSurface({
      window: recurrenceWindow,
      searchValue: input.recurrenceRulesSearch,
    }),
    recurrenceRulesLoadError: recurrenceResult.ok
      ? undefined
      : recurrenceResult.error,
    coverage: buildHrTimeSftCoverageListSurface({
      window: coverageWindow,
      searchValue: input.coverageSearch,
    }),
    coverageLoadError: coverageResult.ok ? undefined : coverageResult.error,
    availability: buildHrTimeSftAvailabilityListSurface({
      window: availabilityWindow,
      searchValue: input.availabilitySearch,
    }),
    availabilityLoadError: availabilityResult.ok
      ? undefined
      : availabilityResult.error,
    swapPending:
      swapPendingResult?.ok === true
        ? buildHrTimeSftSwapPendingListSurface({
            window: swapPendingResult.window,
            searchValue: input.swapPendingSearch,
            canManage: input.canManage,
          })
        : undefined,
    swapPendingLoadError:
      swapPendingResult && !swapPendingResult.ok
        ? swapPendingResult.error
        : undefined,
    scheduleChangePending:
      scheduleChangePendingResult?.ok === true
        ? buildHrTimeSftScheduleChangePendingListSurface({
            window: scheduleChangePendingResult.window,
            searchValue: input.scheduleChangePendingSearch,
            canManage: input.canManage,
          })
        : undefined,
    scheduleChangePendingLoadError:
      scheduleChangePendingResult && !scheduleChangePendingResult.ok
        ? scheduleChangePendingResult.error
        : undefined,
    mySwaps:
      mySwapsResult?.ok === true
        ? buildHrTimeSftMySwapsListSurface({
            window: mySwapsResult.window,
            searchValue: input.mySwapsSearch,
          })
        : undefined,
    mySwapsLoadError:
      mySwapsResult && !mySwapsResult.ok ? mySwapsResult.error : undefined,
    myScheduleChanges:
      myScheduleChangesResult?.ok === true
        ? buildHrTimeSftMyScheduleChangesListSurface({
            window: myScheduleChangesResult.window,
            searchValue: input.myScheduleChangesSearch,
          })
        : undefined,
    myScheduleChangesLoadError:
      myScheduleChangesResult && !myScheduleChangesResult.ok
        ? myScheduleChangesResult.error
        : undefined,
    publications: buildHrSftPublicationsListSurface({
      window: publicationsResult.ok ? publicationsResult.window : { ...emptyWindow },
      searchValue: input.publicationsSearch,
    }),
    publicationsLoadError: publicationsResult.ok
      ? undefined
      : publicationsResult.error,
    notifications: buildHrSftNotificationsListSurface({
      window: notificationsResult.ok
        ? notificationsResult.window
        : { ...emptyWindow },
      searchValue: input.notificationsSearch,
    }),
    notificationsLoadError: notificationsResult.ok
      ? undefined
      : notificationsResult.error,
    attendanceReconcile: buildHrSftAttendanceReconcileListSurface({
      window: attendanceReconcileResult.ok
        ? attendanceReconcileResult.window
        : { ...emptyWindow },
      searchValue: input.attendanceReconcileSearch,
    }),
    attendanceReconcileLoadError: attendanceReconcileResult.ok
      ? undefined
      : attendanceReconcileResult.error,
    payrollRefs: payrollRefsList,
    payrollRefsLoadError,
    reportDefinitions: buildHrSftReportDefinitionsListSurface({
      window: reportDefinitionsResult.ok
        ? reportDefinitionsResult.window
        : { ...emptyWindow },
      searchValue: input.reportDefinitionsSearch,
    }),
    reportDefinitionsLoadError: reportDefinitionsResult.ok
      ? undefined
      : reportDefinitionsResult.error,
    auditTrail: auditTrailList,
    auditTrailLoadError,
    surfaceKeys: {
      templates: hrTimeSftTemplatesSurfaceKey,
      roster: hrTimeSftRosterSurfaceKey,
      recurrenceRules: hrTimeSftRecurrenceRulesSurfaceKey,
      coverage: hrTimeSftCoverageSurfaceKey,
      availability: hrTimeSftAvailabilitySurfaceKey,
      swapPending: hrTimeSftSwapPendingSurfaceKey,
      scheduleChangePending: hrTimeSftScheduleChangePendingSurfaceKey,
      mySwaps: hrTimeSftMySwapsSurfaceKey,
      myScheduleChanges: hrTimeSftMyScheduleChangesSurfaceKey,
      publications: hrSftPublicationsSurfaceKey,
      notifications: hrSftNotificationsSurfaceKey,
      attendanceReconcile: hrSftAttendanceReconcileSurfaceKey,
      payrollRefs: hrSftPayrollRefsSurfaceKey,
      reportDefinitions: hrSftReportDefinitionsSurfaceKey,
      auditTrail: hrSftAuditTrailSurfaceKey,
    },
  };
}
