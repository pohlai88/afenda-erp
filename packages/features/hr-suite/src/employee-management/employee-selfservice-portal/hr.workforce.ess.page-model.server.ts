import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface";
import type { StatCardConfigurationResolvedInput } from "@afenda/governed-surface/schemas";

import type { HrWorkforceEssListRow } from "./hr.workforce.ess.contract";
import { buildHrWorkforceEssListSurface } from "./hr.workforce.ess-lists.surface";
import { buildHrWorkforceEssOverviewStatGrid } from "./hr.workforce.ess-overview-stat.surface";
import {
  hrWorkforceEssAccessLogSurfaceKey,
  hrWorkforceEssAcknowledgementsSurfaceKey,
  hrWorkforceEssApprovalInboxSurfaceKey,
  hrWorkforceEssAssignedTasksSurfaceKey,
  hrWorkforceEssAttendanceSurfaceKey,
  hrWorkforceEssAuditTrailSurfaceKey,
  hrWorkforceEssBenefitsSurfaceKey,
  hrWorkforceEssConsentRecordsSurfaceKey,
  hrWorkforceEssDocumentsSurfaceKey,
  hrWorkforceEssExpenseClaimsSurfaceKey,
  hrWorkforceEssLeaveBalancesSurfaceKey,
  hrWorkforceEssLeaveRequestsSurfaceKey,
  hrWorkforceEssNotificationsSurfaceKey,
  hrWorkforceEssOffboardingTasksSurfaceKey,
  hrWorkforceEssOnboardingTasksSurfaceKey,
  hrWorkforceEssPayDocumentsSurfaceKey,
  hrWorkforceEssProfileSummarySurfaceKey,
  hrWorkforceEssProfileUpdatesSurfaceKey,
  hrWorkforceEssReportsSurfaceKey,
  hrWorkforceEssRequestTrackerSurfaceKey,
  hrWorkforceEssResourcesSurfaceKey,
  hrWorkforceEssShiftSchedulesSurfaceKey,
  hrWorkforceEssTrainingSurfaceKey,
  type HrWorkforceEssListSurfaceKey,
} from "./hr.workforce.ess-surface-metadata.shared";
import { hrWorkforceEssUiCopy } from "./hr.workforce.ess-ui.copy.shared";
import type { HrWorkforceEssPageModelInput } from "./hr.workforce.ess-search-params.parse.shared";
import {
  buildHrWorkforceEssReportRows,
  filterHrWorkforceEssRecordsForAccess,
  getHrWorkforceEssStore,
} from "./hr.workforce.ess-store.shared";

const DEFAULT_PAGE_SIZE = 25;

export type HrWorkforceEssPageModelListSection = {
  readonly surfaceKey: HrWorkforceEssListSurfaceKey;
  readonly title: string;
  readonly description: string;
  readonly listConfiguration: ListSurfaceRendererConfigurationResolvedInput;
};

export type HrWorkforceEssPageModel = {
  readonly title: string;
  readonly description: string;
  readonly canWrite: boolean;
  readonly canApprove: boolean;
  readonly canReadAudit: boolean;
  readonly canReadRestricted: boolean;
  readonly canExposeIntegrations: boolean;
  readonly reportGroupBy: HrWorkforceEssPageModelInput["reportGroupBy"];
  readonly status: HrWorkforceEssPageModelInput["status"];
  readonly overview: StatCardConfigurationResolvedInput;
  readonly sections: readonly HrWorkforceEssPageModelListSection[];
  readonly workbenchList: ListSurfaceRendererConfigurationResolvedInput;
};

type SearchableRecord = { readonly id: string };
type SurfaceRowInput = {
  readonly surfaceKey: HrWorkforceEssListSurfaceKey;
  readonly rows: readonly HrWorkforceEssListRow[];
  readonly searchValue?: string;
};

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

function formatBoolean(value: boolean) {
  return value ? "Yes" : "No";
}

function filterRows<T extends SearchableRecord>(
  rows: readonly T[],
  searchValue?: string,
): T[] {
  if (!searchValue?.trim()) {
    return [...rows].slice(0, DEFAULT_PAGE_SIZE);
  }
  const needle = searchValue.trim().toLowerCase();
  return rows
    .filter((row) => JSON.stringify(row).toLowerCase().includes(needle))
    .slice(0, DEFAULT_PAGE_SIZE);
}

function rowToneForStatus(value: string): HrWorkforceEssListRow["rowTone"] {
  if (
    [
      "submitted",
      "pending_approval",
      "returned",
      "amended",
      "not_started",
      "in_progress",
      "overdue",
      "pending",
    ].includes(value)
  ) {
    return "attention";
  }
  if (["rejected", "cancelled", "declined", "expired", "failed"].includes(value)) {
    return "critical";
  }
  return undefined;
}

function section(input: SurfaceRowInput): HrWorkforceEssPageModelListSection {
  const copy = hrWorkforceEssUiCopy.listSections[input.surfaceKey];
  return {
    surfaceKey: input.surfaceKey,
    title: copy.title,
    description: copy.description,
    listConfiguration: buildHrWorkforceEssListSurface(input),
  };
}

function employeeNameMap(
  rows: readonly { readonly id: string; readonly displayName: string }[],
) {
  return new Map(rows.map((row) => [row.id, row.displayName]));
}

function visibleStatus(
  statusFilter: HrWorkforceEssPageModelInput["status"],
  status: string,
) {
  return statusFilter === "all" || status === statusFilter;
}

export async function buildHrWorkforceEssPageModel(
  input: HrWorkforceEssPageModelInput,
): Promise<HrWorkforceEssPageModel> {
  const store = getHrWorkforceEssStore(input.organizationId);
  const visibleStore = filterHrWorkforceEssRecordsForAccess({
    store,
    access: {
      actorUserId: input.actorUserId,
      canWrite: input.canWrite,
      canApprove: input.canApprove,
      canReadRestricted: input.canReadRestricted,
      visibleEmployeeIds: input.visibleEmployeeIds,
    },
  });
  const employeeNames = employeeNameMap(visibleStore.employeeProfiles);

  const profiles: HrWorkforceEssListRow[] = visibleStore.employeeProfiles.map(
    (row) => ({
      id: row.id,
      rowTone: rowToneForStatus(row.employmentStatus),
      cells: {
        employee: row.displayName,
        employeeNumber: row.employeeNumber,
        jobTitle: row.jobTitle,
        department: row.department,
        manager: row.managerName,
        location: row.workLocation,
        status: formatEnumLabel(row.employmentStatus),
      },
    }),
  );

  const profileUpdates: HrWorkforceEssListRow[] = visibleStore.profileUpdates
    .filter((row) => visibleStatus(input.status, row.status))
    .map((row) => ({
      id: row.id,
      rowTone: rowToneForStatus(row.status),
      cells: {
        request: row.requestRef,
        employee: employeeNames.get(row.employeeId) ?? row.employeeId,
        fieldGroup: formatEnumLabel(row.fieldGroup),
        sensitive: formatBoolean(row.sensitive),
        status: formatEnumLabel(row.status),
        submittedAt: formatDate(row.submittedAt),
        guidance: row.correctionGuidance ?? row.rejectionReason ?? "Not recorded",
      },
    }));

  const leaveBalances: HrWorkforceEssListRow[] =
    visibleStore.leaveBalances.map((row) => ({
      id: row.id,
      cells: {
        employee: employeeNames.get(row.employeeId) ?? row.employeeId,
        leaveType: formatEnumLabel(row.leaveType),
        period: row.period,
        entitlement: row.entitlementDays,
        used: row.usedDays,
        pending: row.pendingDays,
        available: row.availableDays,
      },
    }));

  const leaveRequests: HrWorkforceEssListRow[] = visibleStore.leaveRequests
    .filter((row) => visibleStatus(input.status, row.status))
    .map((row) => ({
      id: row.id,
      rowTone: rowToneForStatus(row.status),
      cells: {
        request: row.requestRef,
        employee: employeeNames.get(row.employeeId) ?? row.employeeId,
        leaveType: formatEnumLabel(row.leaveType),
        dateRange: `${row.startDate} to ${row.endDate}`,
        days: row.days,
        status: formatEnumLabel(row.status),
        guidance: row.correctionGuidance ?? row.rejectionReason ?? "Not recorded",
      },
    }));

  const payDocuments: HrWorkforceEssListRow[] =
    visibleStore.payDocuments.map((row) => ({
      id: row.id,
      rowTone: row.privacyTier !== "standard" ? "attention" : undefined,
      cells: {
        document: row.documentRef,
        employee: employeeNames.get(row.employeeId) ?? row.employeeId,
        type: formatEnumLabel(row.documentType),
        period: row.period,
        grossPay: row.grossPayMasked,
        netPay: row.netPayMasked,
        authorized: formatBoolean(row.authorized),
      },
    }));

  const attendance: HrWorkforceEssListRow[] =
    visibleStore.attendanceRecords.map((row) => ({
      id: row.id,
      rowTone: rowToneForStatus(row.status),
      cells: {
        employee: employeeNames.get(row.employeeId) ?? row.employeeId,
        workDate: row.workDate,
        clockIn: formatDate(row.clockInAt),
        clockOut: formatDate(row.clockOutAt),
        status: formatEnumLabel(row.status),
        lateness: `${row.latenessMinutes} min`,
        overtime: `${row.overtimeHours} h`,
      },
    }));

  const shifts: HrWorkforceEssListRow[] = visibleStore.shiftSchedules.map(
    (row) => ({
      id: row.id,
      cells: {
        employee: employeeNames.get(row.employeeId) ?? row.employeeId,
        scheduleDate: row.scheduleDate,
        shift: row.shiftName,
        startsAt: formatDate(row.startsAt),
        endsAt: formatDate(row.endsAt),
        location: row.workLocation,
      },
    }),
  );

  const claims: HrWorkforceEssListRow[] = visibleStore.expenseClaims
    .filter((row) => visibleStatus(input.status, row.status))
    .map((row) => ({
      id: row.id,
      rowTone: rowToneForStatus(row.status),
      cells: {
        claim: row.claimRef,
        employee: employeeNames.get(row.employeeId) ?? row.employeeId,
        type: formatEnumLabel(row.claimType),
        amount: `${row.currency} ${row.amount.toFixed(2)}`,
        status: formatEnumLabel(row.status),
        receipts: row.receiptCount,
        guidance: row.correctionGuidance ?? row.rejectionReason ?? "Not recorded",
      },
    }));

  const documents: HrWorkforceEssListRow[] = visibleStore.documents.map((row) => ({
    id: row.id,
    rowTone: row.privacyTier !== "standard" ? "attention" : undefined,
    cells: {
      document: row.title,
      employee: employeeNames.get(row.employeeId) ?? row.employeeId,
      type: formatEnumLabel(row.documentType),
      authorized: formatBoolean(row.authorized),
      privacy: formatEnumLabel(row.privacyTier),
      expiresAt: formatDate(row.expiresAt),
      downloadedAt: formatDate(row.downloadedAt),
    },
  }));

  const resources: HrWorkforceEssListRow[] = visibleStore.resources.map((row) => ({
    id: row.id,
    cells: {
      resource: row.title,
      type: formatEnumLabel(row.resourceType),
      locale: row.locale,
      audience: formatEnumLabel(row.audience),
      effectiveAt: formatDate(row.effectiveAt),
    },
  }));

  const acknowledgements: HrWorkforceEssListRow[] =
    visibleStore.acknowledgements.map((row) => ({
      id: row.id,
      rowTone: rowToneForStatus(row.status),
      cells: {
        notice: row.title,
        employee: employeeNames.get(row.employeeId) ?? row.employeeId,
        status: formatEnumLabel(row.status),
        dueAt: formatDate(row.dueAt),
        acknowledgedAt: formatDate(row.acknowledgedAt),
      },
    }));

  const tasks: HrWorkforceEssListRow[] = visibleStore.assignedTasks.map((row) => ({
    id: row.id,
    rowTone: rowToneForStatus(row.status),
    cells: {
      task: row.title,
      employee: employeeNames.get(row.employeeId) ?? row.employeeId,
      type: formatEnumLabel(row.taskType),
      status: formatEnumLabel(row.status),
      dueAt: formatDate(row.dueAt),
      completedAt: formatDate(row.completedAt),
    },
  }));

  const requestTracker: HrWorkforceEssListRow[] = visibleStore.requestTracker
    .filter((row) => visibleStatus(input.status, row.status))
    .map((row) => ({
      id: row.id,
      rowTone: rowToneForStatus(row.status),
      cells: {
        request: row.requestRef,
        employee: employeeNames.get(row.employeeId) ?? row.employeeId,
        type: formatEnumLabel(row.requestType),
        status: formatEnumLabel(row.status),
        submittedAt: formatDate(row.submittedAt),
        updatedAt: formatDate(row.updatedAt),
        guidance: row.correctionGuidance ?? row.rejectionReason ?? "Not recorded",
      },
    }));

  const notifications: HrWorkforceEssListRow[] =
    visibleStore.notifications.map((row) => ({
      id: row.id,
      rowTone: rowToneForStatus(row.status),
      cells: {
        event: formatEnumLabel(row.event),
        employee: employeeNames.get(row.employeeId) ?? row.employeeId,
        status: formatEnumLabel(row.status),
        channel: formatEnumLabel(row.channel),
        message: row.message,
        sentAt: formatDate(row.sentAt),
      },
    }));

  const approvals: HrWorkforceEssListRow[] = visibleStore.approvalInbox
    .filter((row) => visibleStatus(input.status, row.status))
    .map((row) => ({
      id: row.id,
      rowTone: rowToneForStatus(row.status),
      cells: {
        approval: formatEnumLabel(row.approvalType),
        employee: row.employeeName,
        approver: row.approverUserId,
        status: formatEnumLabel(row.status),
        submittedAt: formatDate(row.submittedAt),
        reason: row.decisionReason ?? "Not recorded",
      },
    }));

  const benefits: HrWorkforceEssListRow[] = visibleStore.benefits.map((row) => ({
    id: row.id,
    rowTone: rowToneForStatus(row.status),
    cells: {
      benefit: row.benefitName,
      employee: employeeNames.get(row.employeeId) ?? row.employeeId,
      coverage: row.coverageSummary,
      dependents: row.dependentsCount,
      status: formatEnumLabel(row.status),
      effectiveAt: formatDate(row.effectiveAt),
    },
  }));

  const training: HrWorkforceEssListRow[] = visibleStore.trainingRecords.map(
    (row) => ({
      id: row.id,
      rowTone: rowToneForStatus(row.status),
      cells: {
        course: row.courseName,
        employee: employeeNames.get(row.employeeId) ?? row.employeeId,
        required: formatBoolean(row.required),
        status: formatEnumLabel(row.status),
        certificate: row.certificateRef ?? "Not recorded",
        dueAt: formatDate(row.dueAt),
      },
    }),
  );

  const onboarding: HrWorkforceEssListRow[] = visibleStore.onboardingTasks.map(
    (row) => ({
      id: row.id,
      rowTone: rowToneForStatus(row.status),
      cells: {
        task: row.title,
        employee: employeeNames.get(row.employeeId) ?? row.employeeId,
        status: formatEnumLabel(row.status),
        dueAt: formatDate(row.dueAt),
        completedAt: formatDate(row.completedAt),
      },
    }),
  );

  const offboarding: HrWorkforceEssListRow[] = visibleStore.offboardingTasks.map(
    (row) => ({
      id: row.id,
      rowTone: rowToneForStatus(row.status),
      cells: {
        task: row.title,
        employee: employeeNames.get(row.employeeId) ?? row.employeeId,
        clearanceOwner: row.clearanceOwner,
        status: formatEnumLabel(row.status),
        dueAt: formatDate(row.dueAt),
      },
    }),
  );

  const consent: HrWorkforceEssListRow[] = visibleStore.consentRecords.map(
    (row) => ({
      id: row.id,
      rowTone: rowToneForStatus(row.status),
      cells: {
        consent: formatEnumLabel(row.consentType),
        employee: employeeNames.get(row.employeeId) ?? row.employeeId,
        status: formatEnumLabel(row.status),
        locale: row.locale,
        capturedAt: formatDate(row.capturedAt),
      },
    }),
  );

  const accessLog: HrWorkforceEssListRow[] = visibleStore.accessLogs.map((row) => ({
    id: row.id,
    rowTone: row.privacyTier !== "standard" ? "attention" : undefined,
    cells: {
      target: `${formatEnumLabel(row.targetType)} ${row.targetId}`,
      employee: employeeNames.get(row.employeeId) ?? row.employeeId,
      actor: row.actorUserId,
      role: formatEnumLabel(row.actorRole),
      privacy: formatEnumLabel(row.privacyTier),
      reason: row.accessReason,
      accessedAt: formatDate(row.accessedAt),
    },
  }));

  const reportRows: HrWorkforceEssListRow[] = buildHrWorkforceEssReportRows({
    store: visibleStore,
    groupBy: input.reportGroupBy,
  }).map((row) => ({
    id: row.id,
    cells: {
      group: row.group,
      groupBy: formatEnumLabel(row.groupBy),
      requestCount: row.requestCount,
      pendingTasks: row.pendingTasks,
      restrictedRecords: row.restrictedRecords,
      lastActivityAt: formatDate(row.lastActivityAt),
    },
  }));

  const auditRows: HrWorkforceEssListRow[] = visibleStore.auditEvents.map((row) => ({
    id: row.id,
    cells: {
      summary: row.summary,
      action: row.action,
      actorId: row.actorId,
      target: `${formatEnumLabel(row.targetType)} ${row.targetId}`,
      employee: row.employeeId
        ? employeeNames.get(row.employeeId) ?? row.employeeId
        : "Not recorded",
      occurredAt: formatDate(row.occurredAt),
    },
  }));

  const sections: HrWorkforceEssPageModelListSection[] = [
    section({
      surfaceKey: hrWorkforceEssProfileSummarySurfaceKey,
      searchValue: input.profileSearch,
      rows: filterRows(profiles, input.profileSearch),
    }),
    section({
      surfaceKey: hrWorkforceEssProfileUpdatesSurfaceKey,
      searchValue: input.profileUpdatesSearch,
      rows: filterRows(profileUpdates, input.profileUpdatesSearch),
    }),
    section({
      surfaceKey: hrWorkforceEssLeaveBalancesSurfaceKey,
      searchValue: input.leaveBalancesSearch,
      rows: filterRows(leaveBalances, input.leaveBalancesSearch),
    }),
    section({
      surfaceKey: hrWorkforceEssLeaveRequestsSurfaceKey,
      searchValue: input.leaveRequestsSearch,
      rows: filterRows(leaveRequests, input.leaveRequestsSearch),
    }),
    section({
      surfaceKey: hrWorkforceEssPayDocumentsSurfaceKey,
      searchValue: input.payDocumentsSearch,
      rows: filterRows(payDocuments, input.payDocumentsSearch),
    }),
    section({
      surfaceKey: hrWorkforceEssAttendanceSurfaceKey,
      searchValue: input.attendanceSearch,
      rows: filterRows(attendance, input.attendanceSearch),
    }),
    section({
      surfaceKey: hrWorkforceEssShiftSchedulesSurfaceKey,
      searchValue: input.shiftSchedulesSearch,
      rows: filterRows(shifts, input.shiftSchedulesSearch),
    }),
    section({
      surfaceKey: hrWorkforceEssExpenseClaimsSurfaceKey,
      searchValue: input.claimsSearch,
      rows: filterRows(claims, input.claimsSearch),
    }),
    section({
      surfaceKey: hrWorkforceEssDocumentsSurfaceKey,
      searchValue: input.documentsSearch,
      rows: filterRows(documents, input.documentsSearch),
    }),
    section({
      surfaceKey: hrWorkforceEssResourcesSurfaceKey,
      searchValue: input.resourcesSearch,
      rows: filterRows(resources, input.resourcesSearch),
    }),
    section({
      surfaceKey: hrWorkforceEssAcknowledgementsSurfaceKey,
      searchValue: input.acknowledgementsSearch,
      rows: filterRows(acknowledgements, input.acknowledgementsSearch),
    }),
    section({
      surfaceKey: hrWorkforceEssAssignedTasksSurfaceKey,
      searchValue: input.tasksSearch,
      rows: filterRows(tasks, input.tasksSearch),
    }),
    section({
      surfaceKey: hrWorkforceEssRequestTrackerSurfaceKey,
      searchValue: input.requestTrackerSearch,
      rows: filterRows(requestTracker, input.requestTrackerSearch),
    }),
    section({
      surfaceKey: hrWorkforceEssNotificationsSurfaceKey,
      searchValue: input.notificationsSearch,
      rows: filterRows(notifications, input.notificationsSearch),
    }),
  ];

  if (input.canApprove) {
    sections.push(
      section({
        surfaceKey: hrWorkforceEssApprovalInboxSurfaceKey,
        searchValue: input.approvalsSearch,
        rows: filterRows(approvals, input.approvalsSearch),
      }),
    );
  }

  sections.push(
    section({
      surfaceKey: hrWorkforceEssBenefitsSurfaceKey,
      searchValue: input.benefitsSearch,
      rows: filterRows(benefits, input.benefitsSearch),
    }),
    section({
      surfaceKey: hrWorkforceEssTrainingSurfaceKey,
      searchValue: input.trainingSearch,
      rows: filterRows(training, input.trainingSearch),
    }),
    section({
      surfaceKey: hrWorkforceEssOnboardingTasksSurfaceKey,
      searchValue: input.onboardingSearch,
      rows: filterRows(onboarding, input.onboardingSearch),
    }),
    section({
      surfaceKey: hrWorkforceEssOffboardingTasksSurfaceKey,
      searchValue: input.offboardingSearch,
      rows: filterRows(offboarding, input.offboardingSearch),
    }),
    section({
      surfaceKey: hrWorkforceEssConsentRecordsSurfaceKey,
      searchValue: input.consentSearch,
      rows: filterRows(consent, input.consentSearch),
    }),
  );

  if (input.canReadRestricted) {
    sections.push(
      section({
        surfaceKey: hrWorkforceEssAccessLogSurfaceKey,
        searchValue: input.accessLogSearch,
        rows: filterRows(accessLog, input.accessLogSearch),
      }),
    );
  }

  sections.push(
    section({
      surfaceKey: hrWorkforceEssReportsSurfaceKey,
      searchValue: input.reportsSearch,
      rows: filterRows(reportRows, input.reportsSearch),
    }),
  );

  if (input.canReadAudit) {
    sections.push(
      section({
        surfaceKey: hrWorkforceEssAuditTrailSurfaceKey,
        searchValue: input.auditTrailSearch,
        rows: filterRows(auditRows, input.auditTrailSearch),
      }),
    );
  }

  const openRequestCount = visibleStore.requestTracker.filter(
    (row) => !["approved", "rejected", "cancelled", "completed"].includes(row.status),
  ).length;
  const pendingTaskCount = visibleStore.assignedTasks.filter(
    (row) => !["completed", "waived"].includes(row.status),
  ).length;
  const sensitiveEventCount =
    visibleStore.payDocuments.filter((row) => row.privacyTier !== "standard").length +
    visibleStore.documents.filter((row) => row.privacyTier !== "standard").length +
    visibleStore.accessLogs.length;

  const overview = buildHrWorkforceEssOverviewStatGrid({
    snapshot: {
      employeeCount: visibleStore.employeeProfiles.length,
      openRequestCount,
      pendingTaskCount,
      sensitiveEventCount,
    },
  });

  return {
    title: hrWorkforceEssUiCopy.page.title,
    description: hrWorkforceEssUiCopy.page.description,
    canWrite: input.canWrite,
    canApprove: input.canApprove,
    canReadAudit: input.canReadAudit,
    canReadRestricted: input.canReadRestricted,
    canExposeIntegrations: input.canExposeIntegrations,
    reportGroupBy: input.reportGroupBy,
    status: input.status,
    overview,
    sections,
    workbenchList:
      sections.find(
        (candidate) =>
          candidate.surfaceKey === hrWorkforceEssProfileSummarySurfaceKey,
      )?.listConfiguration ??
      buildHrWorkforceEssListSurface({
        surfaceKey: hrWorkforceEssProfileSummarySurfaceKey,
        rows: [],
      }),
  };
}
