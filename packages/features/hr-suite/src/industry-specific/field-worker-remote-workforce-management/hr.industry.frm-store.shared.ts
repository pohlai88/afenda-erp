import type {
  HrFrmAttendanceOutcomeRef,
  HrFrmOvertimeWorkHourRef,
  HrFrmPayrollReference,
} from "./hr.industry.frm.contract";
import {
  hrIndustryFrmAuditActions,
  type HrIndustryFrmAuditAction,
} from "./hr.industry.frm.event";
import type { HrFrmReportGroupBy } from "./hr.industry.frm-constants.shared";
import type {
  HrFrmAssignmentInput,
  HrFrmAttendanceExceptionInput,
  HrFrmMobileAttendanceInput,
  HrFrmNotificationInput,
  HrFrmOfflineSyncInput,
  HrFrmPerDiemRateInput,
  HrFrmPerDiemReferenceInput,
  HrFrmSafetyConfirmationInput,
  HrFrmScheduleRefInput,
  HrFrmTravelComplianceInput,
  HrFrmTravelStatusInput,
  HrFrmWorksiteInput,
} from "./hr.industry.frm.schema";

export type HrIndustryFrmAuditEvent = {
  readonly id: string;
  readonly organizationId: string;
  readonly action: HrIndustryFrmAuditAction;
  readonly actorId: string;
  readonly targetType:
    | "assignment"
    | "attendance"
    | "gps_validation"
    | "offline_sync"
    | "travel"
    | "per_diem"
    | "exception"
    | "approval"
    | "correction"
    | "payroll_reference";
  readonly targetId: string;
  readonly summary: string;
  readonly occurredAt: string;
};

export type HrIndustryFrmReportRow = {
  readonly id: string;
  readonly groupLabel: string;
  readonly assignmentCount: number;
  readonly activeWorkerCount: number;
  readonly exceptionCount: number;
  readonly travelCount: number;
  readonly perDiemAmount: number;
};

export type HrIndustryFrmTeamAvailabilityRow = {
  readonly id: string;
  readonly employeeId: string;
  readonly employeeDisplayName: string;
  readonly managerEmployeeId: string;
  readonly worksiteName: string;
  readonly assignmentStatus: string;
  readonly travelStatus: string;
  readonly openExceptionCount: number;
  readonly availability: "available" | "on_site" | "traveling" | "exception";
};

export type HrIndustryFrmStore = {
  readonly worksites: HrFrmWorksiteInput[];
  readonly assignments: HrFrmAssignmentInput[];
  readonly mobileAttendance: HrFrmMobileAttendanceInput[];
  readonly attendanceExceptions: HrFrmAttendanceExceptionInput[];
  readonly offlineSync: HrFrmOfflineSyncInput[];
  readonly schedules: HrFrmScheduleRefInput[];
  readonly travelStatuses: HrFrmTravelStatusInput[];
  readonly perDiemRates: HrFrmPerDiemRateInput[];
  readonly perDiemReferences: HrFrmPerDiemReferenceInput[];
  readonly travelCompliance: HrFrmTravelComplianceInput[];
  readonly safetyConfirmations: HrFrmSafetyConfirmationInput[];
  readonly notifications: HrFrmNotificationInput[];
  readonly auditEvents: HrIndustryFrmAuditEvent[];
};

type EmployeeScoped = { readonly employeeId: string };

const stores = new Map<string, HrIndustryFrmStore>();

function withOrg<T extends { organizationId: string }>(
  organizationId: string,
  rows: readonly Omit<T, "organizationId">[],
): T[] {
  return rows.map((row) => ({ ...row, organizationId }) as T);
}

function hasEmployeeAccess(
  row: EmployeeScoped,
  visibleEmployeeIds: readonly string[] | null,
) {
  return visibleEmployeeIds === null || visibleEmployeeIds.includes(row.employeeId);
}

function scopedRows<T extends EmployeeScoped>(
  rows: readonly T[],
  visibleEmployeeIds: readonly string[] | null,
) {
  return rows.filter((row) => hasEmployeeAccess(row, visibleEmployeeIds));
}

function createSeedStore(organizationId: string): HrIndustryFrmStore {
  const worksites = withOrg<HrFrmWorksiteInput>(organizationId, [
    {
      id: "site-project-alpha",
      name: "Project Alpha Construction Site",
      locationType: "project_site",
      legalEntity: "MY01",
      projectCode: "PRJ-ALPHA",
      clientName: "Northstar Utilities",
      region: "Klang Valley",
      geofenceRef: "geo-alpha-500m",
      approvedRemote: false,
    },
    {
      id: "site-client-sabah",
      name: "Sabah Client Service Area",
      locationType: "service_area",
      legalEntity: "MY01",
      clientName: "Sabah Grid",
      region: "Sabah",
      geofenceRef: "geo-sabah-service",
      approvedRemote: false,
    },
    {
      id: "site-remote-home",
      name: "Approved Remote Home Office",
      locationType: "approved_remote_location",
      legalEntity: "MY01",
      branchCode: "REMOTE",
      region: "Remote",
      geofenceRef: "geo-remote-approved",
      approvedRemote: true,
    },
  ]);

  const assignments = withOrg<HrFrmAssignmentInput>(organizationId, [
    {
      id: "assign-field-001",
      employeeId: "emp-100",
      employeeDisplayName: "Maya Chen",
      worksiteId: "site-project-alpha",
      assignmentType: "project_based",
      startDate: "2026-05-01",
      endDate: "2026-06-30",
      managerEmployeeId: "emp-900",
      managerDisplayName: "Omar Rahman",
      departmentName: "Field Operations",
      legalEntity: "MY01",
      eligibleForMobileAttendance: true,
      breakCaptureEnabled: true,
      offlineCaptureEnabled: true,
      travelApprovalRequired: false,
      status: "active",
    },
    {
      id: "assign-field-002",
      employeeId: "emp-101",
      employeeDisplayName: "Daniel Ong",
      worksiteId: "site-client-sabah",
      assignmentType: "travel_based",
      startDate: "2026-05-12",
      endDate: "2026-05-18",
      managerEmployeeId: "emp-900",
      managerDisplayName: "Omar Rahman",
      departmentName: "Customer Service",
      legalEntity: "MY01",
      eligibleForMobileAttendance: true,
      breakCaptureEnabled: true,
      offlineCaptureEnabled: true,
      travelApprovalRequired: true,
      status: "active",
    },
    {
      id: "assign-field-003",
      employeeId: "emp-102",
      employeeDisplayName: "Priya Nair",
      worksiteId: "site-remote-home",
      assignmentType: "recurring",
      startDate: "2026-05-01",
      managerEmployeeId: "emp-901",
      managerDisplayName: "Sarah Tan",
      departmentName: "Support",
      legalEntity: "MY01",
      eligibleForMobileAttendance: true,
      breakCaptureEnabled: false,
      offlineCaptureEnabled: false,
      travelApprovalRequired: false,
      status: "active",
    },
  ]);

  const mobileAttendance = withOrg<HrFrmMobileAttendanceInput>(organizationId, [
    {
      id: "att-field-001",
      assignmentId: "assign-field-001",
      employeeId: "emp-100",
      employeeDisplayName: "Maya Chen",
      eventType: "clock_in",
      capturedAt: "2026-05-15T00:55:00.000Z",
      gpsValidationRef: "geo-check-001",
      gpsValidationResult: "inside_assigned_site",
      validatedAgainstAssignedSite: true,
      offline: false,
      deviceId: "mobile-ios-100",
    },
    {
      id: "att-field-002",
      assignmentId: "assign-field-001",
      employeeId: "emp-100",
      employeeDisplayName: "Maya Chen",
      eventType: "break_start",
      capturedAt: "2026-05-15T04:30:00.000Z",
      gpsValidationRef: "geo-check-002",
      gpsValidationResult: "inside_assigned_site",
      validatedAgainstAssignedSite: true,
      offline: false,
      deviceId: "mobile-ios-100",
    },
    {
      id: "att-field-003",
      assignmentId: "assign-field-002",
      employeeId: "emp-101",
      employeeDisplayName: "Daniel Ong",
      eventType: "offline_clock_in",
      capturedAt: "2026-05-15T01:20:00.000Z",
      gpsValidationRef: "geo-check-003",
      gpsValidationResult: "outside_site",
      validatedAgainstAssignedSite: false,
      offline: true,
      deviceId: "mobile-android-101",
    },
  ]);

  const attendanceExceptions = withOrg<HrFrmAttendanceExceptionInput>(
    organizationId,
    [
      {
        id: "exc-field-001",
        assignmentId: "assign-field-002",
        employeeId: "emp-101",
        employeeDisplayName: "Daniel Ong",
        exceptionType: "outside_site_check_in",
        severity: "high",
        status: "reviewing",
        detectedAt: "2026-05-15T01:21:00.000Z",
        correctionRef: "manual-review-104",
      },
      {
        id: "exc-field-002",
        assignmentId: "assign-field-003",
        employeeId: "emp-102",
        employeeDisplayName: "Priya Nair",
        exceptionType: "missing_checkout",
        severity: "medium",
        status: "open",
        detectedAt: "2026-05-14T11:00:00.000Z",
      },
    ],
  );

  const offlineSync = withOrg<HrFrmOfflineSyncInput>(organizationId, [
    {
      id: "sync-field-001",
      attendanceEventId: "att-field-003",
      employeeId: "emp-101",
      employeeDisplayName: "Daniel Ong",
      capturedAt: "2026-05-15T01:20:00.000Z",
      syncedAt: "2026-05-15T03:45:00.000Z",
      status: "reconciled",
      reconciliationNote: "Synced after mobile network restoration.",
    },
  ]);

  const schedules = withOrg<HrFrmScheduleRefInput>(organizationId, [
    {
      id: "sched-field-001",
      employeeId: "emp-100",
      employeeDisplayName: "Maya Chen",
      worksiteId: "site-project-alpha",
      date: "2026-05-15",
      projectCode: "PRJ-ALPHA",
      routeCode: "ROUTE-KV-01",
      clientName: "Northstar Utilities",
      plannedStartAt: "2026-05-15T01:00:00.000Z",
      plannedEndAt: "2026-05-15T10:00:00.000Z",
    },
    {
      id: "sched-field-002",
      employeeId: "emp-101",
      employeeDisplayName: "Daniel Ong",
      worksiteId: "site-client-sabah",
      date: "2026-05-15",
      projectCode: "SABAH-SVC",
      routeCode: "ROUTE-SBH-03",
      clientName: "Sabah Grid",
      plannedStartAt: "2026-05-15T01:00:00.000Z",
      plannedEndAt: "2026-05-15T11:00:00.000Z",
    },
  ]);

  const travelStatuses = withOrg<HrFrmTravelStatusInput>(organizationId, [
    {
      id: "travel-field-001",
      assignmentId: "assign-field-002",
      employeeId: "emp-101",
      employeeDisplayName: "Daniel Ong",
      travelType: "overnight_travel",
      status: "approved",
      destination: "Kota Kinabalu service area",
      country: "MY",
      city: "Kota Kinabalu",
      durationHours: 72,
      employeeCategory: "field_engineer",
      policyGroup: "MY-FIELD",
      approvalRef: "travel-approval-778",
      startsAt: "2026-05-12T00:00:00.000Z",
      endsAt: "2026-05-18T10:00:00.000Z",
    },
    {
      id: "travel-field-002",
      assignmentId: "assign-field-001",
      employeeId: "emp-100",
      employeeDisplayName: "Maya Chen",
      travelType: "local_field_visit",
      status: "on_site",
      destination: "Project Alpha",
      country: "MY",
      city: "Kuala Lumpur",
      durationHours: 9,
      employeeCategory: "field_supervisor",
      policyGroup: "MY-FIELD",
      startsAt: "2026-05-15T01:00:00.000Z",
      endsAt: "2026-05-15T10:00:00.000Z",
    },
  ]);

  const perDiemRates = withOrg<HrFrmPerDiemRateInput>(organizationId, [
    {
      id: "rate-field-001",
      country: "MY",
      city: "Kota Kinabalu",
      region: "Sabah",
      projectCode: "SABAH-SVC",
      grade: "G6",
      travelType: "overnight_travel",
      allowanceType: "overnight",
      amount: 180,
      currency: "MYR",
    },
    {
      id: "rate-field-002",
      country: "MY",
      city: "Kuala Lumpur",
      region: "Klang Valley",
      projectCode: "PRJ-ALPHA",
      grade: "G5",
      travelType: "local_field_visit",
      allowanceType: "meal",
      amount: 35,
      currency: "MYR",
    },
  ]);

  const perDiemReferences = withOrg<HrFrmPerDiemReferenceInput>(organizationId, [
    {
      id: "perdiem-field-001",
      travelStatusId: "travel-field-001",
      employeeId: "emp-101",
      employeeDisplayName: "Daniel Ong",
      allowanceType: "overnight",
      eligible: true,
      eligibleDays: 3,
      amount: 540,
      currency: "MYR",
      approvalStatus: "approved",
      payrollRef: "payroll-perdiem-2026-05-101",
      expenseRef: "expense-travel-2026-05-101",
    },
    {
      id: "perdiem-field-002",
      travelStatusId: "travel-field-002",
      employeeId: "emp-100",
      employeeDisplayName: "Maya Chen",
      allowanceType: "meal",
      eligible: true,
      eligibleDays: 1,
      amount: 35,
      currency: "MYR",
      approvalStatus: "approved",
      payrollRef: "payroll-meal-2026-05-100",
    },
  ]);

  const travelCompliance = withOrg<HrFrmTravelComplianceInput>(organizationId, [
    {
      id: "compliance-field-001",
      travelStatusId: "travel-field-001",
      employeeId: "emp-101",
      employeeDisplayName: "Daniel Ong",
      complianceStatus: "compliant",
      approvalRef: "travel-approval-778",
      requiredDocumentRef: "doc-vault-travel-101",
      insuranceRef: "insurance-duty-care-101",
      dutyOfCareStatus: "acknowledged",
    },
    {
      id: "compliance-field-002",
      travelStatusId: "travel-field-002",
      employeeId: "emp-100",
      employeeDisplayName: "Maya Chen",
      complianceStatus: "duty_of_care_open",
      dutyOfCareStatus: "open",
    },
  ]);

  const safetyConfirmations = withOrg<HrFrmSafetyConfirmationInput>(
    organizationId,
    [
      {
        id: "safety-field-001",
        assignmentId: "assign-field-001",
        employeeId: "emp-100",
        employeeDisplayName: "Maya Chen",
        confirmationType: "arrival_confirmation",
        confirmedAt: "2026-05-15T01:02:00.000Z",
        emergencyContactRef: "emergency-contact-100",
        gpsValidationRef: "geo-check-001",
      },
      {
        id: "safety-field-002",
        assignmentId: "assign-field-002",
        employeeId: "emp-101",
        employeeDisplayName: "Daniel Ong",
        confirmationType: "site_departure_confirmation",
        confirmedAt: "2026-05-15T10:45:00.000Z",
        emergencyContactRef: "emergency-contact-101",
        gpsValidationRef: "geo-check-004",
      },
    ],
  );

  const notifications = withOrg<HrFrmNotificationInput>(organizationId, [
    {
      id: "notice-field-001",
      audience: "manager",
      subject: "Outside-site check-in requires review",
      severity: "warning",
      status: "sent",
      employeeId: "emp-101",
      targetRef: "exc-field-001",
      sentAt: "2026-05-15T01:25:00.000Z",
    },
    {
      id: "notice-field-002",
      audience: "compliance",
      subject: "Duty-of-care acknowledgment still open",
      severity: "critical",
      status: "sent",
      employeeId: "emp-100",
      targetRef: "compliance-field-002",
      sentAt: "2026-05-15T02:00:00.000Z",
    },
    {
      id: "notice-field-003",
      audience: "payroll",
      subject: "Approved per diem reference ready",
      severity: "info",
      status: "queued",
      employeeId: "emp-101",
      targetRef: "perdiem-field-001",
      sentAt: "2026-05-18T10:30:00.000Z",
    },
  ]);

  const auditEvents = withOrg<HrIndustryFrmAuditEvent>(organizationId, [
    {
      id: "audit-frm-001",
      action: hrIndustryFrmAuditActions.assignmentCreated,
      actorId: "user-hr-field",
      targetType: "assignment",
      targetId: "assign-field-001",
      summary: "Assigned Maya Chen to Project Alpha Construction Site.",
      occurredAt: "2026-05-01T02:00:00.000Z",
    },
    {
      id: "audit-frm-002",
      action: hrIndustryFrmAuditActions.mobileCheckInCaptured,
      actorId: "emp-100",
      targetType: "attendance",
      targetId: "att-field-001",
      summary: "Captured mobile clock-in for Maya Chen.",
      occurredAt: "2026-05-15T00:55:00.000Z",
    },
    {
      id: "audit-frm-003",
      action: hrIndustryFrmAuditActions.gpsValidationReferenced,
      actorId: "system-geo",
      targetType: "gps_validation",
      targetId: "geo-check-003",
      summary: "Referenced outside-site GPS validation for Daniel Ong.",
      occurredAt: "2026-05-15T01:20:10.000Z",
    },
    {
      id: "audit-frm-004",
      action: hrIndustryFrmAuditActions.offlineSyncReconciled,
      actorId: "system-mobile-sync",
      targetType: "offline_sync",
      targetId: "sync-field-001",
      summary: "Reconciled offline mobile attendance after sync.",
      occurredAt: "2026-05-15T03:45:00.000Z",
    },
    {
      id: "audit-frm-005",
      action: hrIndustryFrmAuditActions.payrollReferenceExposed,
      actorId: "system-frm",
      targetType: "payroll_reference",
      targetId: "perdiem-field-001",
      summary: "Exposed approved per diem reference to payroll.",
      occurredAt: "2026-05-18T10:30:00.000Z",
    },
  ]);

  return {
    worksites,
    assignments,
    mobileAttendance,
    attendanceExceptions,
    offlineSync,
    schedules,
    travelStatuses,
    perDiemRates,
    perDiemReferences,
    travelCompliance,
    safetyConfirmations,
    notifications,
    auditEvents,
  };
}

export function getHrIndustryFrmStore(
  organizationId: string,
): HrIndustryFrmStore {
  const existing = stores.get(organizationId);
  if (existing) return existing;
  const store = createSeedStore(organizationId);
  stores.set(organizationId, store);
  return store;
}

export function resetHrIndustryFrmStore(
  organizationId: string,
): HrIndustryFrmStore {
  const store = createSeedStore(organizationId);
  stores.set(organizationId, store);
  return store;
}

export function filterHrIndustryFrmRecordsForAccess(input: {
  readonly store: HrIndustryFrmStore;
  readonly visibleEmployeeIds: readonly string[] | null;
}): HrIndustryFrmStore {
  const { store, visibleEmployeeIds } = input;
  const visibleAssignmentIds = new Set(
    scopedRows(store.assignments, visibleEmployeeIds).map((row) => row.id),
  );
  const visibleWorksiteIds = new Set(
    scopedRows(store.assignments, visibleEmployeeIds).map((row) => row.worksiteId),
  );

  return {
    worksites: store.worksites.filter((row) => visibleWorksiteIds.has(row.id)),
    assignments: scopedRows(store.assignments, visibleEmployeeIds),
    mobileAttendance: scopedRows(store.mobileAttendance, visibleEmployeeIds),
    attendanceExceptions: scopedRows(
      store.attendanceExceptions,
      visibleEmployeeIds,
    ),
    offlineSync: scopedRows(store.offlineSync, visibleEmployeeIds),
    schedules: scopedRows(store.schedules, visibleEmployeeIds),
    travelStatuses: scopedRows(store.travelStatuses, visibleEmployeeIds),
    perDiemRates: store.perDiemRates,
    perDiemReferences: scopedRows(store.perDiemReferences, visibleEmployeeIds),
    travelCompliance: scopedRows(store.travelCompliance, visibleEmployeeIds),
    safetyConfirmations: scopedRows(
      store.safetyConfirmations,
      visibleEmployeeIds,
    ),
    notifications: store.notifications.filter(
      (row) =>
        !row.employeeId || visibleEmployeeIds === null || visibleEmployeeIds.includes(row.employeeId),
    ),
    auditEvents: store.auditEvents.filter(
      (row) =>
        row.targetType !== "assignment" ||
        visibleAssignmentIds.has(row.targetId) ||
        visibleEmployeeIds === null,
    ),
  };
}

export function buildHrIndustryFrmTeamAvailabilityRows(
  store: HrIndustryFrmStore,
): HrIndustryFrmTeamAvailabilityRow[] {
  const siteById = new Map(store.worksites.map((site) => [site.id, site]));
  const travelByAssignment = new Map(
    store.travelStatuses.map((travel) => [travel.assignmentId, travel]),
  );
  const openExceptionsByEmployee = new Map<string, number>();
  for (const exception of store.attendanceExceptions) {
    if (exception.status !== "resolved" && exception.status !== "waived") {
      openExceptionsByEmployee.set(
        exception.employeeId,
        (openExceptionsByEmployee.get(exception.employeeId) ?? 0) + 1,
      );
    }
  }

  return store.assignments.map((assignment) => {
    const openExceptionCount =
      openExceptionsByEmployee.get(assignment.employeeId) ?? 0;
    const travel = travelByAssignment.get(assignment.id);
    const availability =
      openExceptionCount > 0
        ? "exception"
        : travel?.status === "in_transit"
          ? "traveling"
          : assignment.status === "active"
            ? "on_site"
            : "available";

    return {
      id: `availability-${assignment.id}`,
      employeeId: assignment.employeeId,
      employeeDisplayName: assignment.employeeDisplayName,
      managerEmployeeId: assignment.managerEmployeeId,
      worksiteName: siteById.get(assignment.worksiteId)?.name ?? assignment.worksiteId,
      assignmentStatus: assignment.status,
      travelStatus: travel?.status ?? "not_required",
      openExceptionCount,
      availability,
    };
  });
}

export function listHrIndustryFrmAttendanceOutcomeRefs(
  store: HrIndustryFrmStore,
): HrFrmAttendanceOutcomeRef[] {
  return store.mobileAttendance
    .filter((event) => event.eventType.includes("clock"))
    .map((event) => ({
      id: `lam-${event.id}`,
      employeeId: event.employeeId,
      employeeDisplayName: event.employeeDisplayName,
      assignmentId: event.assignmentId,
      workDate: event.capturedAt.slice(0, 10),
      outcome:
        event.offline && event.validatedAgainstAssignedSite
          ? "offline_reconciled"
          : event.validatedAgainstAssignedSite
            ? "validated"
            : "exception",
      gpsValidationRef: event.gpsValidationRef,
      leaveAttendanceRef: `lam-field-${event.id}`,
    }));
}

export function listHrIndustryFrmOvertimeWorkHourRefs(
  store: HrIndustryFrmStore,
): HrFrmOvertimeWorkHourRef[] {
  return store.schedules.map((schedule) => {
    const plannedHours =
      (new Date(schedule.plannedEndAt).getTime() -
        new Date(schedule.plannedStartAt).getTime()) /
      3_600_000;
    return {
      id: `otm-${schedule.id}`,
      employeeId: schedule.employeeId,
      employeeDisplayName: schedule.employeeDisplayName,
      assignmentId:
        store.assignments.find(
          (assignment) =>
            assignment.employeeId === schedule.employeeId &&
            assignment.worksiteId === schedule.worksiteId,
        )?.id ?? schedule.id,
      workDate: schedule.date,
      actualHours: Math.round(plannedHours * 10) / 10,
      overtimeEligible: plannedHours > 8,
    };
  });
}

export function listHrIndustryFrmPayrollReferences(
  store: HrIndustryFrmStore,
): HrFrmPayrollReference[] {
  const attendanceRefs = listHrIndustryFrmAttendanceOutcomeRefs(store).map(
    (ref) => ({
      id: `payroll-${ref.id}`,
      employeeId: ref.employeeId,
      employeeDisplayName: ref.employeeDisplayName,
      sourceRef: ref.id,
      referenceType: "field_attendance" as const,
      payrollPeriod: ref.workDate.slice(0, 7),
    }),
  );
  const perDiemRefs = store.perDiemReferences
    .filter((ref) => ref.approvalStatus === "approved")
    .map((ref) => ({
      id: `payroll-${ref.id}`,
      employeeId: ref.employeeId,
      employeeDisplayName: ref.employeeDisplayName,
      sourceRef: ref.id,
      referenceType: "per_diem" as const,
      amount: ref.amount,
      currency: ref.currency,
      payrollPeriod: "2026-05",
    }));
  return [...attendanceRefs, ...perDiemRefs];
}

export function buildHrIndustryFrmReportRows(input: {
  readonly store: HrIndustryFrmStore;
  readonly groupBy: HrFrmReportGroupBy;
}): HrIndustryFrmReportRow[] {
  const siteById = new Map(input.store.worksites.map((site) => [site.id, site]));
  const groups = new Map<string, HrFrmAssignmentInput[]>();

  for (const assignment of input.store.assignments) {
    const site = siteById.get(assignment.worksiteId);
    const groupLabel = resolveReportGroupLabel(input.groupBy, assignment, site);
    groups.set(groupLabel, [...(groups.get(groupLabel) ?? []), assignment]);
  }

  return [...groups.entries()].map(([groupLabel, assignments]) => {
    const assignmentIds = new Set(assignments.map((row) => row.id));
    const employeeIds = new Set(assignments.map((row) => row.employeeId));
    const exceptionCount = input.store.attendanceExceptions.filter((row) =>
      assignmentIds.has(row.assignmentId),
    ).length;
    const travelCount = input.store.travelStatuses.filter((row) =>
      assignmentIds.has(row.assignmentId),
    ).length;
    const perDiemAmount = input.store.perDiemReferences
      .filter((row) => employeeIds.has(row.employeeId))
      .reduce((sum, row) => sum + row.amount, 0);
    return {
      id: `frm-report-${input.groupBy}-${groupLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      groupLabel,
      assignmentCount: assignments.length,
      activeWorkerCount: assignments.filter((row) => row.status === "active").length,
      exceptionCount,
      travelCount,
      perDiemAmount,
    };
  });
}

function resolveReportGroupLabel(
  groupBy: HrFrmReportGroupBy,
  assignment: HrFrmAssignmentInput,
  site: HrFrmWorksiteInput | undefined,
) {
  switch (groupBy) {
    case "employee":
      return assignment.employeeDisplayName;
    case "manager":
      return assignment.managerDisplayName;
    case "department":
      return assignment.departmentName;
    case "legal_entity":
      return assignment.legalEntity;
    case "site":
      return site?.name ?? assignment.worksiteId;
    case "project":
      return site?.projectCode ?? "No project";
    case "client":
      return site?.clientName ?? "No client";
    case "travel_type":
      return assignment.assignmentType === "travel_based"
        ? "Travel based"
        : "Non travel";
    case "exception":
      return assignment.id;
    case "period":
      return assignment.startDate.slice(0, 7);
  }
}

export function emitHrIndustryFrmAuditEvent(
  store: HrIndustryFrmStore,
  event: Omit<HrIndustryFrmAuditEvent, "id" | "occurredAt"> & {
    readonly occurredAt?: string;
  },
) {
  const row: HrIndustryFrmAuditEvent = {
    ...event,
    id: `audit-frm-${store.auditEvents.length + 1}`,
    occurredAt: event.occurredAt ?? new Date().toISOString(),
  };
  store.auditEvents.unshift(row);
  return row;
}
