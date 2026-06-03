import type {
  HrWorkforceEssAuditTargetType,
  HrWorkforceEssIntegrationExposure,
} from "./hr.workforce.ess.contract";
import {
  hrWorkforceEssAuditActions,
  type HrWorkforceEssAuditAction,
} from "./hr.workforce.ess.event";
import type {
  HrWorkforceEssAccessLogInput,
  HrWorkforceEssAcknowledgementInput,
  HrWorkforceEssApprovalInboxItemInput,
  HrWorkforceEssAssignedTaskInput,
  HrWorkforceEssAttendanceRecordInput,
  HrWorkforceEssBenefitEnrollmentInput,
  HrWorkforceEssConsentRecordInput,
  HrWorkforceEssDocumentReferenceInput,
  HrWorkforceEssEmployeeProfileInput,
  HrWorkforceEssExpenseClaimInput,
  HrWorkforceEssLeaveBalanceInput,
  HrWorkforceEssLeaveRequestInput,
  HrWorkforceEssNotificationInput,
  HrWorkforceEssOffboardingTaskInput,
  HrWorkforceEssOnboardingTaskInput,
  HrWorkforceEssPayDocumentInput,
  HrWorkforceEssProfileUpdateRequestInput,
  HrWorkforceEssRequestTrackerInput,
  HrWorkforceEssResourceCenterItemInput,
  HrWorkforceEssShiftScheduleInput,
  HrWorkforceEssTrainingRecordInput,
} from "./hr.workforce.ess.schema";
import type { HrWorkforceEssReportGroupBy } from "./hr.workforce.ess-constants.shared";

export type HrWorkforceEssAuditEvent = {
  readonly id: string;
  readonly organizationId: string;
  readonly action: HrWorkforceEssAuditAction;
  readonly actorId: string;
  readonly targetType: HrWorkforceEssAuditTargetType;
  readonly targetId: string;
  readonly employeeId?: string;
  readonly summary: string;
  readonly occurredAt: string;
};

export type HrWorkforceEssReportRow = {
  readonly id: string;
  readonly groupBy: HrWorkforceEssReportGroupBy;
  readonly group: string;
  readonly requestCount: number;
  readonly pendingTasks: number;
  readonly restrictedRecords: number;
  readonly lastActivityAt: string;
};

export type HrWorkforceEssStore = {
  employeeProfiles: HrWorkforceEssEmployeeProfileInput[];
  profileUpdates: HrWorkforceEssProfileUpdateRequestInput[];
  leaveBalances: HrWorkforceEssLeaveBalanceInput[];
  leaveRequests: HrWorkforceEssLeaveRequestInput[];
  payDocuments: HrWorkforceEssPayDocumentInput[];
  attendanceRecords: HrWorkforceEssAttendanceRecordInput[];
  shiftSchedules: HrWorkforceEssShiftScheduleInput[];
  expenseClaims: HrWorkforceEssExpenseClaimInput[];
  documents: HrWorkforceEssDocumentReferenceInput[];
  resources: HrWorkforceEssResourceCenterItemInput[];
  acknowledgements: HrWorkforceEssAcknowledgementInput[];
  assignedTasks: HrWorkforceEssAssignedTaskInput[];
  requestTracker: HrWorkforceEssRequestTrackerInput[];
  notifications: HrWorkforceEssNotificationInput[];
  approvalInbox: HrWorkforceEssApprovalInboxItemInput[];
  benefits: HrWorkforceEssBenefitEnrollmentInput[];
  trainingRecords: HrWorkforceEssTrainingRecordInput[];
  onboardingTasks: HrWorkforceEssOnboardingTaskInput[];
  offboardingTasks: HrWorkforceEssOffboardingTaskInput[];
  consentRecords: HrWorkforceEssConsentRecordInput[];
  accessLogs: HrWorkforceEssAccessLogInput[];
  auditEvents: HrWorkforceEssAuditEvent[];
};

export type HrWorkforceEssAccessFilter = {
  readonly actorUserId?: string;
  readonly canWrite: boolean;
  readonly canApprove: boolean;
  readonly canReadRestricted: boolean;
  readonly visibleEmployeeIds?: readonly string[] | null;
};

const stores = new Map<string, HrWorkforceEssStore>();

function withOrg<T extends { organizationId: string }>(
  organizationId: string,
  rows: readonly Omit<T, "organizationId">[],
): T[] {
  return rows.map((row) => ({ ...row, organizationId }) as T);
}

function date(offsetDays: number) {
  const value = new Date("2026-06-01T08:00:00.000Z");
  value.setUTCDate(value.getUTCDate() + offsetDays);
  return value.toISOString();
}

function createSeedStore(organizationId: string): HrWorkforceEssStore {
  const employeeProfiles = withOrg<HrWorkforceEssEmployeeProfileInput>(
    organizationId,
    [
      {
        id: "ess-employee-1",
        employeeNumber: "EMP-1001",
        userId: "user_ess_employee",
        displayName: "Nadia Ismail",
        preferredName: "Nadia",
        department: "Operations",
        managerUserId: "user_ess_manager",
        managerName: "Hafiz Rahman",
        jobTitle: "Operations Specialist",
        workLocation: "Kuala Lumpur",
        employmentStatus: "active",
        personalEmailMasked: "n***@example.test",
        phoneMasked: "+60 *** 1188",
        addressMasked: "Restricted",
        emergencyContactMasked: "Restricted",
        privacyTier: "standard",
        locale: "en-MY",
        lastPortalAccessAt: date(-1),
      },
      {
        id: "ess-employee-2",
        employeeNumber: "EMP-1002",
        userId: "user_ess_peer",
        displayName: "Victor Tan",
        preferredName: "Victor",
        department: "Retail",
        managerUserId: "user_ess_manager",
        managerName: "Hafiz Rahman",
        jobTitle: "Store Supervisor",
        workLocation: "Johor Bahru",
        employmentStatus: "probation",
        personalEmailMasked: "v***@example.test",
        phoneMasked: "+60 *** 2202",
        addressMasked: "Restricted",
        emergencyContactMasked: "Restricted",
        privacyTier: "payroll_sensitive",
        locale: "ms-MY",
        lastPortalAccessAt: date(-2),
      },
    ],
  );

  const profileUpdates = withOrg<HrWorkforceEssProfileUpdateRequestInput>(
    organizationId,
    [
      {
        id: "ess-profile-update-1",
        employeeId: "ess-employee-1",
        requestRef: "ESS-PROF-001",
        fieldGroup: "address",
        status: "pending_approval",
        sensitive: true,
        submittedAt: date(-3),
        approverUserId: "user_hr_partner",
      },
      {
        id: "ess-profile-update-2",
        employeeId: "ess-employee-2",
        requestRef: "ESS-PROF-002",
        fieldGroup: "phone",
        status: "returned",
        sensitive: false,
        submittedAt: date(-5),
        decidedAt: date(-4),
        approverUserId: "user_hr_partner",
        rejectionReason: "Phone format could not be verified.",
        correctionGuidance: "Resubmit with country code and active number.",
      },
    ],
  );

  const leaveBalances = withOrg<HrWorkforceEssLeaveBalanceInput>(
    organizationId,
    [
      {
        id: "ess-balance-1",
        employeeId: "ess-employee-1",
        leaveType: "annual",
        entitlementDays: 18,
        usedDays: 4,
        pendingDays: 2,
        availableDays: 12,
        period: "2026",
      },
      {
        id: "ess-balance-2",
        employeeId: "ess-employee-1",
        leaveType: "medical",
        entitlementDays: 14,
        usedDays: 1,
        pendingDays: 0,
        availableDays: 13,
        period: "2026",
      },
      {
        id: "ess-balance-3",
        employeeId: "ess-employee-2",
        leaveType: "annual",
        entitlementDays: 12,
        usedDays: 0,
        pendingDays: 1,
        availableDays: 11,
        period: "2026",
      },
    ],
  );

  const leaveRequests = withOrg<HrWorkforceEssLeaveRequestInput>(
    organizationId,
    [
      {
        id: "ess-leave-1",
        employeeId: "ess-employee-1",
        requestRef: "ESS-LV-001",
        leaveType: "annual",
        startDate: "2026-06-18",
        endDate: "2026-06-19",
        days: 2,
        status: "pending_approval",
        submittedAt: date(-2),
        approverUserId: "user_ess_manager",
      },
      {
        id: "ess-leave-2",
        employeeId: "ess-employee-2",
        requestRef: "ESS-LV-002",
        leaveType: "emergency",
        startDate: "2026-05-27",
        endDate: "2026-05-27",
        days: 1,
        status: "approved",
        submittedAt: date(-6),
        decidedAt: date(-5),
        approverUserId: "user_ess_manager",
      },
    ],
  );

  const payDocuments = withOrg<HrWorkforceEssPayDocumentInput>(
    organizationId,
    [
      {
        id: "ess-pay-1",
        employeeId: "ess-employee-1",
        documentRef: "PAY-2026-05-1001",
        documentType: "payslip",
        period: "2026-05",
        grossPayMasked: "MYR **,***.00",
        netPayMasked: "MYR **,***.00",
        authorized: true,
        privacyTier: "payroll_sensitive",
        availableAt: date(-7),
      },
      {
        id: "ess-pay-2",
        employeeId: "ess-employee-2",
        documentRef: "TAX-2026-1002",
        documentType: "tax_form",
        period: "2026",
        grossPayMasked: "MYR **,***.00",
        netPayMasked: "MYR **,***.00",
        authorized: true,
        privacyTier: "payroll_sensitive",
        availableAt: date(-8),
      },
    ],
  );

  const attendanceRecords = withOrg<HrWorkforceEssAttendanceRecordInput>(
    organizationId,
    [
      {
        id: "ess-attendance-1",
        employeeId: "ess-employee-1",
        workDate: "2026-05-29",
        clockInAt: date(-3),
        clockOutAt: date(-3),
        status: "present",
        overtimeHours: 1,
        latenessMinutes: 0,
      },
      {
        id: "ess-attendance-2",
        employeeId: "ess-employee-2",
        workDate: "2026-05-29",
        clockInAt: date(-3),
        clockOutAt: date(-3),
        status: "late",
        overtimeHours: 0,
        latenessMinutes: 12,
      },
    ],
  );

  const shiftSchedules = withOrg<HrWorkforceEssShiftScheduleInput>(
    organizationId,
    [
      {
        id: "ess-shift-1",
        employeeId: "ess-employee-1",
        scheduleDate: "2026-06-02",
        shiftName: "Day Operations",
        startsAt: date(1),
        endsAt: date(1),
        workLocation: "Kuala Lumpur",
      },
      {
        id: "ess-shift-2",
        employeeId: "ess-employee-2",
        scheduleDate: "2026-06-02",
        shiftName: "Retail Close",
        startsAt: date(1),
        endsAt: date(1),
        workLocation: "Johor Bahru",
      },
    ],
  );

  const expenseClaims = withOrg<HrWorkforceEssExpenseClaimInput>(
    organizationId,
    [
      {
        id: "ess-claim-1",
        employeeId: "ess-employee-1",
        claimRef: "ESS-CLM-001",
        claimType: "travel",
        amount: 86.5,
        currency: "MYR",
        status: "submitted",
        receiptCount: 2,
        submittedAt: date(-1),
      },
      {
        id: "ess-claim-2",
        employeeId: "ess-employee-2",
        claimRef: "ESS-CLM-002",
        claimType: "meal",
        amount: 28,
        currency: "MYR",
        status: "rejected",
        receiptCount: 1,
        submittedAt: date(-10),
        rejectionReason: "Receipt date is outside policy window.",
        correctionGuidance: "Attach manager exception approval before resubmitting.",
      },
    ],
  );

  const documents = withOrg<HrWorkforceEssDocumentReferenceInput>(
    organizationId,
    [
      {
        id: "ess-document-1",
        employeeId: "ess-employee-1",
        documentRef: "DOC-CONTRACT-1001",
        documentType: "employment_contract",
        title: "Employment contract",
        authorized: true,
        privacyTier: "identity_sensitive",
        expiresAt: date(365),
      },
      {
        id: "ess-document-2",
        employeeId: "ess-employee-2",
        documentRef: "DOC-POLICY-RET-01",
        documentType: "policy",
        title: "Retail code of conduct",
        authorized: true,
        privacyTier: "standard",
        expiresAt: date(180),
      },
    ],
  );

  const resources = withOrg<HrWorkforceEssResourceCenterItemInput>(
    organizationId,
    [
      {
        id: "ess-resource-1",
        resourceType: "handbook",
        title: "Employee handbook",
        locale: "en-MY",
        audience: "all_employees",
        effectiveAt: date(-30),
      },
      {
        id: "ess-resource-2",
        resourceType: "faq",
        title: "Benefits FAQ",
        locale: "ms-MY",
        audience: "all_employees",
        effectiveAt: date(-14),
      },
    ],
  );

  const acknowledgements = withOrg<HrWorkforceEssAcknowledgementInput>(
    organizationId,
    [
      {
        id: "ess-ack-1",
        employeeId: "ess-employee-1",
        noticeRef: "POL-REMOTE-2026",
        title: "Remote work policy acknowledgement",
        status: "pending",
        dueAt: date(5),
      },
      {
        id: "ess-ack-2",
        employeeId: "ess-employee-2",
        noticeRef: "POL-RETAIL-2026",
        title: "Retail conduct acknowledgement",
        status: "acknowledged",
        dueAt: date(2),
        acknowledgedAt: date(-1),
      },
    ],
  );

  const assignedTasks = withOrg<HrWorkforceEssAssignedTaskInput>(
    organizationId,
    [
      {
        id: "ess-task-1",
        employeeId: "ess-employee-1",
        taskType: "acknowledgement",
        title: "Acknowledge updated remote work policy",
        status: "not_started",
        dueAt: date(5),
      },
      {
        id: "ess-task-2",
        employeeId: "ess-employee-2",
        taskType: "document_submission",
        title: "Upload bank verification form",
        status: "overdue",
        dueAt: date(-1),
      },
    ],
  );

  const requestTracker = withOrg<HrWorkforceEssRequestTrackerInput>(
    organizationId,
    [
      {
        id: "ess-tracker-1",
        employeeId: "ess-employee-1",
        requestType: "leave",
        requestRef: "ESS-LV-001",
        status: "pending_approval",
        submittedAt: date(-2),
        updatedAt: date(-2),
      },
      {
        id: "ess-tracker-2",
        employeeId: "ess-employee-2",
        requestType: "claim",
        requestRef: "ESS-CLM-002",
        status: "rejected",
        submittedAt: date(-10),
        updatedAt: date(-8),
        rejectionReason: "Receipt date is outside policy window.",
        correctionGuidance: "Attach manager exception approval before resubmitting.",
      },
    ],
  );

  const notifications = withOrg<HrWorkforceEssNotificationInput>(
    organizationId,
    [
      {
        id: "ess-notification-1",
        employeeId: "ess-employee-1",
        event: "request_submitted",
        status: "delivered",
        channel: "portal",
        message: "Leave request ESS-LV-001 was submitted.",
        sentAt: date(-2),
      },
      {
        id: "ess-notification-2",
        employeeId: "ess-employee-2",
        event: "request_rejected",
        status: "read",
        channel: "email",
        message: "Claim ESS-CLM-002 was rejected with correction guidance.",
        sentAt: date(-8),
        readAt: date(-7),
      },
    ],
  );

  const approvalInbox = withOrg<HrWorkforceEssApprovalInboxItemInput>(
    organizationId,
    [
      {
        id: "ess-approval-1",
        approvalType: "leave",
        targetId: "ess-leave-1",
        employeeId: "ess-employee-1",
        employeeName: "Nadia Ismail",
        approverUserId: "user_ess_manager",
        status: "pending_approval",
        submittedAt: date(-2),
      },
      {
        id: "ess-approval-2",
        approvalType: "profile_update",
        targetId: "ess-profile-update-1",
        employeeId: "ess-employee-1",
        employeeName: "Nadia Ismail",
        approverUserId: "user_hr_partner",
        status: "pending_approval",
        submittedAt: date(-3),
      },
    ],
  );

  const benefits = withOrg<HrWorkforceEssBenefitEnrollmentInput>(
    organizationId,
    [
      {
        id: "ess-benefit-1",
        employeeId: "ess-employee-1",
        benefitName: "Medical Insurance",
        coverageSummary: "Employee plus spouse",
        dependentsCount: 1,
        status: "active",
        effectiveAt: date(-120),
      },
    ],
  );

  const trainingRecords = withOrg<HrWorkforceEssTrainingRecordInput>(
    organizationId,
    [
      {
        id: "ess-training-1",
        employeeId: "ess-employee-1",
        courseName: "Data privacy essentials",
        status: "in_progress",
        required: true,
        dueAt: date(14),
      },
      {
        id: "ess-training-2",
        employeeId: "ess-employee-2",
        courseName: "Retail safety refresher",
        status: "completed",
        required: true,
        certificateRef: "CERT-RET-1002",
        dueAt: date(-5),
        completedAt: date(-6),
      },
    ],
  );

  const onboardingTasks = withOrg<HrWorkforceEssOnboardingTaskInput>(
    organizationId,
    [
      {
        id: "ess-onboarding-1",
        employeeId: "ess-employee-2",
        title: "Submit tax declaration",
        status: "in_progress",
        dueAt: date(7),
      },
    ],
  );

  const offboardingTasks = withOrg<HrWorkforceEssOffboardingTaskInput>(
    organizationId,
    [
      {
        id: "ess-offboarding-1",
        employeeId: "ess-employee-1",
        title: "No active exit task",
        status: "waived",
        dueAt: date(90),
        clearanceOwner: "HR Operations",
      },
    ],
  );

  const consentRecords = withOrg<HrWorkforceEssConsentRecordInput>(
    organizationId,
    [
      {
        id: "ess-consent-1",
        employeeId: "ess-employee-1",
        consentType: "privacy_notice",
        status: "acknowledged",
        locale: "en-MY",
        capturedAt: date(-20),
      },
      {
        id: "ess-consent-2",
        employeeId: "ess-employee-2",
        consentType: "payroll_access",
        status: "pending",
        locale: "ms-MY",
      },
    ],
  );

  const accessLogs = withOrg<HrWorkforceEssAccessLogInput>(organizationId, [
    {
      id: "ess-access-1",
      actorUserId: "user_ess_employee",
      actorRole: "employee",
      employeeId: "ess-employee-1",
      targetType: "pay_document",
      targetId: "ess-pay-1",
      privacyTier: "payroll_sensitive",
      accessReason: "Employee viewed own payslip.",
      accessedAt: date(-1),
    },
    {
      id: "ess-access-2",
      actorUserId: "user_hr_partner",
      actorRole: "hr",
      employeeId: "ess-employee-2",
      targetType: "document",
      targetId: "ess-document-2",
      privacyTier: "standard",
      accessReason: "Returned claim review.",
      accessedAt: date(-8),
    },
  ]);

  const auditEvents = withOrg<HrWorkforceEssAuditEvent>(organizationId, [
    {
      id: "ess-audit-1",
      action: hrWorkforceEssAuditActions.portalViewed,
      actorId: "user_ess_employee",
      targetType: "profile",
      targetId: "ess-employee-1",
      employeeId: "ess-employee-1",
      summary: "Employee self-service portal viewed by Nadia Ismail.",
      occurredAt: date(-1),
    },
    {
      id: "ess-audit-2",
      action: hrWorkforceEssAuditActions.leaveRequested,
      actorId: "user_ess_employee",
      targetType: "leave_request",
      targetId: "ess-leave-1",
      employeeId: "ess-employee-1",
      summary: "Leave request ESS-LV-001 submitted.",
      occurredAt: date(-2),
    },
    {
      id: "ess-audit-3",
      action: hrWorkforceEssAuditActions.payDocumentAccessed,
      actorId: "user_ess_employee",
      targetType: "pay_document",
      targetId: "ess-pay-1",
      employeeId: "ess-employee-1",
      summary: "Authorized payslip PAY-2026-05-1001 accessed.",
      occurredAt: date(-1),
    },
  ]);

  return {
    employeeProfiles,
    profileUpdates,
    leaveBalances,
    leaveRequests,
    payDocuments,
    attendanceRecords,
    shiftSchedules,
    expenseClaims,
    documents,
    resources,
    acknowledgements,
    assignedTasks,
    requestTracker,
    notifications,
    approvalInbox,
    benefits,
    trainingRecords,
    onboardingTasks,
    offboardingTasks,
    consentRecords,
    accessLogs,
    auditEvents,
  };
}

export function getHrWorkforceEssStore(
  organizationId: string,
): HrWorkforceEssStore {
  const existing = stores.get(organizationId);
  if (existing) return existing;
  const store = createSeedStore(organizationId);
  stores.set(organizationId, store);
  return store;
}

export function resetHrWorkforceEssStore(
  organizationId: string,
): HrWorkforceEssStore {
  const store = createSeedStore(organizationId);
  stores.set(organizationId, store);
  return store;
}

export function nextHrWorkforceEssId(
  prefix: string,
  rows: readonly { readonly id: string }[],
) {
  return `${prefix}-${rows.length + 1}`;
}

export function emitHrWorkforceEssAuditEvent(
  store: HrWorkforceEssStore,
  input: Omit<HrWorkforceEssAuditEvent, "id" | "organizationId" | "occurredAt"> & {
    readonly organizationId: string;
    readonly occurredAt?: string;
  },
) {
  const event: HrWorkforceEssAuditEvent = {
    ...input,
    id: nextHrWorkforceEssId("ess-audit", store.auditEvents),
    organizationId: input.organizationId,
    occurredAt: input.occurredAt ?? new Date().toISOString(),
  };
  store.auditEvents.unshift(event);
  return event;
}

function visibleEmployeeProfileIds(input: {
  readonly profiles: readonly HrWorkforceEssEmployeeProfileInput[];
  readonly actorUserId?: string;
  readonly canApprove: boolean;
  readonly canReadRestricted: boolean;
  readonly visibleEmployeeIds?: readonly string[] | null;
}) {
  if (input.visibleEmployeeIds === null && input.canReadRestricted) {
    return null;
  }

  const explicitVisible = new Set(input.visibleEmployeeIds ?? []);
  const visibleProfileIds = new Set<string>();

  for (const row of input.profiles) {
    if (explicitVisible.has(row.id) || explicitVisible.has(row.userId)) {
      visibleProfileIds.add(row.id);
    }
    if (input.actorUserId && row.userId === input.actorUserId) {
      visibleProfileIds.add(row.id);
    }
    if (input.canApprove && input.actorUserId === row.managerUserId) {
      visibleProfileIds.add(row.id);
    }
  }

  return visibleProfileIds;
}

function employeeVisible(employeeId: string, visibleIds: ReadonlySet<string> | null) {
  return visibleIds === null || visibleIds.has(employeeId);
}

function maskProfile(
  row: HrWorkforceEssEmployeeProfileInput,
): HrWorkforceEssEmployeeProfileInput {
  if (row.privacyTier === "standard" || row.privacyTier === "public") return row;
  return {
    ...row,
    personalEmailMasked: "Restricted",
    phoneMasked: "Restricted",
    addressMasked: "Restricted",
    emergencyContactMasked: "Restricted",
  };
}

function maskPayDocument(
  row: HrWorkforceEssPayDocumentInput,
): HrWorkforceEssPayDocumentInput {
  return {
    ...row,
    grossPayMasked: "Restricted",
    netPayMasked: "Restricted",
  };
}

function maskDocument(
  row: HrWorkforceEssDocumentReferenceInput,
): HrWorkforceEssDocumentReferenceInput {
  if (row.privacyTier === "standard" || row.privacyTier === "public") return row;
  return {
    ...row,
    title: "Restricted document",
  };
}

function employeeRows<T extends { readonly employeeId: string }>(
  rows: readonly T[],
  visibleIds: ReadonlySet<string> | null,
) {
  return rows.filter((row) => employeeVisible(row.employeeId, visibleIds));
}

export function filterHrWorkforceEssRecordsForAccess(input: {
  readonly store: HrWorkforceEssStore;
  readonly access: HrWorkforceEssAccessFilter;
}): HrWorkforceEssStore {
  const { store, access } = input;
  const visibleIds = visibleEmployeeProfileIds({
    profiles: store.employeeProfiles,
    actorUserId: access.actorUserId,
    canApprove: access.canApprove,
    canReadRestricted: access.canReadRestricted,
    visibleEmployeeIds: access.visibleEmployeeIds,
  });

  const employeeProfiles = store.employeeProfiles
    .filter((row) => employeeVisible(row.id, visibleIds))
    .map((row) => (access.canReadRestricted ? row : maskProfile(row)));

  return {
    employeeProfiles,
    profileUpdates: employeeRows(store.profileUpdates, visibleIds),
    leaveBalances: employeeRows(store.leaveBalances, visibleIds),
    leaveRequests: employeeRows(store.leaveRequests, visibleIds),
    payDocuments: employeeRows(store.payDocuments, visibleIds).map((row) =>
      access.canReadRestricted ? row : maskPayDocument(row),
    ),
    attendanceRecords: employeeRows(store.attendanceRecords, visibleIds),
    shiftSchedules: employeeRows(store.shiftSchedules, visibleIds),
    expenseClaims: employeeRows(store.expenseClaims, visibleIds),
    documents: employeeRows(store.documents, visibleIds)
      .filter((row) => row.authorized)
      .map((row) => (access.canReadRestricted ? row : maskDocument(row))),
    resources: [...store.resources],
    acknowledgements: employeeRows(store.acknowledgements, visibleIds),
    assignedTasks: employeeRows(store.assignedTasks, visibleIds),
    requestTracker: employeeRows(store.requestTracker, visibleIds),
    notifications: employeeRows(store.notifications, visibleIds),
    approvalInbox:
      access.canApprove
        ? store.approvalInbox.filter(
            (row) =>
              row.approverUserId === access.actorUserId ||
              (visibleIds === null && employeeVisible(row.employeeId, visibleIds)),
          )
        : [],
    benefits: employeeRows(store.benefits, visibleIds),
    trainingRecords: employeeRows(store.trainingRecords, visibleIds),
    onboardingTasks: employeeRows(store.onboardingTasks, visibleIds),
    offboardingTasks: employeeRows(store.offboardingTasks, visibleIds),
    consentRecords: employeeRows(store.consentRecords, visibleIds),
    accessLogs: access.canReadRestricted
      ? employeeRows(store.accessLogs, visibleIds)
      : [],
    auditEvents: store.auditEvents.filter(
      (row) => !row.employeeId || employeeVisible(row.employeeId, visibleIds),
    ),
  };
}

function groupValue(input: {
  readonly groupBy: HrWorkforceEssReportGroupBy;
  readonly request: HrWorkforceEssRequestTrackerInput;
  readonly profile?: HrWorkforceEssEmployeeProfileInput;
  readonly document?: HrWorkforceEssDocumentReferenceInput;
}) {
  switch (input.groupBy) {
    case "employee":
      return input.profile?.displayName ?? input.request.employeeId;
    case "status":
      return input.request.status;
    case "request_type":
      return input.request.requestType;
    case "department":
      return input.profile?.department ?? "Unassigned";
    case "period":
      return input.request.submittedAt.slice(0, 7);
    case "privacy":
      return input.document?.privacyTier ?? input.profile?.privacyTier ?? "standard";
  }
}

export function buildHrWorkforceEssReportRows(input: {
  readonly store: HrWorkforceEssStore;
  readonly groupBy: HrWorkforceEssReportGroupBy;
}): HrWorkforceEssReportRow[] {
  const profiles = new Map(
    input.store.employeeProfiles.map((row) => [row.id, row]),
  );
  const documents = new Map(
    input.store.documents.map((row) => [row.employeeId, row]),
  );
  const groups = new Map<string, HrWorkforceEssRequestTrackerInput[]>();

  for (const request of input.store.requestTracker) {
    const group = groupValue({
      groupBy: input.groupBy,
      request,
      profile: profiles.get(request.employeeId),
      document: documents.get(request.employeeId),
    });
    groups.set(group, [...(groups.get(group) ?? []), request]);
  }

  return [...groups.entries()].map(([group, rows]) => ({
    id: `ess-report-${input.groupBy}-${group.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`,
    groupBy: input.groupBy,
    group,
    requestCount: rows.length,
    pendingTasks: input.store.assignedTasks.filter(
      (task) =>
        task.status !== "completed" &&
        rows.some((row) => row.employeeId === task.employeeId),
    ).length,
    restrictedRecords: rows.filter(
      (row) => profiles.get(row.employeeId)?.privacyTier !== "standard",
    ).length,
    lastActivityAt:
      rows
        .map((row) => row.updatedAt)
        .sort()
        .at(-1) ?? date(0),
  }));
}

export function listHrWorkforceEssIntegrationExposures(
  store: HrWorkforceEssStore,
): HrWorkforceEssIntegrationExposure[] {
  return [
    ...store.profileUpdates.map((row) => ({
      ref: row.requestRef,
      targetType: "profile_update" as const,
      targetId: row.id,
      summary: `Profile update ${row.requestRef} is ${row.status}.`,
      exposedAt: row.decidedAt ?? row.submittedAt,
    })),
    ...store.leaveRequests.map((row) => ({
      ref: row.requestRef,
      targetType: "leave_request" as const,
      targetId: row.id,
      summary: `Leave request ${row.requestRef} is ${row.status}.`,
      exposedAt: row.decidedAt ?? row.submittedAt,
    })),
    ...store.expenseClaims.map((row) => ({
      ref: row.claimRef,
      targetType: "claim" as const,
      targetId: row.id,
      summary: `Claim ${row.claimRef} is ${row.status}.`,
      exposedAt: row.reimbursedAt ?? row.submittedAt,
    })),
    ...store.assignedTasks.map((row) => ({
      ref: row.id,
      targetType: "task" as const,
      targetId: row.id,
      summary: `Task ${row.title} is ${row.status}.`,
      exposedAt: row.completedAt ?? row.dueAt ?? date(0),
    })),
    ...store.documents.map((row) => ({
      ref: row.documentRef,
      targetType: "document" as const,
      targetId: row.id,
      summary: `${row.title} is ${row.authorized ? "authorized" : "restricted"}.`,
      exposedAt: row.downloadedAt ?? row.expiresAt ?? date(0),
    })),
  ];
}
