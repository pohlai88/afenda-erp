import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface";
import type { StatCardConfigurationResolvedInput } from "@afenda/governed-surface/schemas";

import type { HrIndustryFrmListRow } from "../contracts/hr.industry.frm.contract";
import { hrIndustryFrmAssignmentDetailRoutePath } from "../contracts/hr.industry.frm-route.contract";
import { buildHrIndustryFrmListSurface } from "../surface/hr.industry.frm-lists.surface";
import { buildHrIndustryFrmOverviewStatGrid } from "../surface/hr.industry.frm-overview-stat.surface";
import {
  hrIndustryFrmAssignmentsSurfaceKey,
  hrIndustryFrmAttendanceExceptionsSurfaceKey,
  hrIndustryFrmAttendanceExportsSurfaceKey,
  hrIndustryFrmAuditTrailSurfaceKey,
  hrIndustryFrmMobileAttendanceSurfaceKey,
  hrIndustryFrmNotificationsSurfaceKey,
  hrIndustryFrmOfflineSyncSurfaceKey,
  hrIndustryFrmOvertimeExportsSurfaceKey,
  hrIndustryFrmPayrollExportsSurfaceKey,
  hrIndustryFrmPerDiemRatesSurfaceKey,
  hrIndustryFrmPerDiemReferencesSurfaceKey,
  hrIndustryFrmReportsSurfaceKey,
  hrIndustryFrmSafetyConfirmationsSurfaceKey,
  hrIndustryFrmSchedulesSurfaceKey,
  hrIndustryFrmTeamAvailabilitySurfaceKey,
  hrIndustryFrmTravelComplianceSurfaceKey,
  hrIndustryFrmTravelStatusesSurfaceKey,
  hrIndustryFrmWorksitesSurfaceKey,
  type HrIndustryFrmListSurfaceKey,
} from "../surface/hr.industry.frm-surface-metadata.shared";
import { hrIndustryFrmUiCopy } from "../surface/hr.industry.frm-ui.copy.shared";
import type { HrIndustryFrmPageModelInput } from "./hr.industry.frm-search-params.parse.shared";
import {
  buildHrIndustryFrmReportRows,
  buildHrIndustryFrmTeamAvailabilityRows,
  filterHrIndustryFrmRecordsForAccess,
  getHrIndustryFrmStore,
  listHrIndustryFrmAttendanceOutcomeRefs,
  listHrIndustryFrmOvertimeWorkHourRefs,
  listHrIndustryFrmPayrollReferences,
  type HrIndustryFrmStore,
} from "./hr.industry.frm-store.shared";

const FRM_DEFAULT_PAGE_SIZE = 25;

export type HrIndustryFrmPageModelListSection = {
  readonly surfaceKey: HrIndustryFrmListSurfaceKey;
  readonly title: string;
  readonly description: string;
  readonly listConfiguration: ListSurfaceRendererConfigurationResolvedInput;
};

export type HrIndustryFrmPageModel = {
  readonly title: string;
  readonly description: string;
  readonly canWrite: boolean;
  readonly canApprove: boolean;
  readonly canReadRestricted: boolean;
  readonly canExposeIntegrations: boolean;
  readonly reportGroupBy: HrIndustryFrmPageModelInput["reportGroupBy"];
  readonly overview: StatCardConfigurationResolvedInput;
  readonly sections: readonly HrIndustryFrmPageModelListSection[];
  readonly workbenchList: ListSurfaceRendererConfigurationResolvedInput;
};

type SearchableRecord = { readonly id: string };

function formatEnumLabel(value: string | null | undefined) {
  if (!value) return "Not recorded";
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value: string | null | undefined) {
  return value ? value.slice(0, 10) : "Not scheduled";
}

function formatMoney(amount: number, currency = "MYR") {
  return `${currency} ${amount.toLocaleString("en-MY")}`;
}

function filterRows<T extends SearchableRecord>(
  rows: readonly T[],
  searchValue?: string,
): T[] {
  if (!searchValue?.trim()) {
    return [...rows].slice(0, FRM_DEFAULT_PAGE_SIZE);
  }
  const needle = searchValue.trim().toLowerCase();
  return rows
    .filter((row) => JSON.stringify(row).toLowerCase().includes(needle))
    .slice(0, FRM_DEFAULT_PAGE_SIZE);
}

function toneForStatus(value: string): HrIndustryFrmListRow["rowTone"] {
  if (
    [
      "critical",
      "outside_site_check_in",
      "non_compliant",
      "destination_restricted",
      "documents_missing",
      "insurance_missing",
      "missing_checkout",
    ].includes(value)
  ) {
    return "critical";
  }
  if (
    [
      "high",
      "medium",
      "open",
      "reviewing",
      "queued",
      "duty_of_care_open",
      "reconciled",
    ].includes(value)
  ) {
    return "attention";
  }
  return undefined;
}

function section(input: {
  readonly surfaceKey: HrIndustryFrmListSurfaceKey;
  readonly rows: readonly HrIndustryFrmListRow[];
  readonly searchValue?: string;
}): HrIndustryFrmPageModelListSection {
  const copy = hrIndustryFrmUiCopy.listSections[input.surfaceKey];
  return {
    surfaceKey: input.surfaceKey,
    title: copy.title,
    description: copy.description,
    listConfiguration: buildHrIndustryFrmListSurface(input),
  };
}

function indexStore(store: HrIndustryFrmStore) {
  return {
    siteById: new Map(store.worksites.map((site) => [site.id, site])),
    assignmentById: new Map(
      store.assignments.map((assignment) => [assignment.id, assignment]),
    ),
  };
}

export async function buildHrIndustryFrmPageModel(
  input: HrIndustryFrmPageModelInput,
): Promise<HrIndustryFrmPageModel> {
  const store = getHrIndustryFrmStore(input.organizationId);
  const visibleStore = filterHrIndustryFrmRecordsForAccess({
    store,
    visibleEmployeeIds: input.visibleEmployeeIds,
  });
  const { siteById } = indexStore(visibleStore);
  const reportRows = buildHrIndustryFrmReportRows({
    store: visibleStore,
    groupBy: input.reportGroupBy,
  });
  const overview = buildHrIndustryFrmOverviewStatGrid({
    snapshot: {
      activeAssignmentCount: visibleStore.assignments.filter(
        (assignment) => assignment.status === "active",
      ).length,
      mobileEventCount: visibleStore.mobileAttendance.length,
      openExceptionCount: visibleStore.attendanceExceptions.filter(
        (exception) =>
          exception.status !== "resolved" && exception.status !== "waived",
      ).length,
      travelComplianceRiskCount: visibleStore.travelCompliance.filter(
        (row) => row.complianceStatus !== "compliant",
      ).length,
      approvedPerDiemAmount: visibleStore.perDiemReferences
        .filter((row) => row.approvalStatus === "approved")
        .reduce((sum, row) => sum + row.amount, 0),
      offlineReconciledCount: visibleStore.offlineSync.filter(
        (row) => row.status === "reconciled",
      ).length,
    },
  });

  const sections: HrIndustryFrmPageModelListSection[] = [
    section({
      surfaceKey: hrIndustryFrmWorksitesSurfaceKey,
      rows: filterRows(visibleStore.worksites, input.worksitesSearch).map(
        (site) => ({
          id: site.id,
          cells: {
            name: site.name,
            locationType: formatEnumLabel(site.locationType),
            legalEntity: site.legalEntity,
            region: site.region,
            geofenceRef: input.canReadRestricted
              ? site.geofenceRef
              : "Restricted",
            approvedRemote: site.approvedRemote,
          },
        }),
      ),
      searchValue: input.worksitesSearch,
    }),
    section({
      surfaceKey: hrIndustryFrmAssignmentsSurfaceKey,
      rows: filterRows(visibleStore.assignments, input.assignmentsSearch).map(
        (assignment) => {
          const site = siteById.get(assignment.worksiteId);
          return {
            id: assignment.id,
            rowHref: hrIndustryFrmAssignmentDetailRoutePath(assignment.id),
            cells: {
              employeeDisplayName: assignment.employeeDisplayName,
              worksiteName: site?.name ?? assignment.worksiteId,
              assignmentType: formatEnumLabel(assignment.assignmentType),
              managerDisplayName: assignment.managerDisplayName,
              departmentName: assignment.departmentName,
              dateRange: `${formatDate(assignment.startDate)} - ${formatDate(assignment.endDate)}`,
              status: formatEnumLabel(assignment.status),
            },
          };
        },
      ),
      searchValue: input.assignmentsSearch,
    }),
    section({
      surfaceKey: hrIndustryFrmMobileAttendanceSurfaceKey,
      rows: filterRows(
        visibleStore.mobileAttendance,
        input.mobileAttendanceSearch,
      ).map((event) => ({
        id: event.id,
        rowTone: toneForStatus(event.gpsValidationResult),
        cells: {
          employeeDisplayName: event.employeeDisplayName,
          eventType: formatEnumLabel(event.eventType),
          capturedAt: formatDate(event.capturedAt),
          gpsValidationRef: input.canReadRestricted
            ? event.gpsValidationRef
            : "Restricted",
          gpsValidationResult: formatEnumLabel(event.gpsValidationResult),
          offline: event.offline,
        },
      })),
      searchValue: input.mobileAttendanceSearch,
    }),
    section({
      surfaceKey: hrIndustryFrmAttendanceExceptionsSurfaceKey,
      rows: filterRows(
        visibleStore.attendanceExceptions,
        input.attendanceExceptionsSearch,
      ).map((exception) => ({
        id: exception.id,
        rowTone: toneForStatus(exception.exceptionType) ?? toneForStatus(exception.severity),
        cells: {
          employeeDisplayName: exception.employeeDisplayName,
          exceptionType: formatEnumLabel(exception.exceptionType),
          severity: formatEnumLabel(exception.severity),
          status: formatEnumLabel(exception.status),
          detectedAt: formatDate(exception.detectedAt),
          correctionRef: exception.correctionRef ?? "Pending",
        },
      })),
      searchValue: input.attendanceExceptionsSearch,
    }),
    section({
      surfaceKey: hrIndustryFrmOfflineSyncSurfaceKey,
      rows: filterRows(visibleStore.offlineSync, input.offlineSyncSearch).map(
        (sync) => ({
          id: sync.id,
          rowTone: toneForStatus(sync.status),
          cells: {
            employeeDisplayName: sync.employeeDisplayName,
            attendanceEventId: sync.attendanceEventId,
            capturedAt: formatDate(sync.capturedAt),
            syncedAt: formatDate(sync.syncedAt),
            status: formatEnumLabel(sync.status),
            reconciliationNote: sync.reconciliationNote ?? "Not reconciled",
          },
        }),
      ),
      searchValue: input.offlineSyncSearch,
    }),
    section({
      surfaceKey: hrIndustryFrmSchedulesSurfaceKey,
      rows: filterRows(visibleStore.schedules, input.schedulesSearch).map(
        (schedule) => ({
          id: schedule.id,
          cells: {
            employeeDisplayName: schedule.employeeDisplayName,
            worksiteName: siteById.get(schedule.worksiteId)?.name ?? schedule.worksiteId,
            date: formatDate(schedule.date),
            projectCode: schedule.projectCode,
            routeCode: schedule.routeCode,
            clientName: schedule.clientName,
          },
        }),
      ),
      searchValue: input.schedulesSearch,
    }),
    section({
      surfaceKey: hrIndustryFrmTravelStatusesSurfaceKey,
      rows: filterRows(
        visibleStore.travelStatuses,
        input.travelStatusesSearch,
      ).map((travel) => ({
        id: travel.id,
        rowTone: toneForStatus(travel.status),
        cells: {
          employeeDisplayName: travel.employeeDisplayName,
          travelType: formatEnumLabel(travel.travelType),
          status: formatEnumLabel(travel.status),
          destination: input.canReadRestricted ? travel.destination : "Restricted",
          durationHours: `${travel.durationHours}h`,
          approvalRef: travel.approvalRef ?? "Not required",
        },
      })),
      searchValue: input.travelStatusesSearch,
    }),
    section({
      surfaceKey: hrIndustryFrmPerDiemRatesSurfaceKey,
      rows: filterRows(visibleStore.perDiemRates, input.perDiemRatesSearch).map(
        (rate) => ({
          id: rate.id,
          cells: {
            location: [rate.country, rate.city, rate.region].filter(Boolean).join(" / "),
            travelType: formatEnumLabel(rate.travelType),
            allowanceType: formatEnumLabel(rate.allowanceType),
            projectCode: rate.projectCode ?? "Any project",
            grade: rate.grade ?? "Any grade",
            amount: input.canReadRestricted
              ? formatMoney(rate.amount, rate.currency)
              : "Restricted",
          },
        }),
      ),
      searchValue: input.perDiemRatesSearch,
    }),
    section({
      surfaceKey: hrIndustryFrmPerDiemReferencesSurfaceKey,
      rows: filterRows(
        visibleStore.perDiemReferences,
        input.perDiemReferencesSearch,
      ).map((ref) => ({
        id: ref.id,
        cells: {
          employeeDisplayName: ref.employeeDisplayName,
          allowanceType: formatEnumLabel(ref.allowanceType),
          eligible: ref.eligible,
          eligibleDays: ref.eligibleDays,
          amount: input.canReadRestricted
            ? formatMoney(ref.amount, ref.currency)
            : "Restricted",
          approvalStatus: formatEnumLabel(ref.approvalStatus),
        },
      })),
      searchValue: input.perDiemReferencesSearch,
    }),
    section({
      surfaceKey: hrIndustryFrmTravelComplianceSurfaceKey,
      rows: filterRows(
        visibleStore.travelCompliance,
        input.travelComplianceSearch,
      ).map((row) => ({
        id: row.id,
        rowTone: toneForStatus(row.complianceStatus),
        cells: {
          employeeDisplayName: row.employeeDisplayName,
          complianceStatus: formatEnumLabel(row.complianceStatus),
          approvalRef: row.approvalRef ?? "Missing or not required",
          requiredDocumentRef: input.canReadRestricted
            ? (row.requiredDocumentRef ?? "Missing")
            : "Restricted",
          insuranceRef: input.canReadRestricted
            ? (row.insuranceRef ?? "Missing")
            : "Restricted",
          dutyOfCareStatus: formatEnumLabel(row.dutyOfCareStatus),
        },
      })),
      searchValue: input.travelComplianceSearch,
    }),
    section({
      surfaceKey: hrIndustryFrmSafetyConfirmationsSurfaceKey,
      rows: filterRows(
        visibleStore.safetyConfirmations,
        input.safetyConfirmationsSearch,
      ).map((row) => ({
        id: row.id,
        cells: {
          employeeDisplayName: row.employeeDisplayName,
          confirmationType: formatEnumLabel(row.confirmationType),
          confirmedAt: formatDate(row.confirmedAt),
          emergencyContactRef: input.canReadRestricted
            ? (row.emergencyContactRef ?? "Not linked")
            : "Restricted",
          gpsValidationRef: input.canReadRestricted
            ? (row.gpsValidationRef ?? "Not linked")
            : "Restricted",
        },
      })),
      searchValue: input.safetyConfirmationsSearch,
    }),
    section({
      surfaceKey: hrIndustryFrmTeamAvailabilitySurfaceKey,
      rows: filterRows(
        buildHrIndustryFrmTeamAvailabilityRows(visibleStore),
        input.teamAvailabilitySearch,
      ).map((row) => ({
        id: row.id,
        rowTone: row.availability === "exception" ? "attention" : undefined,
        cells: {
          employeeDisplayName: row.employeeDisplayName,
          worksiteName: row.worksiteName,
          assignmentStatus: formatEnumLabel(row.assignmentStatus),
          travelStatus: formatEnumLabel(row.travelStatus),
          openExceptionCount: row.openExceptionCount,
          availability: formatEnumLabel(row.availability),
        },
      })),
      searchValue: input.teamAvailabilitySearch,
    }),
    section({
      surfaceKey: hrIndustryFrmNotificationsSurfaceKey,
      rows: filterRows(
        visibleStore.notifications,
        input.notificationsSearch,
      ).map((notice) => ({
        id: notice.id,
        rowTone: toneForStatus(notice.severity),
        cells: {
          audience: formatEnumLabel(notice.audience),
          subject: notice.subject,
          severity: formatEnumLabel(notice.severity),
          status: formatEnumLabel(notice.status),
          targetRef: notice.targetRef,
          sentAt: formatDate(notice.sentAt),
        },
      })),
      searchValue: input.notificationsSearch,
    }),
    section({
      surfaceKey: hrIndustryFrmReportsSurfaceKey,
      rows: filterRows(reportRows, input.reportsSearch).map((row) => ({
        id: row.id,
        rowTone: row.exceptionCount > 0 ? "attention" : undefined,
        cells: {
          groupLabel: row.groupLabel,
          assignmentCount: row.assignmentCount,
          activeWorkerCount: row.activeWorkerCount,
          exceptionCount: row.exceptionCount,
          travelCount: row.travelCount,
          perDiemAmount: input.canReadRestricted
            ? formatMoney(row.perDiemAmount)
            : "Restricted",
        },
      })),
      searchValue: input.reportsSearch,
    }),
  ];

  if (input.canExposeIntegrations) {
    sections.push(
      section({
        surfaceKey: hrIndustryFrmAttendanceExportsSurfaceKey,
        rows: filterRows(
          listHrIndustryFrmAttendanceOutcomeRefs(visibleStore),
          input.attendanceExportsSearch,
        ).map((ref) => ({
          id: ref.id,
          rowTone: ref.outcome === "exception" ? "attention" : undefined,
          cells: {
            employeeDisplayName: ref.employeeDisplayName,
            workDate: formatDate(ref.workDate),
            outcome: formatEnumLabel(ref.outcome),
            gpsValidationRef: input.canReadRestricted
              ? ref.gpsValidationRef
              : "Restricted",
            leaveAttendanceRef: ref.leaveAttendanceRef,
          },
        })),
        searchValue: input.attendanceExportsSearch,
      }),
      section({
        surfaceKey: hrIndustryFrmOvertimeExportsSurfaceKey,
        rows: filterRows(
          listHrIndustryFrmOvertimeWorkHourRefs(visibleStore),
          input.overtimeExportsSearch,
        ).map((ref) => ({
          id: ref.id,
          cells: {
            employeeDisplayName: ref.employeeDisplayName,
            workDate: formatDate(ref.workDate),
            actualHours: ref.actualHours,
            overtimeEligible: ref.overtimeEligible,
            assignmentId: ref.assignmentId,
          },
        })),
        searchValue: input.overtimeExportsSearch,
      }),
      section({
        surfaceKey: hrIndustryFrmPayrollExportsSurfaceKey,
        rows: filterRows(
          listHrIndustryFrmPayrollReferences(visibleStore),
          input.payrollExportsSearch,
        ).map((ref) => ({
          id: ref.id,
          cells: {
            employeeDisplayName: ref.employeeDisplayName,
            referenceType: formatEnumLabel(ref.referenceType),
            sourceRef: ref.sourceRef,
            amount:
              ref.amount === undefined || !input.canReadRestricted
                ? "Restricted"
                : formatMoney(ref.amount, ref.currency),
            payrollPeriod: ref.payrollPeriod,
          },
        })),
        searchValue: input.payrollExportsSearch,
      }),
    );
  }

  if (input.canReadAudit) {
    sections.push(
      section({
        surfaceKey: hrIndustryFrmAuditTrailSurfaceKey,
        rows: filterRows(visibleStore.auditEvents, input.auditTrailSearch).map(
          (event) => ({
            id: event.id,
            cells: {
              summary: event.summary,
              action: event.action,
              actorId: event.actorId,
              targetType: formatEnumLabel(event.targetType),
              occurredAt: formatDate(event.occurredAt),
            },
          }),
        ),
        searchValue: input.auditTrailSearch,
      }),
    );
  }

  return {
    title: hrIndustryFrmUiCopy.page.title,
    description: hrIndustryFrmUiCopy.page.description,
    canWrite: input.canWrite,
    canApprove: input.canApprove,
    canReadRestricted: input.canReadRestricted,
    canExposeIntegrations: input.canExposeIntegrations,
    reportGroupBy: input.reportGroupBy,
    overview,
    sections,
    workbenchList:
      sections[1]?.listConfiguration ??
      buildHrIndustryFrmListSurface({
        surfaceKey: hrIndustryFrmAssignmentsSurfaceKey,
        rows: [],
      }),
  };
}
