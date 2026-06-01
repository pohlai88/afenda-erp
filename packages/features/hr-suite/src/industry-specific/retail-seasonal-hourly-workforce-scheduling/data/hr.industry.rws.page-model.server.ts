import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface";
import type { StatCardConfigurationResolvedInput } from "@afenda/governed-surface/schemas";

import type { HrIndustryRwsListRow } from "../contracts/hr.industry.rws.contract";
import type { HrRwsStatusFilter } from "../schemas/hr.industry.rws-constants.shared";
import { buildHrIndustryRwsListSurface } from "../surface/hr.industry.rws-lists.surface";
import { buildHrIndustryRwsOverviewStatGrid } from "../surface/hr.industry.rws-overview-stat.surface";
import {
  hrIndustryRwsAssignmentsSurfaceKey,
  hrIndustryRwsAttendanceComparisonSurfaceKey,
  hrIndustryRwsAuditTrailSurfaceKey,
  hrIndustryRwsAvailabilitySurfaceKey,
  hrIndustryRwsComplianceFindingsSurfaceKey,
  hrIndustryRwsCoverageSurfaceKey,
  hrIndustryRwsDemandReferencesSurfaceKey,
  hrIndustryRwsIntegrationExposuresSurfaceKey,
  hrIndustryRwsLaborBudgetsSurfaceKey,
  hrIndustryRwsNotificationsSurfaceKey,
  hrIndustryRwsOpenShiftsSurfaceKey,
  hrIndustryRwsPayrollReferencesSurfaceKey,
  hrIndustryRwsReportsSurfaceKey,
  hrIndustryRwsSchedulesSurfaceKey,
  hrIndustryRwsShiftSwapsSurfaceKey,
  type HrIndustryRwsListSurfaceKey,
} from "../surface/hr.industry.rws-surface-metadata.shared";
import { hrIndustryRwsUiCopy } from "../surface/hr.industry.rws-ui.copy.shared";
import type { HrIndustryRwsPageModelInput } from "./hr.industry.rws-search-params.parse.shared";
import {
  buildHrIndustryRwsReportRows,
  filterHrIndustryRwsRecordsForAccess,
  getHrIndustryRwsStore,
  type HrIndustryRwsStore,
} from "./hr.industry.rws-store.shared";

const RWS_DEFAULT_PAGE_SIZE = 25;

export type HrIndustryRwsPageModelListSection = {
  readonly surfaceKey: HrIndustryRwsListSurfaceKey;
  readonly title: string;
  readonly description: string;
  readonly listConfiguration: ListSurfaceRendererConfigurationResolvedInput;
};

export type HrIndustryRwsPageModel = {
  readonly title: string;
  readonly description: string;
  readonly canWrite: boolean;
  readonly canApprove: boolean;
  readonly canReadAudit: boolean;
  readonly canReadRestricted: boolean;
  readonly canReadLaborCost: boolean;
  readonly canExposeIntegrations: boolean;
  readonly reportGroupBy: HrIndustryRwsPageModelInput["reportGroupBy"];
  readonly status: HrIndustryRwsPageModelInput["status"];
  readonly overview: StatCardConfigurationResolvedInput;
  readonly sections: readonly HrIndustryRwsPageModelListSection[];
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
  return value ? value.slice(0, 10) : "Not recorded";
}

function formatList(values: readonly string[] | null | undefined) {
  if (!values || values.length === 0) return "None";
  return values.map(formatEnumLabel).join(", ");
}

function formatMoney(value: number, canReadLaborCost: boolean) {
  return canReadLaborCost ? value.toFixed(2) : "Restricted";
}

function filterRows<T extends SearchableRecord>(
  rows: readonly T[],
  searchValue?: string,
): T[] {
  if (!searchValue?.trim()) {
    return [...rows].slice(0, RWS_DEFAULT_PAGE_SIZE);
  }
  const needle = searchValue.trim().toLowerCase();
  return rows
    .filter((row) => JSON.stringify(row).toLowerCase().includes(needle))
    .slice(0, RWS_DEFAULT_PAGE_SIZE);
}

function rowMatchesStatus(
  row: {
    readonly status?: unknown;
    readonly budgetStatus?: unknown;
    readonly availabilityStatus?: unknown;
    readonly complianceStatus?: unknown;
    readonly severity?: unknown;
  },
  status: HrRwsStatusFilter,
) {
  if (status === "all") return true;
  return (
    row.status === status ||
    row.budgetStatus === status ||
    row.availabilityStatus === status ||
    row.complianceStatus === status ||
    row.severity === status
  );
}

function toneForStatus(value: string | undefined): HrIndustryRwsListRow["rowTone"] {
  if (!value) return undefined;
  if (
    [
      "blocked",
      "blocker",
      "over_budget",
      "understaffed",
      "validation_failed",
      "rejected",
      "overridden",
      "cancelled",
    ].includes(value)
  ) {
    return "critical";
  }
  if (
    [
      "draft",
      "changed",
      "pending_review",
      "pending_approval",
      "warning",
      "overstaffed",
      "posted",
      "claimed",
      "returned",
      "unavailable",
    ].includes(value)
  ) {
    return "attention";
  }
  return undefined;
}

function section(input: {
  readonly surfaceKey: HrIndustryRwsListSurfaceKey;
  readonly rows: readonly HrIndustryRwsListRow[];
  readonly searchValue?: string;
}): HrIndustryRwsPageModelListSection {
  const copy = hrIndustryRwsUiCopy.listSections[input.surfaceKey];
  return {
    surfaceKey: input.surfaceKey,
    title: copy.title,
    description: copy.description,
    listConfiguration: buildHrIndustryRwsListSurface(input),
  };
}

function redact(value: string | undefined, canReadRestricted: boolean) {
  if (!value) return "Not recorded";
  return canReadRestricted ? value : "Restricted";
}

function buildScheduleRows(
  store: HrIndustryRwsStore,
  input: HrIndustryRwsPageModelInput,
): HrIndustryRwsListRow[] {
  return store.retailSchedules
    .filter((row) => rowMatchesStatus(row, input.status))
    .map((row) => ({
      id: row.id,
      rowTone:
        toneForStatus(row.status) ??
        toneForStatus(row.budgetStatus) ??
        (row.coverageGapCount > 0 ? "attention" : undefined),
      cells: {
        schedule: `${row.scheduleCode} - ${row.title}`,
        scope: `${row.storeName} / ${row.departmentName} / ${row.roleName ?? "Mixed roles"}`,
        manager: row.managerDisplayName,
        period: `${formatEnumLabel(row.periodType)} ${formatDate(row.startDate)} to ${formatDate(row.endDate)}`,
        hours: row.scheduledHours,
        laborCost: formatMoney(row.scheduledLaborCost, input.canReadLaborCost),
        flags: `${row.coverageGapCount} gaps, ${row.overtimeRiskCount} overtime risks, ${row.complianceFindingCount} findings`,
        status: formatEnumLabel(row.status),
      },
    }));
}

function buildAssignmentRows(
  store: HrIndustryRwsStore,
  input: HrIndustryRwsPageModelInput,
): HrIndustryRwsListRow[] {
  void store;
  return store.shiftAssignments
    .filter((row) => rowMatchesStatus(row, input.status))
    .map((row) => ({
      id: row.id,
      rowTone:
        toneForStatus(row.complianceStatus) ??
        toneForStatus(row.availabilityStatus),
      cells: {
        employee: row.employeeDisplayName,
        storeDepartment: `${row.storeName} / ${row.departmentName}`,
        roleShift: `${formatEnumLabel(row.roleName)} / ${formatEnumLabel(row.shiftType)}`,
        shiftWindow: `${formatDate(row.shiftDate)} ${row.startTime}-${row.endTime}`,
        workerType: formatEnumLabel(row.workerType),
        availability: formatEnumLabel(row.availabilityStatus),
        skillStatus: row.skillValidated
          ? formatList(row.certificationRefs)
          : "Missing skill or certification",
        compliance: formatEnumLabel(row.complianceStatus),
      },
    }));
}

function buildAvailabilityRows(
  store: HrIndustryRwsStore,
  input: HrIndustryRwsPageModelInput,
): HrIndustryRwsListRow[] {
  const preferenceRows = store.availabilityPreferences
    .filter((row) => rowMatchesStatus(row, input.status))
    .map((row) => ({
      id: row.id,
      rowTone: toneForStatus(row.status),
      cells: {
        employee: row.employeeDisplayName,
        availability: `${row.dayOfWeek} ${row.timeWindow} ${formatEnumLabel(row.shiftType)}`,
        blockedDate: "None",
        reason: "Preference",
        maxHours: row.maxWeeklyHours,
        status: formatEnumLabel(row.status),
      },
    }));

  const blockedRows = store.blockedDates
    .filter((row) => rowMatchesStatus(row, input.status))
    .map(
      (row): HrIndustryRwsListRow => ({
        id: row.id,
        rowTone: row.status === "active" ? "attention" : undefined,
        cells: {
          employee: row.employeeDisplayName,
          availability: "Blocked date",
          blockedDate: formatDate(row.blockedDate),
          reason: redact(row.reason, input.canReadRestricted),
          maxHours: "Not applicable",
          status: formatEnumLabel(row.status),
        },
      }),
    );

  return [...preferenceRows, ...blockedRows];
}

function buildCoverageRows(
  store: HrIndustryRwsStore,
  input: HrIndustryRwsPageModelInput,
): HrIndustryRwsListRow[] {
  return store.coverageRequirements
    .filter((row) => rowMatchesStatus(row, input.status))
    .map((row) => ({
      id: row.id,
      rowTone: toneForStatus(row.status),
      cells: {
        coverage: `${formatDate(row.coverageDate)} ${row.hourWindow}`,
        storeDepartment: `${row.storeName} / ${row.departmentName}`,
        role: formatEnumLabel(row.roleName),
        window: row.hourWindow,
        required: row.requiredCount,
        scheduled: row.scheduledCount,
        status: formatEnumLabel(row.status),
      },
    }));
}

function buildOpenShiftRows(
  store: HrIndustryRwsStore,
  input: HrIndustryRwsPageModelInput,
): HrIndustryRwsListRow[] {
  return store.openShifts
    .filter((row) => rowMatchesStatus(row, input.status))
    .map((row) => ({
      id: row.id,
      rowTone: toneForStatus(row.status),
      cells: {
        openShift: `${formatEnumLabel(row.shiftType)} ${formatDate(row.shiftDate)}`,
        storeDepartment: `${row.storeName} / ${row.departmentName}`,
        role: formatEnumLabel(row.roleName),
        shiftWindow: `${row.startTime}-${row.endTime}`,
        approval: row.approvalRequired ? "Manager approval required" : "Auto-claim",
        claimant: row.claimantDisplayName ?? "Unclaimed",
        eligibleCount: row.eligibleEmployeeIds.length,
        status: formatEnumLabel(row.status),
      },
    }));
}

function buildSwapRows(
  store: HrIndustryRwsStore,
  input: HrIndustryRwsPageModelInput,
): HrIndustryRwsListRow[] {
  return store.shiftSwapRequests
    .filter((row) => rowMatchesStatus(row, input.status))
    .map((row) => ({
      id: row.id,
      rowTone: toneForStatus(row.status),
      cells: {
        swap: `${row.requesterDisplayName} -> ${row.replacementDisplayName}`,
        requester: row.requesterDisplayName,
        replacement: row.replacementDisplayName,
        shiftRefs: `${row.originalShiftRef} / ${row.replacementShiftRef}`,
        validation: formatList(row.validationFlags),
        workflow: row.approvalWorkflowRef ?? "No workflow",
        reason: redact(row.decisionReason, input.canReadRestricted),
        status: formatEnumLabel(row.status),
      },
    }));
}

export async function buildHrIndustryRwsPageModel(
  input: HrIndustryRwsPageModelInput,
): Promise<HrIndustryRwsPageModel> {
  const store = getHrIndustryRwsStore(input.organizationId);
  const visibleStore = filterHrIndustryRwsRecordsForAccess({
    store,
    visibleEmployeeIds: input.visibleEmployeeIds,
  });
  const reportRows = buildHrIndustryRwsReportRows({
    store: visibleStore,
    groupBy: input.reportGroupBy,
  });
  const overview = buildHrIndustryRwsOverviewStatGrid({
    snapshot: {
      scheduleCount: visibleStore.retailSchedules.length,
      assignmentCount: visibleStore.shiftAssignments.length,
      coverageGapCount: visibleStore.coverageRequirements.filter(
        (row) => row.status !== "balanced",
      ).length,
      overBudgetScheduleCount: visibleStore.retailSchedules.filter(
        (row) => row.budgetStatus === "over_budget",
      ).length,
      overtimeRiskCount: visibleStore.retailSchedules.reduce(
        (total, row) => total + row.overtimeRiskCount,
        0,
      ),
      complianceFindingCount: visibleStore.complianceFindings.length,
    },
  });

  const sections: HrIndustryRwsPageModelListSection[] = [
    section({
      surfaceKey: hrIndustryRwsSchedulesSurfaceKey,
      searchValue: input.schedulesSearch,
      rows: filterRows(
        buildScheduleRows(visibleStore, input),
        input.schedulesSearch,
      ),
    }),
    section({
      surfaceKey: hrIndustryRwsAssignmentsSurfaceKey,
      searchValue: input.assignmentsSearch,
      rows: filterRows(
        buildAssignmentRows(visibleStore, input),
        input.assignmentsSearch,
      ),
    }),
    section({
      surfaceKey: hrIndustryRwsAvailabilitySurfaceKey,
      searchValue: input.availabilitySearch,
      rows: filterRows(
        buildAvailabilityRows(visibleStore, input),
        input.availabilitySearch,
      ),
    }),
    section({
      surfaceKey: hrIndustryRwsCoverageSurfaceKey,
      searchValue: input.coverageSearch,
      rows: filterRows(
        buildCoverageRows(visibleStore, input),
        input.coverageSearch,
      ),
    }),
    section({
      surfaceKey: hrIndustryRwsOpenShiftsSurfaceKey,
      searchValue: input.openShiftsSearch,
      rows: filterRows(
        buildOpenShiftRows(visibleStore, input),
        input.openShiftsSearch,
      ),
    }),
    section({
      surfaceKey: hrIndustryRwsShiftSwapsSurfaceKey,
      searchValue: input.shiftSwapsSearch,
      rows: filterRows(buildSwapRows(visibleStore, input), input.shiftSwapsSearch),
    }),
    section({
      surfaceKey: hrIndustryRwsDemandReferencesSurfaceKey,
      searchValue: input.demandReferencesSearch,
      rows: filterRows(
        visibleStore.laborDemandReferences,
        input.demandReferencesSearch,
      ).map((row) => ({
        id: row.id,
        cells: {
          demand: `${formatEnumLabel(row.demandSource)} demand`,
          store: row.storeName,
          period: row.periodLabel,
          source: formatEnumLabel(row.demandSource),
          demandValue: row.demandValue,
          requiredHours: row.requiredHours,
          reference: row.referenceRef,
        },
      })),
    }),
  ];

  if (input.canReadLaborCost) {
    sections.push(
      section({
        surfaceKey: hrIndustryRwsLaborBudgetsSurfaceKey,
        searchValue: input.laborBudgetsSearch,
        rows: filterRows(
          visibleStore.laborBudgetSnapshots.filter((row) =>
            rowMatchesStatus(row, input.status),
          ),
          input.laborBudgetsSearch,
        ).map((row) => ({
          id: row.id,
          rowTone: toneForStatus(row.status),
          cells: {
            budget: row.scheduleId,
            storeDepartment: `${row.storeName} / ${row.departmentName}`,
            scheduledHours: row.scheduledHours,
            scheduledLaborCost: row.scheduledLaborCost.toFixed(2),
            budgetAmount: row.budgetAmount.toFixed(2),
            variance: row.varianceAmount.toFixed(2),
            status: formatEnumLabel(row.status),
          },
        })),
      }),
    );
  }

  sections.push(
    section({
      surfaceKey: hrIndustryRwsComplianceFindingsSurfaceKey,
      searchValue: input.complianceFindingsSearch,
      rows: filterRows(
        visibleStore.complianceFindings.filter((row) =>
          rowMatchesStatus(row, input.status),
        ),
        input.complianceFindingsSearch,
      ).map((row) => ({
        id: row.id,
        rowTone: toneForStatus(row.severity),
        cells: {
          finding: redact(row.finding, input.canReadRestricted),
          employee: redact(row.employeeDisplayName, input.canReadRestricted),
          rule: formatEnumLabel(row.rule),
          severity: formatEnumLabel(row.severity),
          override: row.overrideRequired ? "Required" : "Not required",
          reason: redact(row.overrideReason, input.canReadRestricted),
        },
      })),
    }),
    section({
      surfaceKey: hrIndustryRwsNotificationsSurfaceKey,
      searchValue: input.notificationsSearch,
      rows: filterRows(
        visibleStore.notifications.filter((row) =>
          rowMatchesStatus(row, input.status),
        ),
        input.notificationsSearch,
      ).map((row) => ({
        id: row.id,
        rowTone: toneForStatus(row.status),
        cells: {
          notification: formatEnumLabel(row.notificationType),
          employee: row.employeeDisplayName ?? "Audience notice",
          target: row.targetRef,
          recipients: row.recipients.join(", "),
          generatedAt: formatDate(row.generatedAt),
          status: formatEnumLabel(row.status),
        },
      })),
    }),
    section({
      surfaceKey: hrIndustryRwsAttendanceComparisonSurfaceKey,
      searchValue: input.attendanceComparisonSearch,
      rows: filterRows(
        visibleStore.attendanceComparisons.filter((row) =>
          rowMatchesStatus(row, input.status),
        ),
        input.attendanceComparisonSearch,
      ).map((row) => ({
        id: row.id,
        rowTone: row.status === "variance" ? "attention" : undefined,
        cells: {
          employee: row.employeeDisplayName,
          scheduledHours: row.scheduledHours,
          actualHours: row.actualHours,
          variance: row.varianceHours,
          attendanceOutcomeRef: row.attendanceOutcomeRef,
          status: formatEnumLabel(row.status),
        },
      })),
    }),
    section({
      surfaceKey: hrIndustryRwsPayrollReferencesSurfaceKey,
      searchValue: input.payrollReferencesSearch,
      rows: filterRows(
        visibleStore.payrollReferences.filter((row) =>
          rowMatchesStatus(row, input.status),
        ),
        input.payrollReferencesSearch,
      ).map((row) => ({
        id: row.id,
        rowTone: toneForStatus(row.status),
        cells: {
          employee: row.employeeDisplayName,
          scheduledHours: row.scheduledHours,
          actualHoursRef: row.actualHoursRef ?? "Pending",
          shiftPremiumRef: row.shiftPremiumRef ?? "None",
          holidayWorkRef: row.holidayWorkRef ?? "None",
          attendanceOutcomeRef: row.attendanceOutcomeRef,
          status: formatEnumLabel(row.status),
        },
      })),
    }),
    section({
      surfaceKey: hrIndustryRwsReportsSurfaceKey,
      searchValue: input.reportsSearch,
      rows: filterRows(reportRows, input.reportsSearch).map((row) => ({
        id: row.id,
        rowTone:
          row.coverageGapCount + row.overtimeRiskCount + row.complianceFindingCount >
          0
            ? "attention"
            : undefined,
        cells: {
          groupLabel: row.groupLabel,
          scheduleCount: row.scheduleCount,
          assignmentCount: row.assignmentCount,
          scheduledHours: row.scheduledHours,
          scheduledLaborCost: formatMoney(
            row.scheduledLaborCost,
            input.canReadLaborCost,
          ),
          budgetVariance: formatMoney(row.budgetVariance, input.canReadLaborCost),
          coverageGapCount: row.coverageGapCount,
          riskFindings: row.overtimeRiskCount + row.complianceFindingCount,
        },
      })),
    }),
  );

  if (input.canExposeIntegrations) {
    sections.push(
      section({
        surfaceKey: hrIndustryRwsIntegrationExposuresSurfaceKey,
        searchValue: input.integrationExposuresSearch,
        rows: filterRows(
          visibleStore.integrationExposures.filter((row) =>
            rowMatchesStatus(row, input.status),
          ),
          input.integrationExposuresSearch,
        ).map((row) => ({
          id: row.id,
          rowTone: toneForStatus(row.status),
          cells: {
            integrationTarget: formatEnumLabel(row.integrationTarget),
            employee: row.employeeDisplayName ?? "Shared reference",
            sourceRef: row.sourceRef,
            summary: row.summary,
            exposedAt: formatDate(row.exposedAt),
            status: formatEnumLabel(row.status),
          },
        })),
      }),
    );
  }

  if (input.canReadAudit) {
    sections.push(
      section({
        surfaceKey: hrIndustryRwsAuditTrailSurfaceKey,
        searchValue: input.auditTrailSearch,
        rows: filterRows(visibleStore.auditEvents, input.auditTrailSearch).map(
          (event) => ({
            id: event.id,
            cells: {
              summary: event.summary,
              action: event.action,
              actorId: event.actorId,
              targetType: formatEnumLabel(event.targetType),
              employeeId: event.employeeId ?? "System",
              occurredAt: formatDate(event.occurredAt),
            },
          }),
        ),
      }),
    );
  }

  return {
    title: hrIndustryRwsUiCopy.page.title,
    description: hrIndustryRwsUiCopy.page.description,
    canWrite: input.canWrite,
    canApprove: input.canApprove,
    canReadAudit: input.canReadAudit,
    canReadRestricted: input.canReadRestricted,
    canReadLaborCost: input.canReadLaborCost,
    canExposeIntegrations: input.canExposeIntegrations,
    reportGroupBy: input.reportGroupBy,
    status: input.status,
    overview,
    sections,
    workbenchList:
      sections.find(
        (candidate) =>
          candidate.surfaceKey === hrIndustryRwsAssignmentsSurfaceKey,
      )?.listConfiguration ??
      buildHrIndustryRwsListSurface({
        surfaceKey: hrIndustryRwsAssignmentsSurfaceKey,
        rows: [],
      }),
  };
}
